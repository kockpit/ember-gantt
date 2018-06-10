'use strict';

module.exports = {
  name: '@kockpit/ember-gantt',

  // afterInstall: function() {
  //   // return this.addAddonToProject('ember-cli-moment-shim', '^3.4.0'); // TODO remove, should be optional !
  // },

  included: function(app)  {
    this._super.included.apply(this, arguments);

    // TODO make optional
    // as e.g. in https://github.com/cibernox/ember-power-select/blob/master/index.js
    app.import('vendor/ember-gantt.css');
  }
};
