/*
  This module gathers into one place any tweaks that are needed to
  make the pre-existing Javascript play nicely in a persistent-app
  world.

  The goal is that this set can keep shrinking as features are ported
  out of the old JS.
*/
import $ from 'jquery';

import { get } from '@ember/object';
import { A } from '@ember/array';
import config from 'ember-get-config';
import { assign } from 'nypr-django-for-ember/utils/alien-dom';
import { runOnce } from 'nypr-django-for-ember/services/legacy-loader';
import { canonicalize } from 'nypr-django-for-ember/services/script-loader';

// This gets run by the django-page component right before tearing
// down the content.
export function beforeTeardown(/* element, page */) {
  // player.js listens for a storage event with a handler defined on the wnyc object,
  // which is triggered by logic outside of Ember; unbind to avoid throwing errors
  $(window).off('unload storage');

  // the whats on widget only runs on the homepage but sets up an interval that
  // continues to run. cancel it here so it doesn't run in unsafe contexts
  let timeoutId = get(window, 'wnyc.apis.whatsOnToday.update.updateTimeoutId');
  clearInterval(timeoutId);

  // The mailchimp popup signup form is badly behaved -- it insists on
  // being the only AMD loader on the page. So here we clear it away
  // to make room for the next copy. (Ember's AMD loader is hiding
  // under WNYC_EMBER_LOADER, see lib/unobstrusive-loader.js.)
  window.define = undefined;

  // Most pages don't actually overwrite this if it exists, so it can
  // end up accumulating unexpected cruft.
  window.wnyc = undefined;
}

// This gets run by the django-page model when it's figuring out how
// to append itself to the DOM. It receives an Element (representing
// the content that's about to be appended) and the page model. The
// Element is not yet inserted into any document, and you can modify
// it here as needed.

export function beforeAppend(element) {
  let container = document.createElement('div');
  let legacyContent = element.querySelector('#site') || element.querySelector('#flatpage') || element.querySelector('.wqxr-main-contents');
  if (!legacyContent) {
    // maybe it's a flat page
    legacyContent = element;
  }
  let newContent = document.createElement('div');
  while (legacyContent.firstChild) {
    newContent.appendChild(legacyContent.firstChild);
  }
  container.appendChild(newContent);

  // is there a sitewide chunk? save it from demolition
  let sitewideChunk = element.querySelector('#wnyc-sitewide');
  if (sitewideChunk) {
    container.appendChild(sitewideChunk);
  }
  // container's childNodes are appended to the DOM; container is discarded
  return container;
}

// All the dynamically discovered Javascript that comes along with the
// pages is run through this before executing. You can return non-true
// to cancel the entire script.
export function mangleJavascript(scriptTag, sourceCode) {
  if (A(Object.keys(runOnce)).any(k => scriptTag.src.match(k))) {
    return false;
  } else if (sourceCode === 'bad url') {
    return false;
  }
  return sourceCode;
}

// retrieving this destinationPath failed, possibly because the server
// redirected the request to a new destination which does not respect
// our CORS request. reassign the url to the location and let's see
// what happens
// if it's a 404 or 500, throw it so status code handlers at a higher
// level can respond
export function retryFromServer(error, destinationPath) {
  let { response } = error;
  if (response && (response.status === 404 || response.status === 500)) {
    throw error;
  }
  assign(`${canonicalize(config.webRoot)}/${destinationPath}`);
}
