import { moduleForModel, test } from 'ember-qunit';

moduleForModel('django-page', 'Unit | Serializer | django page', {
  // Specify the other units that are required for this test.
  needs: ['serializer:django-page', 'service:html-parser', 'service:script-loader']
});

// Replace this with your real tests.
test('it loads', function(assert) {
  let record = this.subject();
  assert.ok(record);
});
