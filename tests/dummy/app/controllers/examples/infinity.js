import Controller from '@ember/controller';
import ExampleController from '../../mixins/example-controller';
import {set} from '@ember/object';

import dateUtil from '@kockpit/ember-gantt/utils/date-util';


export default Controller.extend(ExampleController, {

  actions: {

    viewDateChange(startDate, endDate) {
      console.log(startDate, 'start view date changed');
      console.log(endDate, ' end view date changed');
    }

  }
});
