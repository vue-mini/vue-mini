'use strict'

const fs = require('fs-extra')
const rollup = require('rollup')
const replace = require('@rollup/plugin-replace')
const typescript = require('rollup-plugin-typescript2')
const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')

const input = 'src/index.ts'
const external = ['@next-vue/reactivity']

async function generateDeclaration() {
  const bundle = await rollup.rollup({
    input,
    external,
    plugins: [
      typescript({
        check: false,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationMap: true
          }
        }
      })
    ]
  })
  await bundle.write({
    file: 'dist/temp/vue-mini.esm.js',
    format: 'es'
  })
}

async function generateCode({ isDev, format, fileName, vuePath }) {
  const bundle = await rollup.rollup({
    input,
    external,
    plugins: [typescript({ check: false }), replace({ __DEV__: isDev })]
  })
  const { output } = await bundle.generate({ format })
  for (const chunkOrAsset of output) {
    if (chunkOrAsset.type === 'chunk') {
      const code = chunkOrAsset.code.replace(/@next-vue\/reactivity/g, vuePath)
      // eslint-disable-next-line no-await-in-loop
      await fs.writeFile(`dist/${fileName}`, code, 'utf8')
    }
  }
}

async function build() {
  await fs.remove('dist')

  await generateDeclaration()

  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    'api-extractor.json'
  )
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true
  })

  if (extractorResult.succeeded) {
    console.error(`API Extractor completed successfully`)
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    )
    process.exitCode = 1
  }

  await fs.remove('dist/temp')

  await generateCode({
    isDev: true,
    format: 'es',
    fileName: 'vue-mini.esm.js',
    vuePath: '@next-vue/reactivity/dist/reactivity.esm'
  })

  await generateCode({
    isDev: false,
    format: 'es',
    fileName: 'vue-mini.esm.prod.js',
    vuePath: '@next-vue/reactivity/dist/reactivity.esm.prod'
  })

  await generateCode({
    isDev: true,
    format: 'cjs',
    fileName: 'vue-mini.cjs.js',
    vuePath: '@next-vue/reactivity/dist/reactivity.cjs'
  })

  await generateCode({
    isDev: false,
    format: 'cjs',
    fileName: 'vue-mini.cjs.prod.js',
    vuePath: '@next-vue/reactivity/dist/reactivity.cjs.prod'
  })
}

build()
