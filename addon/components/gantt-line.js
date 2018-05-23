import { run } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import {computed,get,set} from '@ember/object';
import {alias, or} from '@ember/object/computed';
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
   * @property collapse
   * @type bool
   * @default false
   * @public
   */
  collapse: false,

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


  classNames: 'gantt-line-wrap',

  init() {
    this._super(...arguments);

    if (get(this, 'isEditable')) {
      this._handleMoveStart = run.bind(this, this.activateMove);
      this._handleResizeLeft = run.bind(this, this.activateResizeLeft);
      this._handleResizeRight = run.bind(this, this.activateResizeRight);
      this._handleResizeMove = run.bind(this, this.resizeBar);
      this._handleFinish = run.bind(this, this.deactivateAll);
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
    // let chart = document.querySelector('.gantt-chart-inner'); // TODO: should it be possible to have multiple gant-charts in one doc?

    // resize
    barResizeL.addEventListener('mousedown', this._handleResizeLeft);
    barResizeR.addEventListener('mousedown', this._handleResizeRight);

    // move
    bar.addEventListener('mousedown', this._handleMoveStart);

    // resize/move
    document.addEventListener('mousemove', this._handleResizeMove);
    document.addEventListener('mouseup', this._handleFinish);


  },


  /**
   * Bar offset from left (in px)
   * Calculated from date-start and dayWidth (in chart component)
   *
   * @method barOffset
   * @protected
   */
  barOffset: computed('dateStart', 'dayWidth', function(){
    return get(this, 'chart').dateToOffset( get(this, 'dateStart') );
  }),

  // width of bar on months
  barWidth: computed('dateStart', 'dateEnd', 'dayWidth', function() {
    return get(this, 'chart').dateToOffset( get(this, 'dateEnd'), get(this, 'dateStart'), true );
  }),

  // styling for left/width
  barStyle: computed('barOffset','barWidth', function() {
    return htmlSafe(`left:${get(this, 'barOffset')}px;width:${get(this, 'barWidth')}px;`);
  }),

  // title -> ?
  barTitle: computed('dateStart', 'dateEnd', function() {
    let days = get(this, 'chart').dateToOffset( get(this, 'dateStart') ) / get(this, 'dayWidth');
    let start = get(this, 'dateStart'),
        end = get(this, 'dateEnd');

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
  isResizing: or('isResizingLeft','isMoving','isResizingRight'),
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
    if (!get(this, 'isResizing')) return;

    // offset -> start/end-date
    let offsetLeft = (e.clientX - get(this, 'timelineOffset') - get(this, 'movingMouseOffset'));
    let dateOffset = get(this, 'chart').offsetToDate(offsetLeft);

    // resize left
    if (get(this, 'isResizingLeft')) {
      set(this, 'dateStart', dateOffset);

    // resize right
    } else if (get(this, 'isResizingRight')) {
      set(this, 'dateEnd', dateOffset);

    // move
    } else if (get(this, 'isMoving')) {
      let dateOffsetEnd = new Date(dateOffset.getTime() + (get(this, 'movingDays')*86400000));
      set(this, 'dateStart', dateOffset);
      set(this, 'dateEnd', dateOffsetEnd);
    }

  },

  deactivateAll(){
    set(this, 'isResizingLeft', false);
    set(this, 'isResizingRight', false);
    set(this, 'isMoving', false);
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
  }



});
