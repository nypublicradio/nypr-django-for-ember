/*
   The main goal here is parallel loading with sequential
   evaluation. We want to fetch all the scripts in parallel for the
   fastest experience, but we need to evaluate them in their original
   order in case they depend on each other. This has to work both for
   external and inline scripts.
*/

import Service, { inject as service } from '@ember/service';

import { Promise } from 'rsvp';

import fetch from 'fetch';
import { mangleJavascript } from 'nypr-django-for-ember/utils/compat-hooks';
import config from 'ember-get-config';

export default Service.extend({
  asyncWriter: service(),

  init() {
    this._super(...arguments);
    this.stack = [];
  },

  load(scriptTags, containerElement) {
    let sources = Array.from(scriptTags).map(
      tag => loadSource(tag).then(src => ({
        src,
        tag
      }))
    );

    this.stack.unshift({ sources,containerElement });
    if (this.stack.length === 1) {
      this._evalNext();
    }
  },

  _evalNext() {
    if (this.stack.length === 0) {
      return Promise.resolve();
    }

    let { sources, containerElement } = this.stack[0];

    if (sources.length === 0) {
      this.stack.shift();
      return this._evalNext();
    }

    let asyncWriter = this.get('asyncWriter');

    return sources.shift().then(({src, tag}) => {
      let postMangled = mangleJavascript(tag, src);
      if (postMangled) {
        let script = document.createElement('script');
        let cursor = placeholderFor(tag);
        script.textContent = postMangled;
        script.type = 'text/javascript';
        // Since we have already preloaded and inlined the source,
        // these appended scripts will run synchronously.
        // If there's a cursor for this script, use that so it can be added
        // to the same spot in the DOM it is expecting.
        if (cursor) {
          asyncWriter.cursorTo(cursor);
          cursor.parentNode.insertBefore(script, cursor);
        } else {
          containerElement.appendChild(script);
        }

        // Make sure any document.writes get their place at the head
        // of the stack before we move on
        asyncWriter.flush();
      }
    }).finally(() => this._evalNext());
  }

});

export function canonicalize(url) {
  return new URL(url, location.href).toString();
}

// In order to fetch all the scripts via XHR without tripping CORs
// violations, we are proxying them through our own server.
function scriptURL(tag) {
  let origin = canonicalize(config.webRoot);
  let url = canonicalize(tag.attributes.src.value);
  if (url.indexOf(origin) === 0) {
    return url;
  } else {
    return `${config.publisherAPI}/v1/dynamic-script-loader/?url=${encodeURIComponent(canonicalize(url))}`;
  }
}

function loadSource(scriptTag) {
  if (scriptTag.hasAttribute('src')) {
    return fetch(scriptURL(scriptTag)).then(response => response.text());
  } else {
    return Promise.resolve(scriptTag.textContent);
  }
}

function placeholderFor(tag) {
  if (!tag.hasAttribute('data-script-id')) {
    return null;
  }
  let id = tag.getAttribute('data-script-id');
  return document.querySelector(`[data-script-id="${id}"]`);
}
