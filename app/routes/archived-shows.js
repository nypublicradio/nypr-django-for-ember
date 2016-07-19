import Route from 'ember-route';
//import RSVP from 'rsvp';
import ENV from 'overhaul/config/environment';

export default Route.extend({
  model() {
    return this.store.query('shows', { discover_station: ENV.moreShowsDiscoverStation, api_key: ENV.moreShowsAPIKey });
  }
});