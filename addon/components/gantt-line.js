import Component from '@ember/component';
import {computed,get,set} from '@ember/object';
import { run } from '@ember/runloop';
import {alias, or} from '@ember/object/computed';
import layout from '../templates/components/gantt-line';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  layout,

  classNames: 'gantt-line-wrap',

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
   * Called for a click event
   *
   * @method init
   * -param e
   * @protected
   */
  init() {
    this._super(...arguments);

    if (get(this, 'isEditable')) {
      this._handleMoveStart = run.bind(this, this.activateMove);
      this._handleResizeStart = run.bind(this, this.activateResizeStart);
      this._handleResizeEnd = run.bind(this, this.activateResizeEnd);
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

    if (!get(this, 'isEditable')) return;


    // register resize and drag handlers
    let bar = this.element.querySelector('.gantt-line-bar');
    let barResizeL = this.element.querySelector('.bar-resize-l');
    let barResizeR = this.element.querySelector('.bar-resize-r');
    let chart = document.querySelector('.gantt-chart-inner'); // TODO: should it be possible to have multiple gant-charts in one doc?

    // resize
    barResizeL.addEventListener('mousedown', this._handleResizeStart);
    barResizeR.addEventListener('mousedown', this._handleResizeEnd);

    // move 
    bar.addEventListener('mousedown', this._handleMoveStart);

    // resize/move
    chart.addEventListener('mousemove', this._handleResizeMove);
    chart.addEventListener('mouseup', this._handleFinish);


  },


  /**
   * Bar offset from left (in px)
   * Calculated from date-start and dayWidth (in chart component)
   *
   * @method barOffset
   * @protected
   */
  barOffset: computed('dateStart', 'dayWidth', function(){
    return get(this, 'chart').dateToPixel( get(this, 'dateStart') );
  }),

  // width of bar on months
  barWidth: computed('dateStart', 'dateEnd', 'dayWidth', function() {
    return get(this, 'chart').dateToPixel( get(this, 'dateEnd'), get(this, 'dateStart'), true );
  }),

  // styling for left/width
  barStyle: computed('barOffset','barWidth', function() {
    return htmlSafe(`left:${get(this, 'barOffset')}px;width:${get(this, 'barWidth')}px;`);
  }),

  // title -> ?
  barTitle: computed('dateStart', 'dateEnd', function() {
    let days = get(this, 'chart').dateToPixel( get(this, 'dateStart') ) / get(this, 'dayWidth');
    let start = get(this, 'dateStart'),
        end = get(this, 'dateEnd');

    if (start && end) {
      return `days: ${days} : `+start.toString()+' to '+end.toString();  
    }
    return '';
  }),


  // helper functions (move somewhere !?)
  offsetLeft(el) {
    let rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    // scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    //return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
    return rect.left + scrollLeft;
  },


  // RESIZING FUNCTIONS
  isResizing: or('isResizingStart','isMoving','isResizingEnd'),
  isResizingStart: false,
  isResizingEnd: false,
  timelineOffset: 0,

  activateResizeStart(){
    this.initTimlineOffset();
    set(this, 'isResizingStart', true);
  },
  activateResizeEnd(){
    this.initTimlineOffset();
    set(this, 'isResizingEnd', true);
  },
  initTimlineOffset() {
    let chart = this.$('.bar-resize-l').closest('.gantt-line-timeline');
    set(this, 'timelineOffset', chart.offset().left);
    set(this, 'movingMouseOffset', 0);
  },

  // MOVE FUNCTION
  isMoving: false,
  movingDays: 0,
  movingMouseOffset: 0,

  activateMove(e) {
    this.initTimlineOffset();
    
    // remember days-duration of line
    let moveDays = Math.floor(Math.abs(get(this, 'dateStart').getTime() - get(this, 'dateEnd').getTime()) / 86400000) +1;

    // remember click-offset 
    // let mouseOffset = e.clientX - this.element.querySelector('.gantt-line-bar').offsetLeft;
    console.log(e, 'event');
    let mouseOffset = e.clientX - this.offsetLeft(e.target);


    console.log(moveDays, 'activate');
    set(this, 'movingDays', moveDays);
    set(this, 'movingMouseOffset', mouseOffset);
    set(this, 'isMoving', true);
  },



  resizeBar(e) {
    if (!get(this, 'isResizing')) return;

    let offsetLeft = (e.clientX - get(this, 'timelineOffset') - get(this, 'movingMouseOffset'));  
    console.log(e.clientX+" - "+get(this, 'timelineOffset')+"=offsetLeft", 'calc offset');

    // offset -> start/end-date
    let dateOffset = get(this, 'chart').pixelToDate(offsetLeft);

    if (get(this, 'isResizingStart')) {
      set(this, 'dateStart', dateOffset);
    } else if (get(this, 'isResizingEnd')) {
      set(this, 'dateEnd', dateOffset);
    } else if (get(this, 'isMoving')) {
      let dateOffsetEnd = new Date(dateOffset.getTime() + (get(this, 'movingDays')*86400000));
      set(this, 'dateStart', dateOffset);
      set(this, 'dateEnd', dateOffsetEnd);
    }

  },
  deactivateAll(){
    set(this, 'isResizingStart', false);
    set(this, 'isResizingEnd', false);
    set(this, 'isMoving', false);
  },

  




  willDestroyelement() {
    this._super(...arguments);
    
    if (!get(this, 'isEditable')) return;

    let bar = this.element.querySelector('.gantt-line-bar');
    let barResizeL = this.element.querySelector('.bar-resize-l');
    let barResizeR = this.element.querySelector('.bar-resize-r');
    let chart = document.querySelector('.gantt-chart-inner');

    // unregister resize and drag helpers
    bar.removeEventListener('mousedown', this._handleMoveStart);
    barResizeL.removeEventListener('mousedown', this._handleResizeStart);
    barResizeR.removeEventListener('mousedown', this._handleResizeEnd);
    chart.removeEventListener('mousemove', this._handleResizeMove);
    chart.removeEventListener('mouseup', this._handleFinish);
  }



});
