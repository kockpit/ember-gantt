import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import dateUtil from 'dummy/utils/date-util';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | gantt-line-inline-childs', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

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

    // Template block usage:
    await render(hbs`
      {{#gantt-chart viewStartDate=start as |chart|}}
        {{#chart.line dateStart=line.start dateEnd=line.end as |line|}}

          {{line.inlineChilds childLines=childs }}

        {{/chart.line}}
      {{/gantt-chart}}
    `);

    let bar = this.element.querySelector('.gantt-line-bar ');
    let segments = bar.querySelectorAll('div');
    console.log(segments, 'inner');
    assert.equal(segments[1].outerHTML, '<div style="width:20px;background:red;"></div>');
  });
});
