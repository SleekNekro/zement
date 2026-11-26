// ESLint (flat config): TypeScript + Astro + accesibilidad.
// Ejecutar con `pnpm lint:js` (o `pnpm lint:fix`). El formato lo decide Prettier, no ESLint.
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      'apps/tienda/theme/zement/assets/cache/**',
      'apps/tienda/**/*.min.js',
      // Herramientas locales del editor (no se publican).
      '.claude/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-strict'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      curly: ['error', 'multi-line'],
      'object-shorthand': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Scripts de herramientas en Node (sincronización de tokens, despliegue…).
    files: ['**/*.mjs', 'packages/**/*.js', 'scripts/**/*.js'],
    rules: { 'no-console': 'off' },
  },
);
