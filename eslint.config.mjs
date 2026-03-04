import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
  .override('nuxt/rules', {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    }
  })
  .prepend({
    files: ['**/*.vue'],
    languageOptions: {
      parser: await import('vue-eslint-parser'),
      parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module'
      }
    }
  })
  .append({
    ignores: [
      '.output/**/*',
      '.nuxt/**/*'
    ]
  })
