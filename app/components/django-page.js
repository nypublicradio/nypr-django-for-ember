import Ember from 'ember';
const $ = Ember.$;

export default Ember.Component.extend({
  router: Ember.inject.service('wnyc-routing'),
  didInsertElement() {
    this.get('page').appendTo(this.$());
  },
  click(event) {
    let target = $(event.target).closest('a');
    if (target.length > 0) {
      let href = target.attr('href');
      let m = /\/\/www\.wnyc\.org\/(.*)$/.exec(href);
      if (m) {
        this.get('router').transitionTo('django-rendered', m[1]);
        event.preventDefault();
        return false;
      }
      if (href === '/') {
        this.get('router').transitionTo('index');
        event.preventDefault();
        return false;
      }
    }
  }
});
