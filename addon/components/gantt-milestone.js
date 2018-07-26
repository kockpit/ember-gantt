import { computed, get } from '@ember/object';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import layout from '../templates/components/gantt-milestone';

/**
 milestones shown in line. Use this as sub-component of the line component
 ### Usage
 Use as a block level component with any number of yielded line, header etc. - see examples)
 components as children:
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
   * @type Date
   * @default null
   * @public
   */
  date: null,

  /**
   * title of milestone. You may also use this component as block element to use more sophisticated markup.
   *
   * @property title
   * @type string
   * @default null
   * @public
   */
  title: '',

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
