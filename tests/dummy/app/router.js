import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('fetching');
  this.route('model');
  this.route('component');
  this.route('advanced');
});

export default Router;
