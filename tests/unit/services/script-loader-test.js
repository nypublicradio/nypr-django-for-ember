import { moduleFor, test } from 'ember-qunit';

moduleFor('service:script-loader', 'Unit | Service | script loader', {
  // Specify the other units that are required for this test.
  needs: ['service:async-writer']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
