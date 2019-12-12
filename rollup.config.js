import typescript from 'rollup-plugin-typescript2'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/vue-mini.esm.js',
      format: 'es'
    },
    {
      file: 'dist/vue-mini.cjs.js',
      format: 'cjs'
    }
  ],
  external: ['@next-vue/reactivity'],
  plugins: [typescript({ check: false })]
}
