import { bind, next } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import { computed, get, set, observer } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { alias, or } from '@ember/object/computed';

import dateUtil from '../utils/date-util';
import Component from '@ember/component';
import layout from '../templates/components/gantt-line';

/**
 Use the line component within your gantt chart part. You may use it in inline or block notation.

 ### Usage
 Use as a inline or block level component with sub-components title, inlineChilds, childLine, barContent and milestone
 components as children:
 ```handlebars
  {{#gantt-chart dayWidth=10 as |chart|}}

    {{! loop over your data to add as many lines as you need }}
    {{#each projects as |p|}}
      {{chart.line dateStart=p.dateStart dateEnd=p.dateEnd color=p.color onDateChange=(action 'myCallback' p)}}
      {{! -> callback receives new dateStart, dateEnd followed by your own arguments}}
    {{/each}}

    {{#chart.line dateStart=myStartDate dateEnd=myEndDate color="red" as |line|}}

      {{! milestone }}
      {{line.milestone date=myDate title="GoLive"}}

      {{! add a child line - this can be done recursively }}
      {{line.childLine dateStart=myStartDate dateEnd=myEndDate color="blue"}}

    {{/chart.ine}}

  {{/gantt-chart}}
 ```

 @class GanttLine
 @namespace Components
 @extends Ember.Component
 @public
 @yield {GanttLineTitle} line.title
 @yield {GanttInlineChilds} line.inlineChilds
 @yield {GanttLine} line.childLine
 @yield {GanttLineBarcontent} line.barContent
 @yield {GanttMilestone} line.milestone
 */
