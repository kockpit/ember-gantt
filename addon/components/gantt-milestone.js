import { computed, get } from '@ember/object';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import layout from '../templates/components/gantt-milestone';

/**
 Milestones shown in line. Use this as sub-component of the line component.
 ### Usage
 Use as a block level component to wrap tooltip content or inline and set `title` for tooltip content.
 ```handlebars
  {{#gantt-chart dayWidth=10 as |chart|}}

    {{#each projects as |p|}}

      {{#chart.line dateStart=p.dateStart dateEnd=p.dateEnd as |line|}}

        {{! milestone as inline }}
        {{line.milestone date=milestone.date title="Go Live"}}


        {{#each p.milestones as |milestone|}}

          {{! milestones as block (title attribute is ignored) }}
          {{#line.milestone date=milestone.date }}
            <span>{{format-date milestone.date}}:</span>
            {{milestone.title}}
          {{/line.milestone}}

        {{/each}}

      {{/chart.line}}
    {{/each}}

  {{/gantt-chart}}
 ```

 @class GanttMilestone
 @namespace Components
 @extends Ember.Component
 @public
 */
export default Component.extend({
  layout,

  classNames: ['gantt-line-milestone'],
  attributeBindings: ['style',],

  line: null,
  chart: null,

  /**
   * date of milestone
   *
   * @property date
   * @argument date
   * @type Date
   * @default null
   * @public
   */
  date: null,

  /**
   * title of milestone. You may also use this component as block element to use more sophisticated markup.
   *
   * @property title
   * @argument title
   * @type string
   * @default null
   * @public
   */
  title: '',

  leftOffset: computed('date', 'chart.{viewStartDate,dayWidth}', function(){
    return this.chart.dateToOffset( this.date);
  }),

  // styling for left/width
  style: computed('leftOffset', function() {
    let style = `left:${this.leftOffset}px;`;
    return htmlSafe(style);
  }),

  //
  formattedDate: computed('date', function() {
    return htmlSafe(this.date.toLocaleDateString());
  })

});
