'use strict'

const fs = require('fs-extra')
const rollup = require('rollup')
const replace = require('@rollup/plugin-replace')
const typescript = require('rollup-plugin-typescript2')
const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')

const input = 'src/index.ts'

async function generateDeclaration() {
  const bundle = await rollup.rollup({
    input,
    external: ['@next-vue/reactivity'],
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

async function generateCode({ isDev, format, fileName, vueReactivityPath }) {
  const bundle = await rollup.rollup({
    input,
    external: [vueReactivityPath],
    plugins: [
      typescript({ check: false }),
      replace({
        __DEV__: isDev,
        '@next-vue/reactivity': vueReactivityPath,
        delimiters: ['', '']
      })
    ]
  })
  await bundle.write({ file: `dist/${fileName}`, format })
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
    vueReactivityPath: '@next-vue/reactivity/dist/reactivity.esm'
  })

  await generateCode({
    isDev: false,
    format: 'es',
    fileName: 'vue-mini.esm.prod.js',
    vueReactivityPath: '@next-vue/reactivity/dist/reactivity.esm.prod'
  })

  await generateCode({
    isDev: true,
    format: 'cjs',
    fileName: 'vue-mini.cjs.js',
    vueReactivityPath: '@next-vue/reactivity/dist/reactivity.cjs'
  })

  await generateCode({
    isDev: false,
    format: 'cjs',
    fileName: 'vue-mini.cjs.prod.js',
    vueReactivityPath: '@next-vue/reactivity/dist/reactivity.cjs.prod'
  })
}

build()
