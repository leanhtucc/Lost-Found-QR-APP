module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['fix', 'feat', 'perf', 'docs', 'style', 'refactor', 'test', 'chore'],
    ],
  },
};
