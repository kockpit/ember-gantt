import {computed,observer,get,set,setProperties} from '@ember/object';
import {alias} from '@ember/object/computed';
import {htmlSafe} from '@ember/string';
import {isNone} from '@ember/utils';
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


  // in-page styles
  dayWidth: alias('chart.dayWidth'),
  dayWidthPx: computed('dayWidth', function() {
    return htmlSafe(`${get(this, 'dayWidth')}px`);
  }),
  cwWidthPx: computed('dayWidth', function() {
    let width = get(this, 'dayWidth')*7;
    return htmlSafe(`${width}px`);
  }),


  // dayClasses - special day classes (e.g. today)
  showToday: alias('chart.showToday'),
  dayClasses: alias('chart.dayClasses'),

  specialDays: computed('dayClasses', function() { // special timestamp index
    let days = {};
    get(this, 'dayClasses').forEach( day => {
      days[dateUtil.getNewDate(day.date).getTime()] = day;
    });
    return days;
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

  willDestroyelement() {
    this._super(...arguments);

    if (!isNone(get(this, 'stickyOffset'))) {
      document.removeEventListener('scroll', this._handleDocScroll);
    }
  },


  // STICKY
  // -------------------
  checkSticky(/*e*/) {
    let offset = get(this, 'headerElement').getBoundingClientRect().top || 0;
    let chartOffset = get(this, 'chart.element').getBoundingClientRect() || {};
    let chartBottom = (chartOffset.top + chartOffset.height - 100) || 1;

    if (!get(this, 'isSticky') && offset < get(this, 'stickyOffset') && chartBottom >= 100) {
      this.makeSticky();

    } else if( get(this, 'isSticky') && (offset > get(this, 'stickyOffset') || chartBottom < 100) ) {
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


  scaleWidth: computed('viewStartDate', 'viewEndDate', 'dayWidth', function() {
    let width = (get(this, 'dayWidth') * parseInt(dateUtil.diffDays(get(this,'viewStartDate'), get(this,'viewEndDate'), true)));
    return width;
  }),

  // timeline scroll needs to be manually adjusted, as position-fixed does not inherit scrolling
  scaleStyle: computed('scaleWidth', 'isSticky','scrollLeft', function() {

    // total width
    let scaleWidth = get(this, 'scaleWidth');
    let style = `width:${scaleWidth}px;`;

    if (get(this, 'isSticky')) {
      style+= `left:-${get(this,'scrollLeft')}px;`;
    }
    return htmlSafe(style);
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
  timelineMonthShort: false,
  timelineYear: true,


  autoViewObs: observer('dayWidth', 'autoTimeline', function() {
    if (get(this, 'autoTimeline')) {
      this.evaluateTimlineElements();
    }
  }),

  evaluateTimlineElements() {
    let dayWidth = get(this, 'dayWidth');
    let views = { timelineDay: true, timelineCW: true, timelineMonth: true, timelineMonthShort: false, timelineYear: false }

    if (dayWidth < 20) { // cw's instead of days
      views.timelineDay = false;
      views.timelineCW = true;
    }

    if (dayWidth < 15) { // months
      // views.timelineMonth = true;
    }

    if (dayWidth < 10) { // months (small)
      views.timelineYear = true;
      views.timelineMonthShort = true;
    }

    if (dayWidth < 5) { // year
      views.timelineYear = true;
      views.timelineCW = false;
    }
    if (dayWidth < 2) { // year
      views.timelineYear = true;
      views.timelineMonth = false;
    }

    setProperties(this, views);
  },


  timelineScale: computed('viewStartDate', 'viewEndDate', 'dayWidth', 'scaleWidth', 'specialDays', function() { //'chart.ganttWidth',


    let start = dateUtil.getNewDate(get(this, 'viewStartDate')),
        end = dateUtil.getNewDate(get(this, 'viewEndDate')),
        dayWidth = get(this, 'dayWidth'),
        chart =  get(this, 'chart');

    if (!start || !end || !(start<end)) {
      return [];
    }

    // evaluate, if timeline-grid is smaller than viewport (and expand if needed while zooming)
    if (get(this, 'scaleWidth') < get(chart, 'ganttWidth')) {
      end = chart.offsetToDate(get(chart, 'ganttWidth')*1.5);
      // set(this, 'viewEndDate', end);
    }

    return {
      months: dateUtil.monthsInPeriod(start, end, dayWidth, get(this, 'specialDays')),
      calendarWeeks: get(this, 'timelineCW') ? dateUtil.calendarWeeksInPeriod(start, end, dayWidth) : null,
      years: get(this, 'timelineYear') ? dateUtil.yearsInPeriod(start,end, dayWidth) : null
    }

  })

});
