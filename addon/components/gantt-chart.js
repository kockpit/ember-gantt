// import moment from 'moment'; // ? needed

import {set,get} from '@ember/object';
import {isNone} from '@ember/utils';
import { bind } from '@ember/runloop';

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
    let inner = this.element.querySelector('.gantt-chart-inner');
    inner.addEventListener('scroll', this._handleScroll);

    // resize listener
    this.updateResize();
    window.addEventListener('resize', this._handleResize);
  },


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

    let days = pixelOffset / (dayWidth);

    let newDateTime = startDate.getTime() + (days * 86400000);
    return dateUtil.getNewDate(newDateTime);
  },

  updateScroll(e) {
    set(this, 'scrollLeft', e.target.scrollLeft);
  },

  updateResize(/*e*/) {
    set(this, 'ganttWidth', this.element.offsetWidth);
  },

  willDestroyelement() {
    this._super(...arguments);

    this.element.querySelector('.gantt-chart-inner').removeEventListener('scroll', this._handleScroll);
    window.removeEventListener('resize', this._handleResize);
  }


});
