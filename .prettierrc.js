const fabric = require('@umijs/fabric');

module.exports = {
  ...fabric.prettier,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  overrides: [
    {
      files: '.prettierrc',
      options: { parser: 'json' },
    },
  ],
};
