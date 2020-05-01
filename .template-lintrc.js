/* eslint-env node */
'use strict';

module.exports = {
  extends: 'octane', // was 'recommended'
  rules: {
    'quotes': false,
    'no-inline-styles': false,
    'no-invalid-interactive': false
  },
  ignore: [
    'tests/dummy/app/snippets/*',
  ]

};
