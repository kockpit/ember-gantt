import Mixin from '@ember/object/mixin';
import {inject as service} from '@ember/service';
import {get} from '@ember/object';

export default Mixin.create({

  demoData: service(),
  scenario: 'demo', // { random | demo }

  model() {
    switch(get(this, 'scenario')) {
      case 'random':
        return get(this, 'demoData').getRandomDemoData();
    }


    return get(this, 'demoData').getDataScenario1();
    //
  }

});
