import Controller from '@ember/controller';
import { set } from '@ember/object';
import dateUtil from '@kockpit/ember-gantt/utils/date-util';

export default Controller.extend(ExampleController, {

  specialDays: null,

  init() {
    this._super(...arguments);

    let today = dateUtil.getNewDate();

    set(this, 'specialDays', [
     { date: dateUtil.datePlusDays(today, 25), title: 'my birthday',        class: 'birthday' },
     { date: dateUtil.datePlusDays(today, 35), title: 'kockpit`s birthday', class: 'birthday' },
    ]);

  }

});
