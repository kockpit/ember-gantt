import {computed,get} from '@ember/object';
import dateUtil from '../utils/date-util';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import layout from '../templates/components/gantt-milestone';

export default Component.extend({
  layout,

  classNames: ['gantt-line-milestone'],
  attributeBindings: ['style','tooltipTitle:title'],

  line: null,

  chart: null,


  leftOffset: computed('date', 'chart.viewStartDate', 'chart.dayWidth', function(){
    return get(this, 'chart').dateToOffset( get(this, 'date'));
  }),


  // styling for left/width
  style: computed('leftOffset', function() {
    let style = `left:${get(this, 'leftOffset')}px;`;
    return htmlSafe(style);
  }),

  //
  tooltipTitle: computed('date','title',function() {
    let formattedDate = get(this, 'date').toLocaleDateString();
    return htmlSafe(`${formattedDate}: ${get(this, 'title')}`);
  })

});
