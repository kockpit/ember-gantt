import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import dateUtil from 'dummy/utils/date-util';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | gantt-timeline', function(hooks) {
  setupRenderingTest(hooks);

  test('timeline rendering', async function(assert) {
    assert.expect(6);

    let start = dateUtil.getNewDate('2018-05-05');
    let end = dateUtil.getNewDate('2018-08-05');
    const data = {
        start: dateUtil.datePlusDays(start, 3),
        end:  dateUtil.datePlusDays(start, 23)
      };

    this.set('dayWidth', 30);
    this.set('start', start);
    this.set('end', end);
    this.set('data', data);

    await render(hbs`
      {{#gantt-chart viewStartDate=start viewEndDate=end dayWidth=dayWidth as |chart|}}
        {{chart.line dateStart=data.start dateEnd=data.end title="editable" isEditable=true }}
        {{chart.line dateStart=data.start dateEnd=data.end title="not editable" }}
      {{/gantt-chart}}`);

    // await settled();

    let headerScale = this.element.querySelector('.gantt-chart-header .gantt-timeline-scale');
    let verticalGrid = this.element.querySelector('.gantt-timeline-grid .gantt-timeline-vertical-grid');

    let months = headerScale.querySelectorAll('.gantt-timeline-months .gantt-timeline-month');
    assert.equal(months.length, 4, 'has 4 months');

    let days = headerScale.querySelectorAll('.gantt-timeline-days .day');
    assert.equal(days.length, 93, 'has days');

    let gridDays = verticalGrid.querySelectorAll('.gantt-timeline-days .day');
    assert.equal(gridDays.length, 93, 'has grid days');

    let gridWeekendDays = verticalGrid.querySelectorAll('.gantt-timeline-days .day.day-weekend');
    assert.equal(gridWeekendDays.length, 28, 'has grid weekend days');

    // ZOOM OUT
    this.set('dayWidth', 10);
    await settled();

    gridDays = verticalGrid.querySelectorAll('.gantt-timeline-days .day');
    assert.equal(gridDays.length, 93, 'grid days still there');

    days = headerScale.querySelectorAll('.gantt-timeline-days .day');
    assert.equal(days.length, 0, 'days are not shown at this zoom level');

  });
});
