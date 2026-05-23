/* eslint-disable unicorn/prefer-module */
'use strict';

const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const process = require('node:process');
const { spawn } = require('node:child_process');
const fs = require('fs-extra');
const chokidar = require('chokidar');
const babel = require('@babel/core');
const { minify } = require('terser');
const posthtml = require('posthtml');
const sass = require('sass');
const postcss = require('postcss');
const pxtorpx = require('postcss-pxtorpx-pro');
const url = require('postcss-url');
const rollup = require('rollup');
const { default: replace } = require('@rollup/plugin-replace');
const { default: terser } = require('@rollup/plugin-terser');
const { default: resolve } = require('@rollup/plugin-node-resolve');

const NODE_ENV = process.env.NODE_ENV || 'production';
const __PROD__ = NODE_ENV === 'production';
const localPath = `http://${getLocalIP()}:3000/`;
const publicPath = 'https://your.static.server/';
const terserOptions = { ecma: 2015, toplevel: true, safari10: true };

process.on('unhandledRejection', (error) => {
  throw error;
});

function getLocalIP() {
  const ifaces = Object.values(os.networkInterfaces());
  for (const iface of ifaces) {
    for (const alias of iface) {
      if (alias.internal || alias.family !== 'IPv4') continue;
      return alias.address;
    }
  }
}

function getImagePathWithHash(imagePath, originPath) {
  const buffer = fs.readFileSync(imagePath);
  const hash = crypto
    .createHash('md5')
    .update(buffer)
    .digest('hex')
    .slice(0, 8);
  return originPath.replace(/\.(png|jpe?g|gif|svg)$/, `.${hash}.$1`);
}

const bundledModules = new Set();
async function bundleModule(module) {
  if (bundledModules.has(module)) return;
  bundledModules.add(module);

  if (module === 'regenerator-runtime') {
    const filePath = require.resolve(module);
    const destination = `dist/miniprogram_npm/${module}/index.js`;
    // Make sure the directory already exists when write file in production build
    await fs.copy(filePath, destination);

    if (__PROD__) {
      fs.writeFile(
        destination,
        // eslint-disable-next-line unicorn/no-await-expression-member
        (await minify(await fs.readFile(filePath, 'utf8'), terserOptions)).code,
      );
    }

    return;
  }

  let pkg;
  try {
    pkg = require(`${module}/package.json`);
  } catch {}

  if (pkg && !pkg.module) {
    throw new Error(`Can't found esm bundle of ${module}`);
  }

  let entry = pkg
    ? path.join(
        path.dirname(require.resolve(`${module}/package.json`)),
        pkg.module,
      )
    : require.resolve(module);

  if (module.startsWith('@babel/runtime/')) {
    const paths = entry.split(path.sep);
    paths.splice(-1, 0, 'esm');
    // Path.join 在 POSIX OS 上会返回 'root/**' 而非正确的 '/root/**'，所以不能使用。
    entry = paths.join(path.sep);
  }

  const bundle = await rollup.rollup({
    input: entry,
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        },
      }),
      resolve(),
      __PROD__ && terser(terserOptions),
    ].filter(Boolean),
  });
  bundle.write({
    exports: 'named',
    file: `dist/miniprogram_npm/${module}/index.js`,
    format: 'cjs',
  });
}

async function processScript(filePath) {
  let { code } = await babel.transformFileAsync(path.resolve(filePath));
  for (const [, module] of code.matchAll(/require\("(.+?)"\)/g)) {
    if (module.startsWith('.')) continue;
    bundleModule(module);
  }

  if (__PROD__) {
    // eslint-disable-next-line unicorn/no-await-expression-member
    code = (await minify(code, terserOptions)).code;
  }

  const destination = filePath.replace('src', 'dist').replace(/\.ts$/, '.js');
  // Make sure the directory already exists when write file
  await fs.copy(filePath, destination);
  fs.writeFile(destination, code);
}

async function processTemplate(filePath, origin = localPath) {
  const source = await fs.readFile(filePath, 'utf8');
  const { html } = await posthtml()
    .use((tree) => {
      tree.match([{ tag: 'image' }, { tag: 'cover-image' }], (node) => {
        const { src } = node.attrs;
        if (
          /^{{.*}}$/.test(src) ||
          /^https?:\/\//.test(src) ||
          src.startsWith('data:') ||
          src.includes('/assets/')
        ) {
          return node;
        }

        const absolutePath = src.startsWith('/')
          ? path.resolve('src', src.slice(1))
          : path.resolve(path.dirname(filePath), src);
        const href =
          origin + path.relative('src', absolutePath).replaceAll('\\', '/');
        node.attrs.src = __PROD__
          ? getImagePathWithHash(absolutePath, href)
          : href;
        return node;
      });
    })
    .process(source, { xmlMode: true, singleTags: [/<>/] });
  const destination = filePath.replace('src', 'dist');
  // Make sure the directory already exists when write file
  await fs.copy(filePath, destination);
  fs.writeFile(destination, html);
}

