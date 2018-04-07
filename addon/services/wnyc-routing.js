/*
   Ember doesn't expose a public router service yet, but it will soon,
   and it's really convenient to have in a component-centric
   world. This encapsulates some use of private API to give us the
   benefits now, with an easy upgrade path to the future solution.

   See also https://github.com/emberjs/rfcs/pull/95

   TODO: remove this after Ember 2.15 ships, which includes a public router
*/
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  router: service(),
  transitionTo(routeName, models, queryParams) {
    this.get('router').transitionTo(routeName, ...models, queryParams);
  },

  recognize(url) {
    let handlers = this.get('router')._router._routerMicrolib.recognizer.recognize(url);
    // recognize returns queryParams as a property on the handlers array
    // seems strange, maybe it's a bug? problems with a private API
    let { queryParams } = handlers;
    let handler = handlers[handlers.length - 1];
    let params = Object.keys(handler.params).map(key => handler.params[key]);
    return { routeName: handler.handler, params, queryParams: { queryParams } };
  }

});
