import Ember from 'ember';
import LegacySupportMixin from 'nypr-django-for-ember/mixins/legacy-support';
import { module, test } from 'qunit';

module('Unit | Mixin | legacy support');

// Replace this with your real tests.
test('it works', function(assert) {
  let LegacySupportObject = Ember.Object.extend(LegacySupportMixin);
  let subject = LegacySupportObject.create();
  assert.ok(subject);
});
