import { computed, get } from '@ember/object';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import layout from '../templates/components/gantt-milestone';

export default Component.extend({
  layout,

  classNames: ['gantt-line-milestone'],
  attributeBindings: ['style',],

  line: null,
  chart: null,

  leftOffset: computed('date', 'chart.{viewStartDate,dayWidth}', function(){
    return get(this, 'chart').dateToOffset( get(this, 'date'));
  }),

  // styling for left/width
  style: computed('leftOffset', function() {
    let style = `left:${get(this, 'leftOffset')}px;`;
    return htmlSafe(style);
  }),

  //
  formattedDate: computed('date', function() {
    return htmlSafe(get(this, 'date').toLocaleDateString());
  })

});