export default Component.extend({
  layout,


  /**
   * link to chart object
   *
   * @property chart
   * @type object
   * @default null
   * @private
   */
  chart: null,

  /**
   * link to parent line object
   *
   * @property parentLine
   * @type object
   * @default null
   * @private
   */
  parentLine: null,

  /**
   * Width of day-cell in px
   *
   * @property dayWidth
   * @type int
   * @default 20
   * @private
   */
  dayWidth: alias('chart.dayWidth'),

  /**
   * Line-title, shown at the left
   *
   * @property title
   * @argument title
   * @type Date
   * @default null
   * @public
   */
  title: '',

  /**
   * start-date of bar
   *
   * @property dateStart
   * @argument dateStart
   * @type Date
   * @default null
   * @public
   */
  dateStart: null,

  _start: computed('dateStart', 'chart.viewStartDate', function() {
    let max = Math.max(dateUtil.getNewDate(this.dateStart), get(this, 'chart.viewStartDate'));
    return dateUtil.getNewDate(max);
  }),

  /**
   * end-date of bar
   *
   * @property dateEnd
   * @argument dateEnd
   * @type Date
   * @default null
   * @public
   */
  dateEnd: null,

  _end: computed('dateEnd', 'chart.viewEndDate', function() {
    let min = Math.min(dateUtil.getNewDate(this.dateEnd), get(this, 'chart.viewEndDate'));
    return dateUtil.getNewDate(min);
  }),

  /**
   * bar color
   *
   * @property color
   * @argument color
   * @type string
   * @default null
   * @public
   */
  color: null,

  /**
   * If bar can be manipulated: resize/move.
   * It's possible to make parents non-editable and use max/min date of childs to align parent gantt-bar
   *
   * @property isEditable
   * @argument isEditable
   * @type bool
   * @default false
   * @public
   */
  isEditable: false,

  /**
   * Reference to chart element
   *
   * @property chartElement
   * @type object
   * @default null
   * @private
   */
  chartElement: null,

  /**
   * Reference to bar element
   *
   * @property barElement
   * @type object
   * @default null
   * @private
   */
  barElement: null,

  /**
   * Callback, when start/end date changed due to moving or resizing.
   * The date is thereby updated all the time. This callback is executed once, after resize/move finally ends.
   * The callback function receiveds the following attributes (in this order):
   * - `startDate`    new start date
   * - `endDate`      new end date
   *
   * @event onDateChange
   * @argument onDateChange
   * @type function
   * @default null
   * @public
   */
  onDateChange: null,


  classNames: ['gantt-line-wrap'],
  classNameBindings: ['isResizing','isMoving'],

  init() {
    this._super(...arguments);

    if (!this._handleMoveStart) {
      this._handleMoveStart = bind(this, this.activateMove);
      this._handleResizeLeft = bind(this, this.activateResizeLeft);
      this._handleResizeRight = bind(this, this.activateResizeRight);
      this._handleResizeMove = bind(this, this.resizeBar);
      this._handleFinish = bind(this, this.deactivateAll);
    }
  },

  didInsertElement() {
    this._super(...arguments);

    // bar reference
    let bar = this.element.querySelector('.gantt-line-bar');
    set(this, 'barElement', bar);

    // chart reference
    let chart = this.chart.element;
    set(this, 'chartElement', chart);

    // only if editable
    if (this.isEditable) {
      this.makeEditable();
    }

  },

  willDestroyelement() {
    this._super(...arguments);

    if (this.isEditable) {
      this.removeEditable();
    }
  },

  observeEditable: observer('isEditable', function() {
    let func = this.isEditable ? this.makeEditable : this.removeEditable;
    next( this, func); // wait for rendering resize-handlers
  }),

  makeEditable() {

    // register resize and drag handlers
    let bar = this.barElement
    let barResizeL = bar.querySelector('.bar-resize-l');
    let barResizeR = bar.querySelector('.bar-resize-r');

    // resize
    barResizeL.addEventListener('mousedown', this._handleResizeLeft);
    barResizeR.addEventListener('mousedown', this._handleResizeRight);

    // move
    bar.addEventListener('mousedown', this._handleMoveStart);

    // resize/move
    document.addEventListener('mousemove', this._handleResizeMove);
    document.addEventListener('mouseup', this._handleFinish);

  },

  removeEditable() {
    let bar = this.barElement;
    let barResizeL = bar.querySelector('.bar-resize-l');
    let barResizeR = bar.querySelector('.bar-resize-r');

    // unregister resize and drag helpers
    bar.removeEventListener('mousedown', this._handleMoveStart);
    barResizeL.removeEventListener('mousedown', this._handleResizeLeft);
    barResizeR.removeEventListener('mousedown', this._handleResizeRight);
    document.removeEventListener('mousemove', this._handleResizeMove);
    document.removeEventListener('mouseup', this._handleFinish);
  },





   // Bar offset from left (in px)
   // Calculated from date-start and dayWidth (in chart component)
  barOffset: computed('_start', 'dayWidth', function(){
    return this.chart.dateToOffset( this._start );
  }),

  // width of bar on months
  barWidth: computed('_start', '_end', 'dayWidth', function() {
    return this.chart.dateToOffset( this._end, this._start, true );
  }),

  // styling for left/width
  barStyle: computed('barOffset','barWidth', function() {

    let style = `left:${this.barOffset}px;width:${this.barWidth}px;`;
    if (this.color) {
      style+= `background-color:${this.color}`;
    }
    return htmlSafe(style);
  }),

  // TODO: title -> ?
  barTitle: computed('dateStart', 'dateEnd', function() {
    let start = this.dateStart.toLocaleDateString() || String(this.dateStart),
        end = this.dateEnd.toLocaleDateString() || String(this.dateEnd),
        days = dateUtil.diffDays( this.dateStart, this.dateEnd, true);

    if (start && end) {
      return htmlSafe(`${start} - ${end} (${days})`);
    }
    return '';
  }),



  // get element offset to parent (including scroll)
  // TODO: use from util package or ember?
  offsetLeft(el) {
    let rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    return rect.left + scrollLeft;
  },


  // RESIZING FUNCTIONS
  isEditing: or('isResizingLeft','isResizingRight','isMoving'),
  isResizing: or('isResizingLeft','isResizingRight'),
  isResizingLeft: false,
  isResizingRight: false,
  timelineOffset: 0,

  activateResizeLeft(){
    this.initTimlineOffset();
    set(this, 'isResizingLeft', true);
  },

  activateResizeRight(){
    this.initTimlineOffset();
    set(this, 'isResizingRight', true);
  },

  initTimlineOffset() {
    let timelineElement = this.chartElement.querySelector('.gantt-line-timeline');
    set(this, 'timelineOffset', this.offsetLeft(timelineElement));
    set(this, 'movingMouseOffset', 0);
  },

  // MOVE FUNCTION
  isMoving: false,
  movingDays: 0,
  movingMouseOffset: 0,

  activateMove(e) {
    e.preventDefault();
    this.initTimlineOffset();

    // remember days-duration of line
    let moveDays = Math.floor(Math.abs(this.dateStart.getTime() - this.dateEnd.getTime()) / 86400000);

    // remember click-offset for adjusting mouse-to-bar
    let mouseOffset = e.clientX - this.offsetLeft(e.target);

    set(this, 'movingDays', moveDays);
    set(this, 'movingMouseOffset', mouseOffset);
    set(this, 'isMoving', true);

  },

  resizeBar(e) {
    if (this.isDestroyed) return;
    if (!this.isEditing) return;
    e.preventDefault();

    // offset -> start/end-date
    let offsetLeft = (e.clientX - this.timelineOffset - this.movingMouseOffset);
    let dateOffset = this.chart.offsetToDate(offsetLeft);

    // resize left
    if (this.isResizingLeft) {
      dateOffset = (dateOffset > this.dateEnd) ? this.dateEnd : dateOffset; // dont allow lower than start
      set(this, 'dateStart', dateOffset);

    // resize right
    } else if (this.isResizingRight) {
      dateOffset = (dateOffset < this.dateStart) ? this.dateStart : dateOffset; // dont allow lower than start
      set(this, 'dateEnd', dateOffset);

    // move
    } else if (this.isMoving) {
      let dateOffsetEnd = new Date(dateOffset.getTime() + (this.movingDays*86400000));
      set(this, 'dateStart', dateOffset);
      set(this, 'dateEnd', dateOffsetEnd);
    }

  },

  deactivateAll(){
    if (this.isDestroyed) return;

    // check if something happened on this line
    let action = '';
    if (this.isResizing) {
      action = 'resize';

    } else if (this.isMoving) {
      action = 'move';
    }

    set(this, 'isResizingLeft', false);
    set(this, 'isResizingRight', false);
    set(this, 'isMoving', false);

    if (!isEmpty(action)) {
      let callback = this.onDateChange;
      if (typeof callback === 'function') {
        callback(this.dateStart, this.dateEnd, action);
      }
    }
  }

});
