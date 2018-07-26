import Component from '@ember/component';
import layout from '../templates/components/gantt-line-barcontent';

/**
 Lines can have special "bar-content". Use this as sub-component of the line component
 ### Usage
 Use as a block level component with any number of yielded line, header etc. - see examples)
 components as children:
 ```handlebars
  {{#gantt-chart dayWidth=10 as |chart|}}

    {{#each projects as |p|}}

      {{#chart.line dateStart=p.dateStart dateEnd=p.dateEnd as |line|}}

        {{#line.barContent}}<span>My content</span>{{/line.barContent}}

      {{/chart.line}}
    {{/each}}

  {{/gantt-chart}}
 ```

 @class GanttLineBarcontent
 @namespace Components
 @extends Ember.Component
 @public
 */
export default Component.extend({
  layout,

  classNames: ['gantt-line-bar-content']
});
