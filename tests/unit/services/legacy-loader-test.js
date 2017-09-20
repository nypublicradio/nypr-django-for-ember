import { moduleFor, test } from 'ember-qunit';

moduleFor('service:legacy-loader', 'Unit | Service | legacy loader', {
  // Specify the other units that are required for this test.
  needs: ['service:wnyc-routing']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
