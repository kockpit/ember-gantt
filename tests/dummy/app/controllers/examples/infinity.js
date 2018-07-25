import Controller from '@ember/controller';
import ExampleController from '../../mixins/example-controller';
import dateUtil from '@kockpit/ember-gantt/utils/date-util';

export default Controller.extend(ExampleController, {

  goDate: null,

  init() {
    this._super(...arguments);

    let today = dateUtil.getNewDate();
    this.set('goDate', today);
  },

  actions: {

    viewDateChange(startDate, endDate) {
      /* eslint-disable */

      console.log(startDate, 'start view date changed');
      console.log(endDate, ' end view date changed');

      /* eslint-enable */
    },

    goToDate(date) {
      date = date || dateUtil.getNewDate();
      this.set('goDate', date);
    }

  }
});
