import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render,settled,triggerEvent } from '@ember/test-helpers';
import { set/*, get*/ } from '@ember/object';
import dateUtil from 'dummy/utils/date-util';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | gantt-line', function(hooks) {
  setupRenderingTest(hooks);

  test('line width and color', async function(assert) {
    assert.expect(10);

    // TEST DATA
    let start = dateUtil.getNewDate('2018-05-05');

    const data = [{
      start: dateUtil.datePlusDays(start, 3),
      end:  dateUtil.datePlusDays(start, 23),
    },{
      start: dateUtil.datePlusDays(start, 5),
      end:  dateUtil.datePlusDays(start, 10),
    },{
      start: dateUtil.datePlusDays(start,8),
      end:  dateUtil.datePlusDays(start, 12),
      color: '#00FF00'
    }];

    set(this, 'dayWidth', 15);
    set(this, 'start', start);
    set(this, 'data', data);

    // RENDER
    await render(hbs`
      {{#gantt-chart viewStartDate=start dayWidth=dayWidth as |chart|}}

        {{chart.line dateStart=data.0.start dateEnd=data.0.end title="ONE"}}

        {{#chart.line dateStart=data.1.start dateEnd=data.1.end as |line|}}
          {{#line.title}}<b>TWO</b>{{/line.title}}
        {{/chart.line}}

        {{chart.line dateStart=data.2.start dateEnd=data.2.end color=data.2.color title="THREE"}}

        {{#chart.line dateStart=data.2.start dateEnd=data.2.end title="FOUR" as |line|}}
          {{#line.barContent}}<em>look at meeee</em>{{/line.barContent}}
        {{/chart.line}}

      {{/gantt-chart}}
    `);



    let lines = this.element.querySelectorAll('.gantt-lines .gantt-line');

    // structure
    assert.ok(lines[0].classList.contains('gantt-line'), 'has class');
    assert.ok(lines[0].querySelector('.gantt-line-timeline .gantt-line-bar'), 'structure of class-elements');
    assert.ok(lines[3].querySelector('.gantt-line-timeline .gantt-line-bar .gantt-line-bar-content em'), 'structure of class-elements – block ');
    assert.equal(lines[3].querySelector('.gantt-line-timeline .gantt-line-bar .gantt-line-bar-content').innerHTML, '<em>look at meeee</em>', 'bar-content');

    // titles
    assert.equal(lines[0].querySelector('.gantt-line-title').textContent.trim(), 'ONE', 'normal title - inline');
    assert.equal(lines[1].querySelector('.gantt-line-title').innerHTML, '<b>TWO</b>', 'subcomponent title - block');
    assert.equal(lines[3].querySelector('.gantt-line-title').textContent.trim(), 'FOUR', 'normal title - block');

    // position & color
    assert.equal(lines[2].querySelector('.gantt-line-timeline .gantt-line-bar').getAttribute('style'), 'left:120px;width:75px;background-color:#00FF00', 'position & color - THREE (block)');
    assert.equal(lines[0].querySelector('.gantt-line-timeline .gantt-line-bar').getAttribute('style'), 'left:45px;width:315px;', 'position & no inline color - ONE (inline)');


    // - CHANGE DAY WIDTH
    set(this, 'dayWidth', 30);
    set(data[2], 'color', 'purple');
    await settled();

    assert.equal(lines[2].querySelector('.gantt-line-timeline .gantt-line-bar').getAttribute('style'), 'left:240px;width:150px;background-color:purple', 'position & color after dayWidth changed - THREE (block)');

  });


  test('child lines', async function(assert) {
    // assert.expect(5);

    let start = dateUtil.getNewDate('2018-05-05');
    const data = {
        start: dateUtil.datePlusDays(start, 3),
        end:  dateUtil.datePlusDays(start, 23),
        childs: [{
            start: dateUtil.datePlusDays(start, 5),
            end:  dateUtil.datePlusDays(start, 10),
          },{
            start: dateUtil.datePlusDays(start, 8),
            end:  dateUtil.datePlusDays(start, 12),
            color: '#00FF00'
        }]
      };

    set(this, 'dayWidth', 15);
    set(this, 'start', start);
    set(this, 'data', data);

        // RENDER
    await render(hbs`
      {{#gantt-chart viewStartDate=start dayWidth=dayWidth as |chart|}}

        {{#chart.line dateStart=data.start dateEnd=data.end title="PARENT" as |line|}}

          {{#each data.childs as |child|}}
            {{line.childLine title="CHILD" dateStart=child.start dateEnd=child.end}}
          {{/each}}

        {{/chart.line}}

      {{/gantt-chart}}
    `);


    // STRUCTURE
    let parentLine = this.element.querySelector('.gantt-lines .gantt-line-wrap');
    assert.equal(parentLine.querySelectorAll(':scope > .gantt-line-childs > .gantt-line-wrap').length, 2, 'has two child lines');

  });


  test('editable tests', async function(assert) {
    // assert.expect(5);

    let start = dateUtil.getNewDate('2018-05-05');
    const data = {
        start: dateUtil.datePlusDays(start, 3),
        end:  dateUtil.datePlusDays(start, 23)
      };

    set(this, 'dayWidth', 30);
    set(this, 'start', start);
    set(this, 'data', data);

        // RENDER
    await render(hbs`
      {{#gantt-chart viewStartDate=start dayWidth=dayWidth as |chart|}}
        {{chart.line dateStart=data.start dateEnd=data.end title="editable" isEditable=true }}
        {{chart.line dateStart=data.start dateEnd=data.end title="not editable" }}
      {{/gantt-chart}}`);

    // STRUCTURE
    let lines = this.element.querySelectorAll('.gantt-lines .gantt-line-wrap');
    let editableLine = lines[0];
    let editableBar = editableLine.querySelector('.gantt-line-bar');
    let notEditableLine = lines[1];
    // let notEditableBar = notEditableLine.querySelector('.gantt-line-bar');

    assert.ok(editableLine.querySelector('.gantt-line-bar').classList.contains('gantt-line-bar-editable'), 'has editable class');
    assert.notOk(notEditableLine.querySelector('.gantt-line-bar').classList.contains('gantt-line-bar-editable'), 'has not editable class');


    // MOVE IT
    // let startClone = dateUtil.getNewDate(data.start);
    // console.log(get(data, 'start'), 'start');
    let offset = editableBar.getBoundingClientRect();
    let left = offset.left;
    assert.notOk(editableLine.classList.contains('is-moving'), 'not yet has moving class');

    // //getComputedStyle
    // console.log(offset, 'offset');
    // console.log(editableBar.clientLeft, 'editableBar');
    await triggerEvent(editableBar, 'mousedown', { pageX: left+20, pageY: offset.top+5, which: 1 }); // click in
    assert.ok(editableLine.classList.contains('is-moving'), 'has moving class');

    // TODO: drag it and check changed date

    // console.log(get(data, 'start'), 'before moved');
    // console.log(this, 'total this');
    // await triggerEvent(document, 'mousemove', { pageX: left+290, pageY: offset.top+5, which: 1 }); // one day to the left
    // assert.equal(get(data, 'start'), dateUtil.datePlusDays(startClone, -1), 'moved one day to the left');
    // console.log(get(data, 'start'), 'moved');



    // assert.ok(bars[0]., 2, 'has two child lines');

  });

});
