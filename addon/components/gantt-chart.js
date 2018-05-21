import Component from '@ember/component';
import {set,get,computed} from '@ember/object';
import {isNone} from '@ember/utils';
import layout from '../templates/components/gantt-chart';
import moment from 'moment';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  layout,

  classNames: 'gantt-chart',

  showToday: true,

  viewStartDate: null,
  viewEndDate: null,

  dayWidth: 20, //px
  dayWidthPx: computed('dayWidth', function() {
    return `${get(this, 'dayWidth')}px`;
  }),

  init() {
    this._super(...arguments);

    if (!get(this, 'viewStartDate')) {
      let viewStart = (new Date());
      viewStart.setDate(1);
      set(this, 'viewStartDate', viewStart);
    }
    if (!get(this, 'viewEndDate')) {
      let startDate = get(this, 'viewStartDate');
      let endDate = new Date(startDate.getTime());
      endDate.setMonth(endDate.getMonth()+8);
      set(this, 'viewEndDate', endDate);
    }
  },

  todayStyle: computed('viewStartDate', function() {
    let today = new Date();
    let offsetLeft = this.dateToPixel(today);

    return htmlSafe( `left:${offsetLeft}px`);
  }),


  timelineMonths: computed('viewStartDate', 'viewEndDate', function() {
    let start = get(this, 'viewStartDate'),
        end = get(this, 'viewEndDate');

    console.log(start, 'start');
    console.log(end, 'end');

    if (!start || !end || !(start<end)) {
      console.log(start, 'start');
      console.log('start or end not set, or end date is before start');
      return [];
    }

    let actDate = new Date(start.getTime()),
        months = [];

    // set to lasth day of month so totalDays can be accessed
    // actDate.setMonth(actDate.getMonth()+1);
    actDate.setDate(1);


    while(actDate < end) {
      console.log(actDate, 'actDate');
      let month = {
        date: (new Date(actDate.getTime())), //.setDate(1), // first of month
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

    console.log(months, 'months');

    return months;
  }),

  // calculate days of month (TODO move to moment?)
  daysInMonth(date) {
    let newDate = new Date(date);
    newDate.setMonth(newDate.getMonth()+1);
    newDate.setDate(0);
    return newDate.getDate();
  },

  // calculate pixel-difference between two dates (for offset or bar width)
  dateToPixel(date, startDate) {
    let dayWidth = parseInt(get(this, 'dayWidth')) || 0;

    startDate = startDate || get(this, 'viewStartDate');

    if (isNone(date) || isNone(startDate) || typeof date.getTime !== 'function') {
      console.log(date, 'was no date');
      console.log(typeof date.getMonth, 'was no date');
      return 0;
    }

    let oneDay = 86400000; // 24*60*60*1000;
    let diffDays = Math.floor(Math.abs(date.getTime() - startDate.getTime()) / (oneDay));
    let offset = (diffDays * dayWidth) + (diffDays*2); // + borders: TODO make auto-detecting borders

    console.log(date, '='+diffDays+' -> '+offset+'px');
    console.log(startDate, 'start');
    // console.log(diffDays, '= days');
    // console.log((diffDays * dayWidth), '= pixels');


    return offset;
  }



});
