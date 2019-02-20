import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | gantt-line-barcontent', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {


    // Template block usage:
    await render(hbs`
      {{#gantt-line-barcontent}}
        <span class="myspan">HI</span>
      {{/gantt-line-barcontent}}
    `);

    let div = this.element.querySelector('.gantt-line-bar-content');

    assert.dom(this.element).hasText('HI');
    assert.ok(div, 'has div');
    assert.ok(div.querySelector('span'), 'has inner span');

  });
});
