import Ember from 'ember';
import ENV from '../../../config/environment';

export default Ember.Route.extend({
  discoverPrefs: Ember.inject.service(),

  model() {
    let prefs = this.get('discoverPrefs');

    return this.store.findAll('shows', {
      discover_station: ENV.discoverStation,
      api_key: ENV.discoverAPIKey
    }).then((shows) => {
      return Ember.RSVP.hash({
        shows: shows,
        excludedShowSlugs: prefs.get('excludedShowSlugs')
      });
    });
  }
});