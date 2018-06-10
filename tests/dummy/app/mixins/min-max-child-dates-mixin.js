import {computed,get} from '@ember/object';
import { mapBy, max, min } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';

export default Mixin.create({

  childs: [],

  childsStart: mapBy('childs','dateStart'),
  minStart: min('childsStart'),
  childsEnd: mapBy('childs','dateEnd'),
  maxEnd: max('childsEnd'),

  minStartDate: computed('minStart', function() {
    let start = get(this, 'minStart');
    if (typeof start === 'number') {
      let newdate = new Date(start);
      newdate.setUTCHours(0,0,0,0);
      return newdate;
    }
    return start;
  }),
  maxEndDate: computed('maxEnd', function() {
    let end = get(this, 'maxEnd');
    if (typeof end === 'number') {
      let newdate = new Date(end);
      newdate.setUTCHours(0,0,0,0);
      return newdate;
    }
    return end;
  })

});
