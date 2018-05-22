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

    // start date
    if (!get(this, 'viewStartDate')) {
      let viewStart = this.getNewDate();
      viewStart.setDate(1);
      set(this, 'viewStartDate', viewStart);
    }

    // end date
    if (!get(this, 'viewEndDate')) {
      let startDate = get(this, 'viewStartDate');
      let endDate = this.getNewDate(startDate);
      endDate.setMonth(endDate.getMonth()+8);
      set(this, 'viewEndDate', endDate);
    }
  },


  todayStyle: computed('viewStartDate', 'dayWidth', function() {
    let today = this.getNewDate();

    let offsetLeft = this.dateToPixel(today);
    console.log(today, 'today, in pixels:'+offsetLeft);

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

    let actDate = this.getNewDate(start.getTime()),
        months = [];

    // set to lasth day of month so totalDays can be accessed
    // actDate.setMonth(actDate.getMonth()+1);
    actDate.setDate(1);


    while(actDate < end) {
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


  // calculate pixel-difference between two dates (for offset or bar width)
  dateToPixel(date, startDate, includeDay) {
    let dayWidth = parseInt(get(this, 'dayWidth')) || 0;

    startDate = startDate || get(this, 'viewStartDate');
    includeDay = isNone(includeDay) ? false : includeDay;

    if (isNone(date) || isNone(startDate) || typeof date.getTime !== 'function') {
      // console.log(date, 'was no date');
      return 0;
    }

    let oneDay = 86400000; // 24*60*60*1000;
    let diffDays = Math.floor(Math.abs(date.getTime() - startDate.getTime()) / (oneDay))+1;
    
    if (includeDay) {
      diffDays+=1;
    }

    let offset = (diffDays * dayWidth) + (diffDays*1); // + borders: TODO make auto-detecting borders

    console.log(date, '=('+diffDays+'*'+dayWidth+' -> '+offset+'');
    console.log(startDate, 'start');

    return offset;
  },

  pixelToDate(pixelOffset) {
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
