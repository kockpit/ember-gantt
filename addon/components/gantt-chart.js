// import moment from 'moment'; // ? needed

import {set,get,observer} from '@ember/object';
import {isNone} from '@ember/utils';
import {bind} from '@ember/runloop';

import dateUtil from '../utils/date-util';
import Component from '@ember/component';
import layout from '../templates/components/gantt-chart';

export default Component.extend({
  layout,

  classNames: 'gantt-chart',
  classNameBindings: ['ganttChartViewDay','ganttChartViewWeek','ganttChartViewMonth'],


  /**
   * Gantt timeline start-date
   * default: today
   *
   * @property viewStartDate
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
   * @type Date
   * @default null
   * @public
   */
  viewEndDate: null,

  /**
   * Callback, when view start/end date changed, by application or infinity scroll
   *
   * @property onViewDateChange
   * @type function
   * @default null
   * @public
   */
  onViewDateChange: null,

  /**
   * Pixel-width of day-columns
   *
   * @property dayWidth
   * @type int
   * @default 20
   * @public
   */
  dayWidth: 20, //px

  /**
   * Show today-line
   *
   * @property showToday
   * @type bool
   * @default true
   * @public
   */
  showToday: true,

  /**
   * Header title, above line titles
   *
   * @property headerTitle
   * @type string
   * @default ''
   * @public
   */
  headerTitle: '',

  /**
   * Get/update gantt-width to so sub-elements can consume via observer/computed
   *
   * @property ganttWidth
   * @type int
   * @default 0
   * @protected
   */
  ganttWidth: 0, //px

  /**
   * Element .gantt-chart-inner to observe scrolling
   *
   * @property innerElement
   * @type object
   * @default null
   * @private
   */
  innerElement: null,

  /**
   * Get/update total width of timeline canvas (days*dayWidth)
   *
   * @property totalWidth
   * @type int
   * @default 0
   * @protected
   */
  // totalWidth: 0, //px

  /**
   * Make header sticky using this top-offset when out of viewport
   * Set null to deactivate sticky-header
   *
   * @property stickyHeader
   * @type number
   * @default 0
   * @public
   */
  stickyOffset: 0,

  /**
   * Get scroll-left to adjust header bar and to controll infinity-load
   *
   * @property scrollLeft
   * @type int
   * @default 0
   * @private
   */
  scrollLeft: 0,

  /**
   * Get scroll-left to adjust header bar and to controll infinity-load
   *
   * @property infinityScroll
   * @type bool
   * @default true
   * @public
   */
  infinityScroll: true,


  init() {
    this._super(...arguments);

    // start date
    if (!get(this, 'viewStartDate')) {
      let viewStart = dateUtil.getNewDate();
      set(this, 'viewStartDate', viewStart);
    }

    // end date
    if (!get(this, 'viewEndDate')) {
      let startDate = get(this, 'viewStartDate');
      let endDate = dateUtil.getNewDate(startDate);
      endDate.setMonth(endDate.getMonth()+3);
      set(this, 'viewEndDate', endDate);
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
    set(this, 'ganttWidth', this.element.offsetWidth);

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
