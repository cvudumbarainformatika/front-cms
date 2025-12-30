// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // Your custom configs here
   rules: {
    // Vue
    'vue/multi-word-component-names': 'off',

    // TypeScript
    '@typescript-eslint/no-unused-vars': 'warn',

    // Prettier
    'prettier/prettier': 'warn',
  },
})
