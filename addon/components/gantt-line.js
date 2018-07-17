import { bind, throttle } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import {computed,observer,get,set} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {alias, or} from '@ember/object/computed';

import dateUtil from '../utils/date-util';
import Component from '@ember/component';
import layout from '../templates/components/gantt-line';

export default Component.extend({
  layout,


  /**
   * link to chart object
   *
   * @property chart
   * @type object
   * @default null
   * @protected
   */
  chart: null,

  /**
   * link to parent line object
   *
   * @property parentLine
   * @type object
   * @default null
   * @protected
   */
  parentLine: null,

  /**
   * Width of day-cell in px
   *
   * @property dayWidth
   * @type int
   * @default 20
   * @public
   */
  dayWidth: alias('chart.dayWidth'),

  /**
   * Line-title, shown at the left
   *
   * @property dateStart
   * @type Date
   * @default null
   * @public
   */
  title: '',

  /**
   * Start-date of bar
   *
   * @property dateStart
   * @type Date
   * @default null
   * @public
   */
  dateStart: null,

  /**
   * End-date of bar
   *
   * @property dateEnd
   * @type Date
   * @default null
   * @public
   */
  dateEnd: null,

  /**
   * Collapse child lines (if available)
   *
   * @property collapsed
   * @type bool
   * @default false
   * @public
   */
  // collapsed: false, // use ember-bootstrap !

   /**
   * Bar color
   *
   * @property color
   * @type string
   * @default null
   * @public
   */
  color: null,

  /**
   * If bar can be manipulated: resize/move.
   * It's possible to make parents non-editable and use max/min date of childs to align parent gantt-bar
   *
   * @property isEditable
   * @type bool
   * @default false
   * @public
   */
  isEditable: false,

  /**
   * Reference to chart element
   *
   * @property chartElement
   * @type object
   * @default null
   * @private
   */
  chartElement: null,

  /**
   * Reference to bar element
   *
   * @property barElement
   * @type object
   * @default null
   * @private
   */
  barElement: null,

  /**
   * Callback, when start/end date changed due to moving or resizing
   *
   * @property onDateChange
   * @type function
   * @default null
   * @public
   */
  onDateChange: null,


  classNames: ['gantt-line-wrap'],
  classNameBindings: ['isResizing','isMoving','isInViewport'],

  init() {
    this._super(...arguments);

    if (get(this, 'isEditable') && !this._handleMoveStart) {
      this._handleMoveStart = bind(this, this.activateMove);
      this._handleResizeLeft = bind(this, this.activateResizeLeft);
      this._handleResizeRight = bind(this, this.activateResizeRight);
      this._handleResizeMove = bind(this, this.resizeBar);
      this._handleFinish = bind(this, this.deactivateAll);
    }
  },


  /**
   * Init editable handlers
   *
   * @method didInsertElement
   * @protected
   */
  didInsertElement() {
    this._super(...arguments);

    // bar reference
    let bar = this.element.querySelector('.gantt-line-bar');
    set(this, 'barElement', bar);

    // chart reference
    let chart = get(this, 'chart').element;
    set(this, 'chartElement', chart);

    // below, only if editable
    if (!get(this, 'isEditable')) return;

    // register resize and drag handlers
    let barResizeL = this.element.querySelector('.bar-resize-l');
    let barResizeR = this.element.querySelector('.bar-resize-r');

    // resize
    barResizeL.addEventListener('mousedown', this._handleResizeLeft);
    barResizeR.addEventListener('mousedown', this._handleResizeRight);

    // move
    bar.addEventListener('mousedown', this._handleMoveStart);

    // resize/move
    document.addEventListener('mousemove', this._handleResizeMove);
    document.addEventListener('mouseup', this._handleFinish);

    //
    this.updateIsInViewport();

  },

  willDestroyelement() {
    this._super(...arguments);

    if (!get(this, 'isEditable')) return;

    let bar = get(this, 'barElement');
    let barResizeL = bar.querySelector('.bar-resize-l');
    let barResizeR = bar.querySelector('.bar-resize-r');
    // let chart = document.querySelector('.gantt-chart-inner');

    // unregister resize and drag helpers
    bar.removeEventListener('mousedown', this._handleMoveStart);
    barResizeL.removeEventListener('mousedown', this._handleResizeLeft);
    barResizeR.removeEventListener('mousedown', this._handleResizeRight);
    document.removeEventListener('mousemove', this._handleResizeMove);
    document.removeEventListener('mouseup', this._handleFinish);
  },



  isInViewport: false,
  observeViewport: observer('dateStart','dateEnd','chart.viewVisibleStartDate','chart.viewVisibleEndDate', function() {
    throttle(this, this.updateIsInViewport, 500);
  }),
  updateIsInViewport() {

    if (get(this, 'parentLine')) {
      set(this, 'isInViewport', true);
      return;
    }

    let inViewport = ( ( get(this, 'dateStart') > get(this, 'chart.viewVisibleStartDate') && get(this, 'dateStart') < get(this, 'chart.viewVisibleEndDate') ) ||
            ( get(this, 'dateEnd') > get(this, 'chart.viewVisibleStartDate') && get(this, 'dateEnd') < get(this, 'chart.viewVisibleEndDate') ) );

    set(this, 'isInViewport', inViewport);
  },

  /**
   * Bar offset from left (in px)
   * Calculated from date-start and dayWidth (in chart component)
   *
   * @method barOffset
   * @protected
   */
  barOffset: computed('dateStart', 'dayWidth','chart.viewStartDate', function(){
    let start = dateUtil.getNewDate(Math.max(get(this, 'dateStart'), get(this, 'chart.viewStartDate')));
    return get(this, 'chart').dateToOffset( start );
  }),

  // width of bar on months
  barWidth: computed('dateStart', 'dateEnd', 'dayWidth','chart.viewStartDate', function() {
    let start = dateUtil.getNewDate(Math.max(get(this, 'dateStart'), get(this, 'chart.viewStartDate')));
    return get(this, 'chart').dateToOffset( get(this, 'dateEnd'), start, true );
  }),

  // styling for left/width
  barStyle: computed('barOffset','barWidth', function() {

    let style = `left:${get(this, 'barOffset')}px;width:${get(this, 'barWidth')}px;`;
    if (get(this, 'color')) {
      style+= `background-color:${get(this, 'color')}`;
    }
    return htmlSafe(style);
  }),

  // TODO: title -> ?
  barTitle: computed('dateStart', 'dateEnd', function() {
    let start = get(this, 'dateStart'),
        end = get(this, 'dateEnd'),
        days = dateUtil.diffDays(start, end, true);

    if (start && end) {
      return `days: ${days} : `+start.toString()+' to '+end.toString();
    }
    return '';
  }),


  /**
   * Get element offset to parent (including scroll)
   * TODO: use from util package or ember?
   *
   * @method offsetLeft
   * @param el
   * @protected
   */
  offsetLeft(el) {
    let rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    return rect.left + scrollLeft;
  },


  // RESIZING FUNCTIONS
  isEditing: or('isResizingLeft','isResizingRight','isMoving'),
  isResizing: or('isResizingLeft','isResizingRight'),
  isResizingLeft: false,
  isResizingRight: false,
  timelineOffset: 0,

  activateResizeLeft(){
    this.initTimlineOffset();
    set(this, 'isResizingLeft', true);
  },

  activateResizeRight(){
    this.initTimlineOffset();
    set(this, 'isResizingRight', true);
  },

  initTimlineOffset() {
    let timelineElement = get(this, 'chartElement').querySelector('.gantt-line-timeline');
    set(this, 'timelineOffset', this.offsetLeft(timelineElement));
    set(this, 'movingMouseOffset', 0);
  },

  // MOVE FUNCTION
  isMoving: false,
  movingDays: 0,
  movingMouseOffset: 0,

  activateMove(e) {
    e.preventDefault();
    this.initTimlineOffset();

    // remember days-duration of line
    let moveDays = Math.floor(Math.abs(get(this, 'dateStart').getTime() - get(this, 'dateEnd').getTime()) / 86400000);

    // remember click-offset for adjusting mouse-to-bar
    let mouseOffset = e.clientX - this.offsetLeft(e.target);

    set(this, 'movingDays', moveDays);
    set(this, 'movingMouseOffset', mouseOffset);
    set(this, 'isMoving', true);

  },

  resizeBar(e) {
    if (this.isDestroyed) return;
    if (!get(this, 'isEditing')) return;
    e.preventDefault();

    // offset -> start/end-date
    let offsetLeft = (e.clientX - get(this, 'timelineOffset') - get(this, 'movingMouseOffset'));
    let dateOffset = get(this, 'chart').offsetToDate(offsetLeft);

    // resize left
    if (get(this, 'isResizingLeft')) {
      dateOffset = (dateOffset > get(this, 'dateEnd')) ? get(this, 'dateEnd') : dateOffset; // dont allow lower than start
      set(this, 'dateStart', dateOffset);

    // resize right
    } else if (get(this, 'isResizingRight')) {
      dateOffset = (dateOffset < get(this, 'dateStart')) ? get(this, 'dateStart') : dateOffset; // dont allow lower than start
      set(this, 'dateEnd', dateOffset);

    // move
    } else if (get(this, 'isMoving')) {
      let dateOffsetEnd = new Date(dateOffset.getTime() + (get(this, 'movingDays')*86400000));
      set(this, 'dateStart', dateOffset);
      set(this, 'dateEnd', dateOffsetEnd);
    }

  },

  deactivateAll(){
    if (this.isDestroyed) return;

    // check if something happened on this line
    let action = '';
    if (get(this, 'isResizing')) {
      action = 'resize';

    } else if (get(this, 'isMoving')) {
      action = 'move';
    }

    set(this, 'isResizingLeft', false);
    set(this, 'isResizingRight', false);
    set(this, 'isMoving', false);

    if (!isEmpty(action)) {
      let callback = get(this, 'onDateChange');
      if (typeof callback === 'function') {
        callback(get(this, 'dateStart'), get(this, 'dateEnd'), action);
      }
    }
  }



});
