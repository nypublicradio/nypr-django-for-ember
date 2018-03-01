'use strict';

module.exports = {
  name: 'nypr-django-for-ember',
  included: function() {
    this._super.included.apply(this, arguments);
  },
  isDevelopingAddon: () => true
};
