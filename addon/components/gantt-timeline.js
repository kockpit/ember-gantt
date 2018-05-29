import {computed,observer,get,set,setProperties} from '@ember/object';
import {alias} from '@ember/object/computed';
import {htmlSafe} from '@ember/string';
import {isEqual,isNone} from '@ember/utils';
import {bind} from '@ember/runloop';

import dateUtil from '../utils/date-util';
import Component from '@ember/component';
import layout from '../templates/components/gantt-timeline';

export default Component.extend({
  layout,

  classNames: ['gantt-timeline'],

  chart: null,

  viewStartDate: alias('chart.viewStartDate'),
  viewEndDate: alias('chart.viewEndDate'),

  // today
  showToday: alias('chart.showToday'),
  todayStyle: computed('viewStartDate', 'dayWidth', function() {
    let today = dateUtil.getNewDate();
    let offsetLeft = get(this, 'chart').dateToOffset(today, null, true);

    return htmlSafe( `left:${offsetLeft}px`);
  }),


  dayWidth: alias('chart.dayWidth'),
  dayWidthPx: computed('dayWidth', function() {
    return `${get(this, 'dayWidth')}px`;
  }),

  // sticky header
  headerElement: null,
  headerTitle: alias('chart.headerTitle'),

  scrollLeft: alias('chart.scrollLeft'),
  stickyOffset: alias('chart.stickyOffset'),
  stickyStyle: htmlSafe(''),
  stickyPlaceholderStyle: htmlSafe(''),
  isSticky: false,

  // use document scroll event to check for sticky
  init() {
    this._super(...arguments);

    this._handleDocScroll = bind(this, this.checkSticky);
  },

  didInsertElement() {
    this._super(...arguments);

    set(this, 'headerElement', this.element.querySelector('.gantt-chart-header'));

    // init sticky
    if (!isNone(get(this, 'stickyOffset'))) {
      document.addEventListener('scroll', this._handleDocScroll);
    }

    // init timeline scale
    if (get(this, 'autoTimeline')) {
      this.evaluateTimlineElements();
    }
  },


  // STICKY
  // -------------------
  checkSticky(/*e*/) {
    let offset = get(this, 'headerElement').getBoundingClientRect().top || 0;

    if (!get(this, 'isSticky') && offset < get(this, 'stickyOffset')) {
      this.makeSticky();

    } else if(get(this, 'isSticky') && offset > get(this, 'stickyOffset')) {
      this.resetSticky();
    }
  },
  onResize: observer('ganttWidth', function() {
    this.updateSticky();
  }),
  makeSticky() {
    set(this, 'isSticky', true);
    this.updateSticky();
  },
  updateSticky() {
    if (get(this, 'isSticky')) {
      let stickyOffset = get(this, 'stickyOffset');
      let ganttWidth = get(this, 'chart.ganttWidth');
      let ganttLeft = get(this, 'chart.element').getBoundingClientRect().left;
      let headerHeight = get(this, 'headerElement.offsetHeight');

      set(this, 'stickyStyle', htmlSafe(`top:${stickyOffset}px;left:${ganttLeft}px;width:${ganttWidth}px;height:${headerHeight}px;`));
      set(this, 'stickyPlaceholderStyle', htmlSafe(`height:${headerHeight}px;`));
    }
  },
  resetSticky() {
    set(this, 'isSticky', false);
    set(this, 'stickyStyle', htmlSafe(''));
    set(this, 'stickyPlaceholderStyle', htmlSafe(''));
  },

  // timeline scroll needs to be manually adjusted, as position-fixed does not inherit scrolling
  stickyTimelineStyle: computed('isSticky','scrollLeft', function() {
    if (get(this, 'isSticky')) {
      return htmlSafe(`left:-${get(this,'scrollLeft')}px;`);
    }
    return '';
  }),

  /**
   * Activate automatical timeline view adjustments, based on dayWidth
   * Breakpoints can be set for ????
   *
   * @property autoView
   * @type bool
   * @default true
   * @public
   */
  autoTimeline: true,

  timelineDay: true,
  timelineCW: true,
  timelineMonth: true,
  timelineYear: true,


  autoViewObs: observer('dayWidth', 'autoTimeline', function() {
    this.evaluateTimlineElements();
  }),

  evaluateTimlineElements() {
    let dayWidth = get(this, 'dayWidth');
    let views = { timelineDay: true, timelineCW: false, timelineMonth: true, timelineYear: false }

    if (dayWidth < 15) { // cw's instead of days
      views.timelineDay = false;
      views.timelineCW = true;
    }

    if (dayWidth < 5) { // months
      views.timelineCW = false;
      views.timelineMonth = true;
    }

    if (dayWidth < 1) { // year
      views.timelineYear = true;
      views.timelineMonth = false;
    }

    setProperties(this, views);
  },


  timelineMonths: computed('viewStartDate', 'viewEndDate','dayWidth', function() {

    let start = dateUtil.getNewDate(get(this, 'viewStartDate')),
        end = dateUtil.getNewDate(get(this, 'viewEndDate')),
        dayWidth = get(this, 'dayWidth');

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

      // pass width, if days are not shown (?)
      month.width = ((lastDay - startDay) +1) * dayWidth;
      month.style = htmlSafe(`width:${month.width}px`);

      // iterate all days to generate data-array
      for(let d=startDay; d<=lastDay; d++) {
        let dayDate = dateUtil.getNewDate(actDate);
        month.days.push({
          nr: d,
          date: dayDate.setDate(d),
          isWeekend: ([0,6].indexOf(dayDate.getDay()) >=0),
        });
      }

      // add days to month
      months.push(month);
      actDate.setMonth(actDate.getMonth()+1);

    }

    return months;
  }),


  willDestroyelement() {
    this._super(...arguments);

    if (!isNone(get(this, 'stickyOffset'))) {
      document.removeEventListener('scroll', this._handleDocScroll);
    }
  }
});
