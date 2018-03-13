import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    window.scrollTo(0, 0);
  },
});
