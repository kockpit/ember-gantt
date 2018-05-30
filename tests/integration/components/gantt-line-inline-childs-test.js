import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { set } from '@ember/object';
import dateUtil from 'dummy/utils/date-util';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | gantt-line-inline-childs', function(hooks) {
  setupRenderingTest(hooks);

  test('periods rendering', async function(assert) {
    assert.expect(5);


    // TEST DATA
    let start = dateUtil.getNewDate('2018-05-05');

    const line = {
      start: dateUtil.datePlusDays(start, 3),
      end:  dateUtil.datePlusDays(start, 23),
    };

    const childs = [{
      dateStart: dateUtil.datePlusDays(start, 3),
      dateEnd: dateUtil.datePlusDays(start, 6),
      color: 'red'
    },{
      dateStart: dateUtil.datePlusDays(start, 4),
      dateEnd: dateUtil.datePlusDays(start, 7),
      color: 'blue'
    },{
      dateStart: dateUtil.datePlusDays(start, 9),
      dateEnd: dateUtil.datePlusDays(start, 15),
      color: 'green'
    }];

    this.set('start', start);
    this.set('line', line);
    this.set('childs', childs);


    // RENDER
    await render(hbs`
      {{#gantt-chart viewStartDate=start as |chart|}}
        {{#chart.line dateStart=line.start dateEnd=line.end as |line|}}

          {{line.inlineChilds childLines=childs }}

        {{/chart.line}}
      {{/gantt-chart}}
    `);

    // TESTS

    let bar = this.element.querySelector('.gantt-lines .gantt-line-bar');
    let segments = bar.querySelectorAll('.gantt-line-inline-childs > div');

    assert.equal(segments.length, 6, '6 segments');
    assert.equal(segments[0].getAttribute('style'), 'width:20px;background:red;', 'first pure red');
    assert.ok(/^width:60px;background:repeating-linear-gradient(.*)blue(.*)red/.test( segments[1].getAttribute('style') ), 'second blue/red-ish');

    // change second child
    set(childs[1], 'color', 'yellow');
    await settled();

    segments = bar.querySelectorAll('.gantt-line-inline-childs > div');
    assert.ok(/^width:60px;background:repeating-linear-gradient(.*)red(.*)yellow/.test( segments[1].getAttribute('style') ), 'second yellow/red-ish'); // color is sorted by ABC

    // change date
    set(childs[1], 'dateStart', dateUtil.datePlusDays(start, 2));
    await settled();

    segments = bar.querySelectorAll('.gantt-line-inline-childs > div');
    assert.equal(segments[1].getAttribute('style'), 'width:20px;background:yellow;', 'changed to yellow single');

  });
});
