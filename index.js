'use strict';

module.exports = {

  name: '@kockpit/ember-gantt',
  //name: require('./package').name

  included: function(app)  {
    this._super.included.apply(this, arguments);

    // TODO make optional
    // as e.g. in https://github.com/cibernox/ember-power-select/blob/master/index.js
    app.import('vendor/ember-gantt.css');
  }

};
