// BEGIN-SNIPPET 1-standard-example
import Controller from '@ember/controller';

export default Controller.create({

  dayWidth: 20,

  actions: {

    zoom(value) {
      let dayWidth = parseInt(get(this, 'dayWidth'));
      let newDayWidth = Math.max(1,  dayWidth + parseInt(value) );

      set(this, 'dayWidth', newDayWidth);
    }

  }

});
// END-SNIPPET
