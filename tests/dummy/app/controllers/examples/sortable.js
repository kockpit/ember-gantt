import {get,set} from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({

  actions: {

    datesChanged(project) {
      let jobs = get(project, 'jobs');
      jobs = jobs.sortBy('dateStart');

      let i = 1;
      jobs.forEach(job => {
        set(job, 'sorting', i);
        i++;
      });

    }
  }

});
