
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
      set(this, 'dayWidth', (get(this, 'dayWidth') + value) );
    },
    setView(view) {
      let dayWidth = 20;

      switch(view) {
        case 'week': dayWidth = 5; break;
        case 'month': dayWidth = 1; break;
        default:
          dayWidth = 20;
          view = 'day';
          break;
      }

      set(this, 'dayWidth', dayWidth);
      set(this, 'view', view);
    },

    collapse(project) {
      project.toggleProperty('collapsed');
    }
  }

});
