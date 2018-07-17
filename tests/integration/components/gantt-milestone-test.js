import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { set/*, get*/ } from '@ember/object';
import dateUtil from 'dummy/utils/date-util';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | gantt-milestone', function(hooks) {
  setupRenderingTest(hooks);

  test('milestone rendered and correct positioned', async function(assert) {
    assert.expect(3);

    let data = {
      view:  {
        start: dateUtil.getNewDate('2018-05-05'),
        end: dateUtil.getNewDate('2018-12-05')
      },

      line:  {
        start: dateUtil.getNewDate('2018-06-02'),
        end: dateUtil.getNewDate('2018-07-15')
      },

      milestones: [
        { date: dateUtil.getNewDate('2018-05-06'), title: 'first milestone'},
        { date: dateUtil.getNewDate('2018-08-26'), title: 'second milestone'},
      ]
    }

    set(this, 'dayWidth', 15);
    set(this, 'data', data);


    await render(hbs`
      {{#gantt-chart viewStartDate=data.view.start viewEndDate=data.view.end dayWidth=dayWidth as |chart|}}
        {{#chart.line dateStart=data.line.start dateEnd=data.line.end as |line|}}

          {{#each data.milestones as |milestone|}}
            {{!log milestone 'milestone'}}
            {{line.milestone date=milestone.date title=milestone.title}}

          {{/each}}

        {{/chart.line}}
      {{/gantt-chart}}
    `);

    let lines = this.element.querySelectorAll('.gantt-lines .gantt-line');
    let milestones = lines[0].querySelectorAll('.gantt-line-milestone');

    assert.equal(milestones.length, 2, 'two milestones rendered in first line');
    assert.equal(milestones[0].style.left, '15px', 'positioning #1');
    assert.equal(milestones[1].style.left, '1695px', 'positioning #2');

    // TODO: tooltip tests - print?




  });
});
