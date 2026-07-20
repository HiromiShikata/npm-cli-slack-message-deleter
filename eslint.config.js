const babelParser = require('@babel/eslint-parser');
const importX = require('eslint-plugin-import-x');
const fs = require('fs');

module.exports = [
  {
    ignores: fs
      .readFileSync('.gitignore', 'utf8')
      .split('\n')
      .filter(Boolean)
      .filter((line) => !line.startsWith('#')),
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: ['@babel/plugin-syntax-typescript'],
        },
      },
    },
    plugins: {
      'import-x': importX,
    },
    rules: {
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
];
