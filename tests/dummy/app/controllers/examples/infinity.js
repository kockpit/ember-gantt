import Controller from '@ember/controller';
import ExampleController from '../../mixins/example-controller';

export default Controller.extend(ExampleController, {

  actions: {

    viewDateChange(startDate, endDate) {
      /* eslint-disable */

      console.log(startDate, 'start view date changed');
      console.log(endDate, ' end view date changed');

      /* eslint-enable */
    }

  }
});
