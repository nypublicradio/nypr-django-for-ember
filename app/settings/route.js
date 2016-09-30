import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.findAll('stream').then(streams => {
      return streams.filterBy('audioBumper');
    });
  },

  actions: {
    willTransition() {
      window.scrollTo(0, 0);
    }
  }
});
