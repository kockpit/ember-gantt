import Mixin from '@ember/object/mixin';
import {set,get} from '@ember/object';

export default Mixin.create({

  dayWidth: 20,

  viewStartDate: null,
  viewEndDate: null,

  init() {
    this._super(...arguments);

    // start-end date
    let today = new Date();
    today.setDate(today.getDate() - 10);
    set(this, 'viewStartDate', today);
    // end date is set to 3 months after automatically
  },

  actions: {
    zoom(value) {
      let newDayWidth = Math.max(1, parseInt(get(this, 'dayWidth')) + parseInt(value) );
      set(this, 'dayWidth', newDayWidth);
    },

    collapse(project) {
      project.toggleProperty('collapsed');
    },
  }

});
