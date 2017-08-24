import { moduleFor, test } from 'ember-qunit';

moduleFor('service:async-writer', 'Unit | Service | async writer', {
  // Specify the other units that are required for this test.
  needs: ['service:html-parser', 'service:script-loader']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
