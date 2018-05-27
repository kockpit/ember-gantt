// import { run } from '@ember/runloop';
// import moment from 'moment'; // ? needed
import {set,get,computed} from '@ember/object';
import {equal} from '@ember/object/computed';
import {isNone,isEqual} from '@ember/utils';
import { htmlSafe } from '@ember/string';

import dateUtil from '../utils/date-util';
import Component from '@ember/component';
import layout from '../templates/components/gantt-chart';

export default Component.extend({
  layout,

  classNames: 'gantt-chart',
  classNameBindings: ['ganttChartViewDay','ganttChartViewWeek','ganttChartViewMonth'],


  /**
   * View granularity {day|week|month} -> todo
   * Only has impact on header, change dayView accordingly
   *
   * @property view
   * @type string
   * @default 'day'
   * @public
   */
  view: 'day',

  // computings to set view class
  ganttChartViewDay: equal('view','day'),
  ganttChartViewWeek: equal('view','week'),
  ganttChartViewMonth: equal('view','month'),

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

  dayWidthPx: computed('dayWidth', function() {
    return `${get(this, 'dayWidth')}px`;
  }),

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
    // this._handleScroll = run.bind(this, this.updateTitleScroll);
  },

  todayStyle: computed('viewStartDate', 'dayWidth', function() {
    let today = dateUtil.getNewDate();
    let offsetLeft = this.dateToOffset(today, null, true);

    return htmlSafe( `left:${offsetLeft}px`);
  }),

  timelineMonths: computed('viewStartDate', 'viewEndDate', function() {
    let start = dateUtil.getNewDate(get(this, 'viewStartDate')),
        end = dateUtil.getNewDate(get(this, 'viewEndDate'));

    if (!start || !end || !(start<end)) {
      return [];
    }

    let actDate = dateUtil.getNewDate(start.getTime()),
        months = [];

    while(actDate < end) {

      let month = {
        date: dateUtil.getNewDate(actDate),
        totalDays: dateUtil.daysInMonth(actDate),
        days: []
      };

      // from/to days
      let startDay = 1;
      let lastDay = month.totalDays;

      // first month
      if (isEqual(start, actDate)) {
        startDay = actDate.getDate();
      } else {
        actDate.setDate(1);
      }

      // last month
      if (actDate.getMonth()===end.getMonth() && actDate.getFullYear()===end.getFullYear()) {
        lastDay = end.getDate();
      }

      // iterate all days to generate data-array
      for(let d=startDay; d<=lastDay; d++) {
        let dayDate = dateUtil.getNewDate(actDate);
        month.days.push({
          nr: d,
          date: dayDate.setDate(d),
          isWeekend: ([0,6].indexOf(dayDate.getDay()) >=0)
        });
      }

      // add days to month
      months.push(month);
      actDate.setMonth(actDate.getMonth()+1);

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

    let diffDays = dateUtil.diffDays(startDate, date, includeDay);
    let offset = (diffDays * dayWidth); // borders: border-width can be omitted using `border-box`

    return offset;
  },

  offsetToDate(pixelOffset) {
    let startDate = get(this, 'viewStartDate');
    let dayWidth = parseInt(get(this, 'dayWidth')) || 0;

    let days = pixelOffset / (dayWidth);

    let newDateTime = startDate.getTime() + (days * 86400000);
    return dateUtil.getNewDate(newDateTime);
  },


});
