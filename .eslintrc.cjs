module.exports = {
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/prop-types': 'off'
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ]
}
