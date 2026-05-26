import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    markdown: true,
  },
  {
    files: ['**/*.md/**/*.ts'],
    rules: {
      'ts/consistent-type-definitions': 'off',
    },
  },
)
