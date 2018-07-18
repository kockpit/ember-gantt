
import { set, get } from '@ember/object';
import Controller from '@ember/controller';
import ExampleController from '../mixins/example-controller';

export default Controller.extend(ExampleController, {

  actions: {
    datesChanged(job, start, end,/* action*/) {
      // console.log(job, 'job ref');
      // console.log(start, 'start changed');
      // console.log(end, 'end changed');
      // console.log(action, 'action');

      set(job, 'dateStart', start); // NOT NEEDED -> is set directly
      set(job, 'dateEnd', end);
    }
  }

});
