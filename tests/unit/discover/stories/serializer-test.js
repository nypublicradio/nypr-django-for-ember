import { moduleForModel, test } from 'ember-qunit';
import startMirage from '../../../helpers/setup-mirage-for-integration';

moduleForModel('discover/stories', 'Unit | Serializer | discover/stories', {
  // Specify the other units that are required for this test.
  needs: ['serializer:discover/stories', 'adapter:discover/stories', 'model:discover/stories'],
  setup() {
    startMirage(this.container);
  }
});

// This gets the job done, but it doesn't feel very unit test
// as this is going through the adapter/serializer/model path

test('it serializes the data', function(assert) {
  server.create('discover-story');
  this.store().query('discover/stories', {}).then(records => {
    let keysToCheck = ['title', 'showTitle', 'showUrl', 'summary', 'estimatedDuration', 'date', 'audio', 'url'];

    assert.equal(records.get('length'), 1);

    records.forEach((record) => {
      keysToCheck.forEach(function(key) {
        var value = record.get(key);
        assert.ok(!!value, `${key} exists in story serialization`);
      });
    });
  });
});

test('it serializes the data if show is blank', function(assert) {
  server.create('discover-story', {
    show: {}
  });
  this.store().query('discover/stories', {}).then(records => {
    assert.equal(records.get('length'), 1);
    assert.ok(records);
    records.forEach(record => {
      assert.ok(!record.get('showTitle'), "show title should be blank");
      assert.ok(!record.get('showUrl'), "show url should be blank");
    });
  });
});