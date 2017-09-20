import DS from 'ember-data';
import fetch from 'fetch';
import config from 'ember-get-config';
import { isInDom } from 'nypr-django-for-ember/utils/alien-dom';

export default DS.Adapter.extend({
  findRecord(store, type, id /*, snapshot */) {
    if (isInDom(id)) {
      return document;
    }

    return fetch(`${config.webRoot}/${id === '/' ? '' : id}`, { headers: {'X-WNYC-EMBER':1}})
      .then(checkStatus)
      .then(response => response.text());
  },
  // starting in ember-data 2.0, this defaults to true
  // http://emberjs.com/blog/2015/06/18/ember-data-1-13-released.html#toc_new-adapter-hooks-for-better-caching
  // ember-wormhole is the crux of our page render paradigm, and it relies on
  // element IDs which are generated by the model at run-time; reloading the model
  // in the background recomputes all the embeddedWnycComponent CPs, which causes
  // ember-wormhole to barf due to differences between the rendered IDs and the
  // model element's new IDs
  shouldBackgroundReloadRecord: () => false
});

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response);
    error.response = response;
    throw error;
  }
}
