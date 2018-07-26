import { set, get, observer } from '@ember/object';
import { isNone } from '@ember/utils';
import { bind } from '@ember/runloop';
import $ from 'jquery';

import dateUtil from '../utils/date-util';
import Component from '@ember/component';
import layout from '../templates/components/gantt-chart';

/**
 This is the main component with general settings for the gantt chart.
 ### Usage
 Use as a block level component with any number of yielded line, header etc. - see examples)
 components as children:
 ```handlebars
  {{#gantt-chart dayWidth=10 as |chart|}}

    {{#chart.header}}
      <h1>My Projects</h1>
    {{/chart.header}}

    {{#each projects as |p|}}

      {{#chart.line dateStart=p.dateStart dateEnd=p.dateEnd as |line|}}
        {{! ... inline or block chart.line for using line.xxx subcomponents }}
      {{/chart.line}}

    {{/each}}

  {{/gantt-chart}}
 ```

 @class GanttChart
 @namespace Components
 @extends Ember.Component
 @public
 @yield {GanttGenericContent} chart.header
 @yield {GanttLine} chart.line
 */
export default Component.extend({
  layout,

  classNames: 'gantt-chart',

  /**
   * This can be set to center this date in the timeline.
   * For example, to scroll to a specific bar that may be not in the shown period.
   *
   * @property viewDate
   * @argument viewDate
   * @type Date
   * @default null
   * @api
   */
  viewDate: null,

  /**
   * Scroll animation duration, when scrolling to specific date via `viewDate`.
   *
   * @property viewScrollDuration
   * @argument viewScrollDuration
   * @type {int}
   * @default 500 (ms)
   * @public
   */
  viewScrollDuration: 500,

  /**
   * Timeline startdate
   * default: today
   *
   * @property viewStartDate
   * @argument viewStartDate
   * @type Date
   * @default null
   * @public
   */
  viewStartDate: null,

  /**
   * Gantt timeline end-date
   * default: viewStartDate + 3months
   *
   * @property viewEndDate
   * @argument viewEndDate
   * @type {Date}
   * @default null
   * @public
   */
  viewEndDate: null,

  /**
   * Callback, when view start/end date changed, by application or infinity scroll
   *
   * @property onViewDateChange
   * @argument onViewDateChange
   * @type function
   * @default null
   * @public
   */
  onViewDateChange: null,

  /**
   * Pixel-width of day-columns
   *
   * @property dayWidth
   * @argument dayWidth
   * @type int
   * @default 20
   * @public
   */
  dayWidth: 20, //px

  /**
   * Show today in the timeline-grid.
   * Therefore, an entry is added in the `dayClasses`
   *
   * @property showToday
   * @argument showToday
   * @type bool
   * @default true
   * @public
   */
  showToday: true,

  /**
   * show special
   *
   * @property dayClasses
   * @argument dayClasses
   * @type array
   * @default null
   * @public
   */
  dayClasses: null,

  /**
   * Get/update gantt-width to so sub-elements can consume via observer/computed
   *
   * @property ganttWidth
   * @argument ganttWidth
   * @type int
   * @default 0
   * @protected
   */
  ganttWidth: 0, //px

  /**
   * Element .gantt-chart-inner to observe scrolling
   *
   * @property innerElement
   * @argument innerElement
   * @type object
   * @default null
   * @protected
   */
  innerElement: null,

  /**
   * Make header sticky using this top-offset when out of viewport
   * Set null to deactivate sticky-header
   *
   * @property stickyHeader
   * @argument stickyHeader
   * @type number
   * @default 0
   * @public
   */
  stickyOffset: 0,

  /**
   * Get scroll-left to adjust header bar and to controll infinity-load
   *
   * @property scrollLeft
   * @argument scrollLeft
   * @type int
   * @default 0
   * @private
   */
  scrollLeft: 0,

  /**
   * Get scroll-left to adjust header bar and to controll infinity-load
   *
   * @property infinityScroll
   * @argument infinityScroll
   * @type bool
   * @default false
   * @public
   */
  infinityScroll: false,

  /**
   * If `autoTimeline` set to `true`, ember-gantt automatically evaluates which timeline-headers (year, month, cw, day) are shown, based on the `dayWidth`.
   * You can deactivate this behavior and write your own logic. For that, use following `timelineXX` settings.
   *
   * @property autoTimeline
   * @argument autoTimeline
   * @type bool
   * @default true
   * @public
   */
  autoTimeline: true,

  /**
   * Show days in timeline header
   *
   * @property timelineDay
   * @argument timelineDay
   * @type bool
   * @default true
   * @public
   */
  timelineDay: true,

  /**
   * Show calendar weeks in timeline header
   *
   * @property timelineCW
   * @argument timelineCW
   * @type bool
   * @default true
   * @public
   */
  timelineCW: true,

  /**
   * Show months in timeline header
   *
   * @property timelineMonth
   * @argument timelineMonth
   * @type bool
   * @default true
   * @public
   */
  timelineMonth: true,

  /**
   * Show months in short form
   *
   * @property timelineMonthShort
   * @argument timelineMonthShort
   * @type bool
   * @default false
   * @public
   */
  timelineMonthShort: false,

  /**
   * Show years in short form
   *
   * @property timelineYear
   * @argument timelineYear
   * @type bool
   * @default true
   * @public
   */
  timelineYear: true,


  init() {
    this._super(...arguments);

    // start date
    let today = dateUtil.getNewDate();
    if (!get(this, 'viewStartDate')) {
      set(this, 'viewStartDate', dateUtil.datePlusDays(today, -2));
    }

    // end date
    if (!get(this, 'viewEndDate')) {
      let endDate = dateUtil.datePlusDays(get(this, 'viewStartDate'), 90);
      set(this, 'viewEndDate', endDate);
    }

    // add today in dayClasses if active
    if (get(this, 'showToday')) {
      let dayClasses = get(this, 'dayClasses');
      if (!dayClasses) {
        set(this, 'dayClasses', []);
      }
      get(this, 'dayClasses').push({ date: today, title: '', class: 'today'});
    }

    // bind listener functions
    this._handleScroll = bind(this, this.updateScroll);
    this._handleResize = bind(this, this.updateResize);

  },


  didInsertElement() {
    this._super(...arguments);

    // inner-scroll listener
    set(this, 'innerElement', this.element.querySelector('.gantt-chart-inner'));
    get(this, 'innerElement').addEventListener('scroll', this._handleScroll);

    // resize listener
    this.updateResize();
    window.addEventListener('resize', this._handleResize);

    // initially scroll to center viewDate (today)
    let viewDate = get(this, 'viewDate') || dateUtil.getNewDate();
    this.scrollTo(viewDate, 0);

  },

  willDestroyelement() {
    this._super(...arguments);

    get(this, 'innerElement').removeEventListener('scroll', this._handleScroll);

    window.removeEventListener('resize', this._handleResize);
  },



  // * *
  //
  //                PIXEL CALCULATIONS
  //
  // This is also used by child-components to distinguish left/width pixel positions
  //


  // calculate pixel-difference between two dates (for bar-offset or bar-width)
  dateToOffset(date, startDate, includeDay) {
    let dayWidth = parseInt(get(this, 'dayWidth')) || 0;

    startDate = startDate || get(this, 'viewStartDate');
    startDate = dateUtil.getNewDate(startDate); // assure UTC
    includeDay = isNone(includeDay) ? false : includeDay;

    if (isNone(date) || isNone(startDate) || typeof date.getTime !== 'function') {
      return 0;
    }

    let diffDays = dateUtil.diffDays(startDate, date, includeDay);
    let offset = (diffDays * dayWidth); // borders: border-width can be omitted using `border-box`

    return offset;
  },

  offsetToDate(pixelOffset) {
    let startDate = dateUtil.getNewDate(get(this, 'viewStartDate'));
    let dayWidth = parseInt(get(this, 'dayWidth')) || 0;

    let days = pixelOffset / dayWidth;

    let newDateTime = startDate.getTime() + (days * 86400000);
    return dateUtil.getNewDate(newDateTime);
  },


  // * *
  //
  //                SCROLL & ENDLESS/INFINITY
  //
  // scroll-event for endless/infinit-scroll and timeline scroll in sticky position
  //

  scrollToObserve: observer('viewDate', function() {
    let date = get(this, 'viewDate');
    if (date) {
      this.scrollTo(date);
    }
  }),

  scrollTo(date, duration) {
    let scrollPx = this.dateToOffset(date) - (get(this, 'ganttWidth')*(1/4));
    duration = isNone(duration) ? get(this, 'viewScrollDuration') : duration;

    $(get(this, 'innerElement')).animate({ scrollLeft: scrollPx }, duration);

  },

  updateScroll(e) {
    set(this, 'scrollLeft', e.target.scrollLeft);

    if(get(this, 'infinityScroll')) {
      this.checkInfinityScroll(e);
    }
  },

  refreshWidths: observer('viewStartDate','viewEndDate','dayWidth', function() {
    this.updateResize();
  }),

  updateResize(/*e*/) {
    set(this, 'ganttWidth', this.element.offsetWidth || 0);

    // let totalWidth = this.dateToOffset(get(this, 'viewEndDate'), get(this, 'viewStartDate'), true);
    // set(this, 'totalWidth', totalWidth);
  },

  checkInfinityScroll(e) {
    let target = e.target;
    let sum = target.offsetWidth + target.scrollLeft;

    if (sum >= target.scrollWidth) {
      this.expandView({ after: true });

    } else if(target.scrollLeft == 0) {
      this.expandView({ before: true });
    }
  },

  expandView(directions) {
    let numDays = Math.ceil(get(this, 'ganttWidth') / get(this, 'dayWidth'));
    let previousStart = get(this, 'viewStartDate');
    let previousEnd = get(this, 'viewEndDate');
    let expanded = 'before';

    // expand after
    if (directions.after) {
      let newEndDate = dateUtil.datePlusDays(get(this, 'viewEndDate'), numDays);
      expanded = 'after';
      set(this, 'viewEndDate', newEndDate);

    // expand before
    } else if (directions.before) {
      let newStartDate = dateUtil.datePlusDays(get(this, 'viewStartDate'), numDays*(-1));
      set(this, 'viewStartDate', newStartDate);

      // set new scrollOffset
      get(this, 'innerElement').scrollLeft = (get(this, 'innerElement').scrollLeft + get(this, 'ganttWidth'));
    }

    // fire callback
    let callback = get(this, 'onViewDateChange');
    if (typeof callback === 'function') {
      callback(get(this, 'viewStartDate'), get(this, 'viewEndDate'), expanded, previousStart, previousEnd);
    }
  }


});
