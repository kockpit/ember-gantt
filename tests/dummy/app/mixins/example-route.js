import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Mixin.create({

  demoData: service(),
  scenario: 'demo', // { random | demo }

  model() {
    switch(this.scenario) {
      case 'random':
        return this.demoData.getRandomDemoData();
    }


    return this.demoData.getDataScenario1();
    //
  }

});