async function processStyle(filePath, origin = localPath) {
  let source = await fs.readFile(filePath, 'utf8');
  
  // 如果是 SCSS 文件，先编译为 CSS
  if (filePath.endsWith('.scss')) {
    try {
      const result = sass.compileString(source, {
        loadPaths: [
          path.dirname(filePath),
          path.resolve('src'),
          path.resolve('src/styles')
        ],
        style: __PROD__ ? 'compressed' : 'expanded',
      });
      source = result.css;
    } catch (error) {
      console.error(`Failed to compile SCSS ${filePath}`);
      
      if (__PROD__) throw error;
      
      console.error(error);
      return;
    }
  } else if (filePath.endsWith('.less')) {
    // 保持对 less 的兼容性
    const less = require('less');
    source =
      `@import '${path.resolve('src/styles/variables.less')}';
` +
      `@import '${path.resolve('src/styles/mixins.less')}';
` +
      source;
    const { css } = await less.render(source, {
      filename: path.resolve(filePath),
    });
    source = css;
  }
  
  const { css: wxss } = await postcss()
    .use(pxtorpx({ minPixelValue: 2, transform: (x) => x }))
    .use(
      url({
        url(asset) {
          if (/^https?:\/\//.test(asset.url) || asset.url.startsWith('data:')) {
            return asset.url;
          }

          const absolutePath = asset.url.startsWith('/')
            ? path.resolve('src', asset.url.slice(1))
            : path.resolve(path.dirname(filePath), asset.url);
          const href =
            origin + path.relative('src', absolutePath).replaceAll('\\', '/');
          return __PROD__ ? getImagePathWithHash(absolutePath, href) : href;
        },
      }),
    )
    .process(source, { map: false, from: undefined });
  
  const destination = filePath
    .replace('src', 'dist')
    .replace(/\.(less|scss|css)$/, '.wxss');
  
  // 确保目录存在
  await fs.ensureDir(path.dirname(destination));
  await fs.writeFile(destination, wxss);
}

function recompileStyles() {
  const watcher = chokidar.watch([
    'src/**/*.less',
    'src/**/*.scss',
    'src/**/*.css',
    '!src/styles/**/*'
  ]);
  watcher.on('add', (filePath) => {
    processStyle(filePath);
  });
  watcher.on('ready', () => watcher.close());
}

async function dev() {
  await fs.remove('dist');
  const cb = async (filePath) => {
    if (/\.ts$/.test(filePath)) {
      await processScript(filePath);
      return;
    }

    if (/\.wxml$/.test(filePath)) {
      await processTemplate(filePath);
      return;
    }

    if (/\.(less|scss|css)$/.test(filePath)) {
      await processStyle(filePath);
      return;
    }

    // 不复制 SCSS 源文件到 dist 目录
    if (!filePath.endsWith('.scss')) {
      await fs.copy(filePath, filePath.replace('src', 'dist'));
    }
  };

  chokidar
    .watch(['src', '!src/images/**/*'], {
      ignored: ['**/.{gitkeep,DS_Store}'],
    })
    .on('add', (filePath) => {
      if (filePath.includes(path.join('src', 'styles'))) return;
      cb(filePath);
    })
    .on('change', (filePath) => {
      if (filePath.includes(path.join('src', 'styles'))) {
        recompileStyles();
        return;
      }

      cb(filePath);
    });
}

async function prod() {
  await fs.remove('dist');
  await fs.remove('temp');
  const watcher = chokidar.watch(['src', '!src/styles/**/*'], {
    ignored: ['**/.{gitkeep,DS_Store}'],
  });
  watcher.on('add', async (filePath) => {
    if (/\.ts$/.test(filePath)) {
      await processScript(filePath);
      return;
    }

    if (/\.wxml$/.test(filePath)) {
      await processTemplate(filePath, publicPath);
      return;
    }

    if (/\.(less|scss|css)$/.test(filePath)) {
      await processStyle(filePath, publicPath);
      return;
    }

    if (filePath.includes(path.join('src', 'images'))) {
      await fs.copy(
        filePath,
        getImagePathWithHash(filePath, filePath.replace('src', 'temp')),
      );
      return;
    }

    // 不复制 SCSS 源文件到 dist 目录
    if (!filePath.endsWith('.scss')) {
      await fs.copy(filePath, filePath.replace('src', 'dist'));
    }
  });
  watcher.on('ready', () => watcher.close());
}

if (__PROD__) {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  prod();
} else {
  spawn('serve', ['src'], { stdio: 'inherit', shell: true });
  // eslint-disable-next-line unicorn/prefer-top-level-await
  dev();
}