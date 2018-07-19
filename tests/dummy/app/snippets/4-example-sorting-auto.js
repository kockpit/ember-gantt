import {get,set} from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({

  actions: {

    sortJobsInProject(project) {

      // sort jobs by dateStart
      let jobs = get(project, 'jobs').sortBy('dateStart');

      // set array-index as sorting key
      jobs.forEach((job, k) => {
        set(job, 'sorting', k);
      });
    }
  }

});
