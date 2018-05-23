// import { run } from '@ember/runloop';
// import moment from 'moment'; // ? needed
import {set,get,computed} from '@ember/object';
import {isNone} from '@ember/utils';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import layout from '../templates/components/gantt-chart';

export default Component.extend({
  layout,

  classNames: 'gantt-chart',

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
   * Gantt timeline start-date
   *
   * @property viewStartDate
   * @type Date
   * @default null
   * @public
   */
  viewStartDate: null,

  /**
   * Gantt timeline end-date
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

  dayWidthPx: computed('dayWidth', function() {
    return `${get(this, 'dayWidth')}px`;
  }),


  init() {
    this._super(...arguments);

    // start date
    if (!get(this, 'viewStartDate')) {
      let viewStart = this.getNewDate();
      viewStart.setDate(1); // start of month!?
      set(this, 'viewStartDate', viewStart);
    }

    // end date
    if (!get(this, 'viewEndDate')) {
      let startDate = get(this, 'viewStartDate');
      let endDate = this.getNewDate(startDate);
      endDate.setMonth(endDate.getMonth()+8);
      set(this, 'viewEndDate', endDate);
    }

    // bind listener functions
    // this._handleScroll = run.bind(this, this.updateTitleScroll);
  },

  todayStyle: computed('viewStartDate', 'dayWidth', function() {
    let today = this.getNewDate();
    let offsetLeft = this.dateToOffset(today);

    return htmlSafe( `left:${offsetLeft}px`);
  }),

  timelineMonths: computed('viewStartDate', 'viewEndDate', function() {
    let start = get(this, 'viewStartDate'),
        end = get(this, 'viewEndDate');

    if (!start || !end || !(start<end)) {
      return [];
    }

    let actDate = this.getNewDate(start.getTime()),
        months = [];

    // set to first day of month -> TODO should be possible to render any time-range, not only months
    // actDate.setMonth(actDate.getMonth()+1);
    actDate.setDate(1);

    while(actDate < end) {
      let month = {
        date: (new Date(actDate.getTime())),
        totalDays: this.daysInMonth(actDate),
        days: []
      };

      for(let d=1; d<=month.totalDays; d++) {
        let dayDate = new Date(actDate.getTime());
        month.days.push({
          nr: d,
          date: dayDate.setDate(d),
          isWeekend: ([0,6].indexOf(dayDate.getDay()) >=0)
        });
      }

      months.push(month);
      actDate.setMonth(actDate.getMonth()+1);
      // actDate.setDate(0);
    }

    return months;
  }),


  // calculate pixel-difference between two dates (for bar-offset or bar-width)
  dateToOffset(date, startDate, includeDay) {
    let dayWidth = parseInt(get(this, 'dayWidth')) || 0;

    startDate = startDate || get(this, 'viewStartDate');
    includeDay = isNone(includeDay) ? false : includeDay;

    if (isNone(date) || isNone(startDate) || typeof date.getTime !== 'function') {
      return 0;
    }

    let oneDay = 86400000; // 24*60*60*1000;
    let diffDays = Math.floor(Math.abs(date.getTime() - startDate.getTime()) / (oneDay));

    if (includeDay) {
      diffDays+=1;
    }

    let offset = (diffDays * dayWidth) + (diffDays*1); // + borders: TODO make auto-detecting borders

    // console.log(date, '=('+diffDays+'*'+dayWidth+' -> '+offset+'');
    // console.log(startDate, 'start');

    return offset;
  },

  offsetToDate(pixelOffset) {
    let startDate = get(this, 'viewStartDate');
    let dayWidth = parseInt(get(this, 'dayWidth')) || 0;

    let days = pixelOffset / (dayWidth+1); // border-left

    let newDateTime = startDate.getTime() + (days * 86400000);
    return this.getNewDate(newDateTime);
  },

  /**
   * DATE HELPER FUNCTIONS
   */

  // calculate days of month (TODO move to moment?)
  daysInMonth(date) {
    let newDate = this.getNewDate(date);
    newDate.setMonth(newDate.getMonth()+1);
    newDate.setDate(0);  // set to last day of previous month
    return newDate.getDate();
  },

  // get new date (from given date) in UTC and without time!
  getNewDate(fromDate) {
    let date = isNone(fromDate) ? new Date() : new Date(fromDate);
    date = this.dateNoTime(date);
    return date;
  },

  // remove time (set 0) and set to UTC
  dateNoTime(date) {
    date.setUTCHours(0,0,0,0);
    return date;
  }



});
