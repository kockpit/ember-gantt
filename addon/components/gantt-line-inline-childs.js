import { observer, get, set } from '@ember/object';
import { throttle } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import { isArray, A } from "@ember/array";
import { isEmpty } from "@ember/utils";

import dateUtil from '../utils/date-util';
import Component from '@ember/component';
import layout from '../templates/components/gantt-line-inline-childs';

/**
 With the inline-childs component, you can show multiple lines in one line. Use it as sub-component of the line component.

 ### Usage
 Use as a inline component passing `childLines` array, each having dateStart,dateEnd and color attributes.
 The component calculates the overlapping or empty periods for coloring.
 components as children:
 ```handlebars
  {{#gantt-chart dayWidth=10 as |chart|}}

    {{#each projects as |p|}}

      {{#chart.line dateStart=p.dateStart dateEnd=p.dateEnd as |line|}}

        {{line.inlineChilds childLines=p.inlineChilds }} {{! <-- this }}

      {{/chart.line}}
    {{/each}}

  {{/gantt-chart}}
 ```

 @class GanttLineInlineChilds
 @namespace Components
 @extends Ember.Component
 @public
 */
export default Component.extend({
  layout,
  classNames: ['gantt-line-inline-childs'],

  chart: null,
  parentLine: null,

  /**
   * Stripe width for overlapping areas
   *
   * @property stripeWidth
   * @argument stripeWidth
   * @type int
   * @default 3
   * @public
   */
  stripeWidth: 3,

  /**
   * Pass a childs array as "childLines" with object having the attributes {dateStart, dateEnd, color}
   *
   * @property childLines
   * @argument childLines
   * @type array
   * @default null
   * @public
   */
  childLines: A(),

  /**
   * calculated periods for rendering in template
   *
   * @property periods
   * @type array
   * @default null
   * @protected
   */
  periods: null,


  didInsertElement() {
    this._super(...arguments);
    this.calculatePeriods();
  },

  reloadPeriods: observer('parentLine.{dateStart,dateEnd,dayWidth}','childLines.@each.{dateStart,dateEnd,color}', function() {
    throttle(this, this.calculatePeriods, 50);
  }),

  // Calculate period-segments from child dateStart/End (using dateUtil)
  // updates 'periods' attribute on component
  calculatePeriods() {

    // go through all jobs and generate compound child elements
    let chart = get(this, 'chart'),
        childs = get(this, 'childLines'),
        start = get(this, 'parentLine._start'),
        end =  get(this, 'parentLine._end')

    // generate period segments
    let periods = dateUtil.mergeTimePeriods(childs, start, end);

    // calculate width of segments
    if (periods && periods.length > 0) {
      periods.forEach(period => {
        period.width = chart.dateToOffset(period.dateEnd, period.dateStart, true);
        period.background = this.getBackgroundStyle(period.childs);
        period.style = htmlSafe(`width:${period.width}px;background:${period.background};`);
      });
    }

    set(this, 'periods', periods);
  },

  //Creates a background style from childs[n].color attributes
  // -> transparent for no childs, color from 1 child, striped background for n childs
  getBackgroundStyle(childs) {

    if (!isArray(childs) || childs.length === 0) {
      return 'transparent';
    }

    let colors = A(A(childs).getEach('color'));
    colors = colors.uniq(); // every color only once!
    colors = colors.sort(); // assure color-order always the same
    colors = colors.filter(color => !isEmpty(color)); // remove empty color strings


    // single-color
    if (colors.length === 1) {
      return colors[0];
    }

    // multi-color
    let background = 'repeating-linear-gradient(90deg,'; // or 180? ;)
    let pxOffset = 0;
    let stripeWidth = get(this, 'stripeWidth');

    colors.forEach(color => {
      let nextOffset = pxOffset+stripeWidth;
      background+= `${color} ${pxOffset}px,${color} ${nextOffset}px,`;
      pxOffset = nextOffset;
    });

    background = background.substring(0, background.length-1) + ')';

    return background;
  }


});
