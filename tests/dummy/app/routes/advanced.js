import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    window.scrollTo(0, 0);
  },
});
