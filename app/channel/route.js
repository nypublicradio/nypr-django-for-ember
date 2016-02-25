import Route from 'ember-route';
import service from 'ember-service/inject';
import Ember from 'ember';
const {
  get,
  set
} = Ember;
const { hash: waitFor } = Ember.RSVP;

export default Route.extend({
  listRouter: service(),

  model(params) {
    const channelType = this.routeName;
    const listingSlug = `${channelType}/${params.slug}`;

    return this.store.find('django-page', listingSlug.replace(/\/*$/, '/')).then(page => {
      return waitFor({
        page,
        channel: page.get('wnycChannel'),
      });
    });
  },
  afterModel({ channel }) {
    const listRouter = get(this, 'listRouter');
    const channelTitle = get(channel, 'title');
    set(listRouter, 'channelTitle', channelTitle);
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('channelType', this.routeName);
  },

  actions: {
    updateRouteTitle(activeLink) {
      const listRouter = get(this, 'listRouter');
      const navTitle = activeLink.text();

      set(listRouter, 'navTitle', navTitle);
    }
  }
});