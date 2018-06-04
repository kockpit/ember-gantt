import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {get} from '@ember/object';

export default Route.extend({

  demoData: service(),


  model() {
    // return get(this, 'demoData').getRandomDemoData();
    return get(this, 'demoData').getDataScenario1();
  }

});
