'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {

  let app = new EmberAddon(defaults, {
    snippetPaths: ['tests/dummy/app/snippets'],

    'ember-bootstrap': {
      'bootstrapVersion': 4,
      'importBootstrapFont': false,
      'importBootstrapCSS': false
    }
  });

  return app.toTree();
};
