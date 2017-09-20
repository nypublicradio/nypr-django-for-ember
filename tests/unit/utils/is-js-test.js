import isJs from 'dummy/utils/is-js';
import { module, test } from 'qunit';

module('Unit | Utility | is js');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = isJs(document.createElement('script'));
  assert.ok(result);
});
