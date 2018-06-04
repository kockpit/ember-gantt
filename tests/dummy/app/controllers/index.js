
import { set, get } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({

  dayWidth: 20,

  view: 'day',

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
    datesChanged(job, start, end, action) {
      // console.log(job, 'job ref');
      // console.log(start, 'start changed');
      // console.log(end, 'end changed');
      // console.log(action, 'action');

      set(job, 'dateStart', start); // NOT NEEDED -> is set directly
      set(job, 'dateEnd', end);
    }
  }

});
