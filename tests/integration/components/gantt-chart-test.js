import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { set } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | gantt-chart', function(hooks) {
  setupRenderingTest(hooks);


  // test('basic rendering - no viewport dates (now - 3 months)', async function(assert) {


  //   // Template block usage:
  //   await render(hbs`
  //     {{#gantt-chart dayWidth=10 }}
  //       template block text
  //     {{/gantt-chart}}
  //   `);


  //   assert.equal(this.element.textContent.trim(), 'template block text');
  // });

  test('basic rendering', async function(assert) {

    // basic chart data
    set(this, 'dayWidth', 10);
    set(this, 'dateStart', new Date('2018-05-25'));
    set(this, 'dateEnd', new Date('2018-07-14'));

    // test data
    set(this, 'projectA', { title: 'Project 1', dateStart: new Date('2018-05-29'), dateEnd: new Date('2018-06-14')});
    set(this, 'projectB', { title: 'Project 2', dateStart: new Date('2018-06-07'), dateEnd: new Date('2018-07-07')});

    await render(hbs`
      {{#gantt-chart dayWidth=dayWidth viewStartDate=dateStart viewEndDate=dateEnd as |chart|}}
        {{chart.line title=projectA.title dateStart=projectA.dateStart dateEnd=projectA.dateEnd}}
        {{chart.line title=projectB.title dateStart=projectB.dateStart dateEnd=projectB.dateEnd}}
      {{/gantt-chart}}
    `);

    //  assert.equal(this.element.querySelector('div').getAttribute('style'), 'color: red', 'starts as red');

    // check generated timeline
    let timeline = this.element.querySelector('.gantt-chart-inner .gantt-chart-header .gantt-line-timeline');
    let firstMonth = timeline.querySelector('.gantt-timeline-month');

    assert.equal(firstMonth.querySelector('.gantt-timeline-days .day').textContent, '25', 'starts with 25 day');
    assert.equal(firstMonth.querySelector('.gantt-timeline-month-name').textContent.trim(), 'May 2018', 'starts with month May');
    assert.equal(timeline.querySelectorAll('.gantt-timeline-days .day').length, 51, 'amount of generated days');


    console.log(firstMonth, 'first');
  });

});


