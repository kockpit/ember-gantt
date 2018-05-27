'use strict';

module.exports = {
  name: 'ember-gantt',


  afterInstall: function() {
    return this.addAddonToProject('ember-cli-moment-shim', '^3.4.0'); // TODO remove, should be optional !
  }
};
