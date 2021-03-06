import DS from 'ember-data';
import fetch from 'fetch';
import config from 'ember-get-config';
import { isInDom } from 'nypr-django-for-ember/utils/alien-dom';

export default DS.Adapter.extend({

  findRecord(store, type, id /*, snapshot */) {
    // BEGIN-SNIPPET django-page-top
    if (isInDom(id)) {
      return document;
    }
    // END-SNIPPET

    // BEGIN-SNIPPET django-page-request
    let [path, query] = id.split('?');

    // publisher enforces trailing slashes
    // turn "search" into "search/" and "/" into ""
    path = path === '/' ? '' : path.replace(/\/*$/, '/');
    if (query) {
      path = `${path}?${query}`;
    }

    // wqxr django pages live under a different url now that wqxr is on Fastboot
    let url;
    if (config.siteId == 2){
      url = `${config.wQXRLegacy}/${path}`
    } else {
      url = `${config.webRoot}/${path}`
    }

    return fetch(`${url}`, { headers: {'X-WNYC-EMBER': 1}})
      .then(checkStatus)
      .then(response => response.text());
    // END-SNIPPET
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
  } else if (response.status === 404) {
    let error = new DS.NotFoundError();
    if (typeof FastBoot === 'undefined') {
      error.url = new URL(response.url).pathname.slice(1);
    } else {
      error.url = URL.parse(response.url).pathname.slice(1);
    }
    error.response = response;
    throw error;
  } else {
    let error = new Error(response);
    error.response = response;
    throw error;
  }
}
