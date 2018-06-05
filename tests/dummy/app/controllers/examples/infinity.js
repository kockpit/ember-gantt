import Controller from '@ember/controller';
import {get,set} from '@ember/object';

export default Controller.extend({

  dayWidth: 20,


  actions: {

    zoom(value) {
      let newDayWidth = Math.max(1, parseInt(get(this, 'dayWidth')) + parseInt(value) );
      set(this, 'dayWidth', newDayWidth);
    },

    collapse(project) {
      project.toggleProperty('collapsed');
    },

    viewDateChange(/*startDate, endDate*/) {
      // console.log(startDate, 'start view date changed');
      // console.log(endDate, ' end view date changed');
    }

  }
});
