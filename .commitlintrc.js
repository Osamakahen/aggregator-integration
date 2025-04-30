module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'revert',
        'perf',
        'ci',
        'build'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'wallet',
        'marketplace',
        'security',
        'session',
        'ui',
        'api',
        'contracts',
        'deps',
        'config'
      ]
    ],
    'scope-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always']
  }
}; 