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
    let { queryParams } = handlers;
    let routeName = handlers[handlers.length - 1].handler;

    handlers = Array.from(handlers);
    handlers.shift()
    // create an array of all the params found in the url for each route
    let params =  handlers.map(({params}) => Object.values(params))
                    .reduce((params, vals) => params.concat(vals), []);

    return { routeName, params, queryParams: { queryParams } };
  }

});
