import Controller from '@ember/controller';
import { set } from '@ember/object';

export default Controller.extend({

  dayWidth: 20,

  view: 'day',

  viewStartDate: null,
  viewEndDate: null,

  init() {
    this._super(...arguments);

    // start-end date


  },

  actions: {
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
    }
  }

});
