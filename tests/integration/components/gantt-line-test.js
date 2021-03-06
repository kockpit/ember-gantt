import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, triggerEvent } from '@ember/test-helpers';
import { set, get } from '@ember/object';
import { run } from '@ember/runloop';
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
    assert.dom(lines[0]).hasClass('gantt-line', 'has class');
    assert.ok(lines[0].querySelector('.gantt-line-timeline .gantt-line-bar'), 'structure of class-elements');
    assert.ok(lines[3].querySelector('.gantt-line-timeline .gantt-line-bar .gantt-line-bar-content em'), 'structure of class-elements – block ');
    assert.equal(lines[3].querySelector('.gantt-line-timeline .gantt-line-bar .gantt-line-bar-content').innerHTML, '<em>look at meeee</em>', 'bar-content');

    // titles
    assert.dom(lines[0].querySelector('.gantt-line-title')).hasText('ONE', 'normal title - inline');
    assert.equal(lines[1].querySelector('.gantt-line-title').innerHTML, '<b>TWO</b>', 'subcomponent title - block');
    assert.dom(lines[3].querySelector('.gantt-line-title')).hasText('FOUR', 'normal title - block');

    // position & color
    assert.equal(lines[2].querySelector('.gantt-line-timeline .gantt-line-bar').getAttribute('style'), 'left:120px;width:75px;background-color:#00FF00', 'position & color - THREE (block)');
    assert.equal(lines[0].querySelector('.gantt-line-timeline .gantt-line-bar').getAttribute('style'), 'left:45px;width:315px;', 'position & no inline color - ONE (inline)');


    // - CHANGE DAY WIDTH
    run(() => {
      set(this, 'dayWidth', 30);
      set(data[2], 'color', 'purple');
    });
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
    assert.expect(7);

    let start = dateUtil.getNewDate('2018-05-05');
    const data = {
      start: dateUtil.datePlusDays(start, 3),
      end:  dateUtil.datePlusDays(start, 23)
    };

    set(this, 'dayWidth', 30);
    set(this, 'start', start);
    set(this, 'data', data);
    set(this, 'isEditable', false);

    await render(hbs`
      {{#gantt-chart viewDate=start viewStartDate=start dayWidth=dayWidth as |chart|}}

        {{chart.line dateStart=data.start dateEnd=data.end title="editable" isEditable=isEditable }}

        {{chart.line dateStart=data.start dateEnd=data.end title="not editable" }}

      {{/gantt-chart}}`);



    // structure
    let lines = this.element.querySelectorAll('.gantt-lines .gantt-line-wrap');
    let editableLine = lines[0];
    let editableBar = editableLine.querySelector('.gantt-line-bar');
    let notEditableLine = lines[1];

    // move-event infos
    let offset = editableBar.getBoundingClientRect();
    let startClone = dateUtil.getNewDate(data.start);

    // !! not editable
    await triggerEvent(editableBar, 'mousedown'); // activate
    assert.dom(editableLine).hasNoClass('is-moving', 'not yet has moving class');

    run(() => {
      set(this, 'isEditable', true);
    });
    await settled();

    // now editable (first)
    assert.dom(editableLine.querySelector('.gantt-line-bar')).hasClass('gantt-line-bar-editable', 'has editable class');
    assert.dom(notEditableLine.querySelector('.gantt-line-bar')).hasNoClass('gantt-line-bar-editable', 'has not editable class');

    // <- movable ->
    await triggerEvent(editableBar, 'mousedown'); // activate
    assert.dom(editableLine).hasClass('is-moving', 'has moving class');
    assert.equal(String(get(data, 'start')), String(startClone), 'not moved, only clicked');

    // <- move left
    await triggerEvent(document, 'mousemove', { clientX: offset.left+20, clientY: offset.top+5, which: 1 });
    assert.equal(String(get(data, 'start')), String(dateUtil.datePlusDays(startClone, -1)), 'moved one day to the left');

    // move right ->
    await triggerEvent(document, 'mousemove', { clientX: offset.left+110, clientY: offset.top+5, which: 1 });
    assert.equal(String(get(data, 'start')), String(dateUtil.datePlusDays(startClone, +2)), 'moved three days to the right');

  });

});
