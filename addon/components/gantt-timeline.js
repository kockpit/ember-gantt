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
    let headerElement = get(this, 'headerElement');
    let chartElement = get(this, 'chart.element');

    let offset = 0;
    let chartBottom = 1;

    if (headerElement && chartElement) {
      offset = headerElement.getBoundingClientRect().top;
      let chartOffset =  chartElement.getBoundingClientRect();
      chartBottom = (chartOffset.top + chartOffset.height - 100) || 1;
    }

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


  scaleWidth: 0, // is calculated in scale-grid generation

  // timeline scroll needs to be manually adjusted, as position-fixed does not inherit scrolling
  scaleStyle: computed('scaleWidth', 'isSticky','scrollLeft', function() {

    // total width
    let style = `width:${get(this, 'scaleWidth')}px;`;

    if (get(this, 'isSticky')) {
      style+= `left:-${get(this,'scrollLeft')}px;`;
    }
    return htmlSafe(style);
  }),

  // Activate automatical timeline view adjustments, based on dayWidth
  autoTimeline: alias('chart.autoTimeline'),

  timelineDay: alias('chart.timelineDay'),
  timelineCW: alias('chart.timelineCW'),
  timelineMonth: alias('chart.timelineMonth'),
  timelineMonthShort: alias('chart.timelineMonthShort'),
  timelineYear: alias('chart.timelineYear'),


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

    if (dayWidth < 5) { // year/month
      views.timelineYear = true;
      views.timelineCW = false;
    }
    if (dayWidth < 2) { // year only
      views.timelineYear = true;
      views.timelineMonth = false;
    }

    setProperties(this, views);
  },


  calculateScaleWidth(dayWidth, start, end) {
    return (dayWidth * parseInt(dateUtil.diffDays(start, end, true)));
  },

  // FIXME: workaround for ember/no-side-effects
  updateScaleWidth(scaleWidth) {
    set(this, 'scaleWidth', scaleWidth);
  },

  timelineScale: computed('viewStartDate', 'viewEndDate', 'dayWidth', 'specialDays','chart.ganttWidth', function() {

    const chart = get(this, 'chart');
    let start = dateUtil.getNewDate(get(this, 'viewStartDate')),
        end = dateUtil.getNewDate(get(this, 'viewEndDate')),
        dayWidth = get(this, 'dayWidth');

    if (!start || !end || !(start<end)) {
      return [];
    }

    // calculate total scale width
    let scaleWidth = this.calculateScaleWidth(dayWidth, start, end);

    if (scaleWidth < get(chart, 'ganttWidth')) {
      end = chart.offsetToDate(get(chart, 'ganttWidth') * 1.5);
      scaleWidth = this.calculateScaleWidth(dayWidth, start, end);
    }

    this.updateScaleWidth(scaleWidth);

    return {
      months: dateUtil.monthsInPeriod(start, end, dayWidth, get(this, 'specialDays')),
      calendarWeeks: get(this, 'timelineCW') ? dateUtil.calendarWeeksInPeriod(start, end, dayWidth) : null,
      years: get(this, 'timelineYear') ? dateUtil.yearsInPeriod(start,end, dayWidth) : null
    }

  })

});
