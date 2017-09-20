import { moduleForModel, test } from 'ember-qunit';

moduleForModel('django-page', 'Unit | Model | django page', {
  // Specify the other units that are required for this test.
  needs: ['service:html-parser', 'service:script-loader']
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
