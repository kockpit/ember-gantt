
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
      set(this, 'dayWidth', parseInt(get(this, 'dayWidth')) + parseInt(value) );
    },

    collapse(project) {
      project.toggleProperty('collapsed');
    },
    datesChanged(job, start, end, action) {
      console.log(start, 'start changed');
      console.log(end, 'end changed');
      console.log(action, 'action');
      set(job, 'dateStart', start);
      set(job, 'dateEnd', end);
    }
  }

});
