import {observer,get,set} from '@ember/object';
import {debounce} from '@ember/runloop';
import {htmlSafe} from '@ember/string';
import {isArray, A} from "@ember/array";

import dateUtil from '../utils/date-util';
import Component from '@ember/component';
import layout from '../templates/components/gantt-line-inline-childs';

export default Component.extend({
  layout,
  classNames: ['gantt-line-inline-childs'],

  chart: null,
  parentLine: null,

  /**
   * Stripe width for overlapping areas
   *
   * @property stripeWidth
   * @type int
   * @default 3
   * @public
   */
  stripeWidth: 3,

  /**
   * debounce period-calculations to reduce computations
   *
   * @property debounceTime
   * @type int
   * @default 0
   * @public
   */
  debounceTime: 0,

  /**
   * pass childs as "childLines" with attributrs {dateStart, dateEnd, color}
   *
   * @property debounceTime
   * @type array
   * @default null
   * @public
   */
  childLines: null,

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

  reloadPeriods: observer('parentLine.{dateStart,dateEnd,dayWidth}','childLines','childLines.@each.{dateStart,dateEnd,color}', function() {
    debounce(this, this.calculatePeriods, get(this, 'debounceTime'));
  }),

  /**
   * Calculate period-segments from child dateStart/End (using dateUtil)
   * updates 'periods' attribute on component
   *
   * @method calculatePeriods
   * @return void
   * @protected
   */
  calculatePeriods() {

    // go through all jobs and generate compound child elements
    let chart = get(this, 'chart'),
        childs = get(this, 'childLines'),
        start = Math.max(get(this, 'parentLine.dateStart'), get(chart,'viewStartDate')),
        end =  Math.min(get(this, 'parentLine.dateEnd'), get(chart,'viewEndDate'));

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

  /**
   * Creates a background style from childs[n].color attributes
   * -> transparent for no childs, color from 1 child, striped background for n childs
   *
   * @method getBackgroundStyle
   * @param array childs  childs array that have color attribute (only tested with hex colors, e.g. '#000000')
   * @return string   css-background string e.g. '#000000' or 'repeating-linear-gradient(90deg, ... )'
   * @protected
   */
  getBackgroundStyle(childs) {

    if (!isArray(childs) || childs.length === 0) {
      return 'transparent';
    }

    let colors = A(A(childs).getEach('color'));
    colors = colors.uniq(); // every color only once!
    colors = colors.sort(); // assure color-order always the same

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
