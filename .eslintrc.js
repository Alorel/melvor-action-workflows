module.exports = {
  extends: [
    '@alorel/eslint-config-base',
    '@alorel/eslint-config-typescript'
  ],
  ignorePatterns: [
    '**/.eslintrc.js',
    '/dist',
    '/coverage',
    '/**/*.d.ts',
    '/tmp.ts',
    '/tmp.js',
    '/tmp.mjs',
    '/rollup*.config.js',
    '/build'
  ],
  root: true,
  parserOptions: {
    project: require('path').join(__dirname, 'tsconfig.json')
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': err({prefer: 'type-imports'}),
    'no-duplicate-imports': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'comma-dangle': 'off',
    'no-nested-ternary': 'off',
    'consistent-return': 'off',
    '@typescript-eslint/comma-dangle': err({
      enums: 'always-multiline',
      generics: 'never',
      tuples: 'always-multiline',
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'never',
      exports: 'never',
      functions: 'never'
    }),
    'prefer-rest-params': 'off',
  }
};

/** Shorthand for making an error rule value. Omit param to skip the rule's optional params */
function err() {
  return value('error', ...Array.from(arguments));
}

function value(severity, ...opts) {
  return opts.length ? [severity, ...opts] : severity;
}
