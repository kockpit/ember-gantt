import { get, set } from '@ember/object';

import Controller from '@ember/controller';
import ExampleController from '../../mixins/example-controller';

export default Controller.extend(ExampleController, {


  actions: {

    sortJobsInProject(project) {
      let jobs = get(project, 'jobs').sortBy('dateStart');

      jobs.forEach((job, k) => {
        set(job, 'sorting', k);
      });
    }
  }

});
