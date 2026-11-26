// Stylelint: CSS de la web (Tailwind 4) y del tema de PrestaShop.
// Ejecutar con `pnpm lint:css`.
/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    'apps/tienda/theme/zement/assets/cache/**',
    // Copias generadas desde packages/design-tokens.
    'apps/tienda/theme/zement/assets/css/tokens.css',
    'apps/tienda/theme/zement/assets/css/fonts.css',
    // Copia generada desde packages/consent.
    'apps/tienda/modules/zementcommerce/views/consent/**',
  ],
  rules: {
    // Directivas propias de Tailwind 4.
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'theme',
          'utility',
          'variant',
          'custom-variant',
          'apply',
          'reference',
          'config',
          'source',
          'plugin',
        ],
      },
    ],
    'at-rule-no-deprecated': [true, { ignoreAtRules: ['apply'] }],
    'at-rule-prelude-no-invalid': null,
    'value-keyword-case': ['lower', { ignoreProperties: [/^--zm-font/, 'font-family'] }],
    'import-notation': 'string',
    // Prefijos de marca: --zm-* (tokens), --bs-* (Bootstrap de PrestaShop).
    'custom-property-pattern': null,
    // Clases BEM de PrestaShop (header-top__left, footer__main…).
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'declaration-no-important': null,
    'font-family-name-quotes': 'always-unless-keyword',
    'color-hex-length': 'short',
    'selector-max-id': 1,
    'max-nesting-depth': 2,
  },
};
