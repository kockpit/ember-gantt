import Component from '@ember/component';
import {computed,get} from '@ember/object';
import {alias} from '@ember/object/computed';
import layout from '../templates/components/gantt-line';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  layout,

  classNames: 'gantt-line',

  chart: null, // parent chart
  parentLine: null,
  dayWidth: alias('chart.dayWidth'),

  title: '',

  dateStart: null,
  dateEnd: null,

  // offset from left
  barOffset: computed('dateStart', 'dayWidth', function(){
    console.log(get(this, 'dateStart'), 'offset');
    console.log(get(this, 'chart').dateToPixel( get(this, 'dateStart') ), 'offset calc');
    return get(this, 'chart').dateToPixel( get(this, 'dateStart') );
  }),

  // width of bar on months
  barWidth: computed('dateStart', 'dateEnd', 'dayWidth', function() {
    return get(this, 'chart').dateToPixel( get(this, 'dateEnd'), get(this, 'dateStart') );
  }),

  // styling for left/width
  barStyle: computed('barOffset','barWidth', function() {
    console.log(`left:${get(this, 'barOffset')}px;width:${get(this, 'barWidth')}px;`);
    return htmlSafe(`left:${get(this, 'barOffset')}px;width:${get(this, 'barWidth')}px;`);
  }),

  // title -> ?
  barTitle: computed('dateStart', 'dateEnd', function() {
    let days = get(this, 'chart').dateToPixel( get(this, 'dateStart') ) / get(this, 'dayWidth');
    return `days: ${days} : `+get(this, 'dateStart').toString()+' to '+get(this, 'dateEnd').toString();
  })


});
