const tseslint = require('typescript-eslint');
const importX = require('eslint-plugin-import-x');
const unusedImports = require('eslint-plugin-unused-imports');
const fs = require('fs');

module.exports = tseslint.config(
  {
    ignores: fs
      .readFileSync('.gitignore', 'utf8')
      .split('\n')
      .filter(Boolean)
      .filter((line) => !line.startsWith('#')),
  },
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      'import-x': importX,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      'unused-imports/no-unused-imports': 'error',
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            { target: './src/domain', from: './src/adapter' },
            { target: './src/domain/entities', from: './src/domain/usecases' },
            {
              target: './src/adapter/repositories',
              from: './src/adapter/entry-points',
            },
          ],
        },
      ],
    },
  },
);
