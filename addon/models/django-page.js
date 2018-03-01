import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { Promise, allSettled } from 'rsvp';
import $ from 'jquery';
import Ember from 'ember';
import DS from 'ember-data';
import { getOwner } from '@ember/application';
import { beforeAppend } from 'nypr-django-for-ember/utils/compat-hooks';
import isJavascript from 'nypr-django-for-ember/utils/is-js';

let scriptCounter = 0;

export default DS.Model.extend({
  htmlParser: service(),
  scriptLoader: service(),
  inlineDocument: DS.attr(),
  text: DS.attr(),

  // BEGIN-SNIPPET django-page-document
  document: computed('inlineDocument', 'text', function(){
    let inlineDoc = this.get('inlineDocument');
    let text = this.get('text');
    if (inlineDoc) {
      return inlineDoc;
    } else {
      return this.get('htmlParser').parse(text);
    }
  }),
  // END-SNIPPET

  title: computed('document', function() {
    let titleTag = this.get('document').querySelector('title');
    if (titleTag) {
      return titleTag.textContent;
    }
  }),

  wnycChannel: computed('document', function() {
    let channel = this.get('document').querySelector('#wnyc-channel-jsonapi');
    let channelSerializer = this.store.serializerFor('channel');
    let channelModel = this.store.modelFor('channel');
    let id = this.get('id');
    let json;

    if (channel) {
      try {
        json = JSON.parse(channel.textContent);
      } catch(err) {
        // noop
      }
      if (json) {
        return this.store.push(channelSerializer.normalizeResponse(this.store, channelModel, json, id, 'findRecord'));
      }
    }
  }),

  embeddedEmberComponents: computed('pieces', function() {
    let doc = this.get('pieces.body');
    let instance = getOwner(this);
    return Array.from(doc.querySelectorAll('[data-ember-component]')).map(el => {
      let componentName = el.getAttribute('data-ember-component');
      if (!instance.lookup(`component:${componentName}`)) {
        console.warn(`${componentName} is not available in this app. Will not render embedded component ${componentName}.`); // eslint-disable-line
        return false;
      }
      let id = el.id;
      let args;
      try {
        args = JSON.parse(el.getAttribute('data-ember-args'));
        // TODO: ideally we'd decode the value of all the keys, but we'd need
        // to traverse an arbitrarily nested Object to do it right.
        // Since we know that only itemTitle is encoded server-side, we can just
        // target it here.
        args.itemTitle = args.itemTitle ? decodeURIComponent(args.itemTitle) : '';
        args.itemShow = args.itemShow ? decodeURIComponent(args.itemShow) : '';
        args.content = el.getAttribute('data-text-content');
      } catch(e) {
        if (!Ember.testing) {
          /* eslint-disable */
          console.warn('could not parse', el.getAttribute('data-ember-args'));
          /* eslint-enable */
        }
        args = { error: e };
      }
      return {
        id,
        componentName,
        args
      };
    }).filter(i => i !== false);
  }),

  appendStyles($element, styles) {
    let stylesLoaded = styles.map(s => styleLoaded(s));
    $element.append(styles);
    return allSettled(stylesLoaded);
  },

  pieces: computed('document', function() {
    return this._separateScripts();
  }),

  // BEGIN-SNIPPET separate-scripts
  _separateScripts() {
    let doc = this.get('document');
    let body = importNode(doc.querySelector('body'));
    let scripts = [];

    // First handle <script> in the <head>
    Array.from(doc.querySelectorAll('head script')).forEach(script => {
      if (isJavascript(script)) {
        // Save for later evaluation
        scripts.push(script);
      } else {
        // Non-javascript script tags (templates, for example) get
        // moved from head to body so they will get added to our
        // rendered output (we only output the contents of body, since
        // it doesn't make sense to add a new head to the existing
        // page).
        body.appendChild(importNode(script));
      }
    });

    // Then handle <script> in <body>
    Array.from(body.querySelectorAll('script')).forEach(script => {
      if (isJavascript(script)) {
        // Pull out of body and save for evaluation, leaving a marker
        // in the original spot in case we need to direct any
        // document.writes back there.
        let marker = document.createElement('script');
        marker.type = 'text/x-original-location';
        let id = scriptCounter++;
        marker.setAttribute('data-script-id', id);
        script.parentElement.insertBefore(marker, script);
        script.parentNode.removeChild(script);
        script.setAttribute('data-script-id', id);
        scripts.push(script);
      }
    });

    // Embedded Ember components require an ID for ember-wormwhole to use them as a
    // destination. They will be parsed out later when the `django-page` component renders them out.
    Array.from(body.querySelectorAll('[data-ember-component]')).forEach(function (el) {
      el.id = el.id || guidFor(el);
      el.setAttribute('data-text-content', el.textContent.trim());
      el.textContent = '';
    });

    // Styles, both inline and external, with their relative order maintained.
    let styles = Array.from(doc.querySelectorAll('style, link[rel=stylesheet]')).map(element => importNode(element));

    // Remove the style tags from our imported body, because they will be handled separately.
    Array.from(body.querySelectorAll('style, link[rel=stylesheet]')).forEach(e => e.parentNode.removeChild(e));

    body = beforeAppend(body, this);

    return { body, scripts, styles };
  },
  // END-SNIPPET

  // BEGIN-SNIPPET append-to
  appendTo($element) {
    let loader = this.get('scriptLoader');
    return this.appendStyles($element, this.get('pieces.styles')).finally(() => {
      Array.from(this.get('pieces.body').childNodes).forEach(child => {
        $element[0].appendChild(importNode(child));
      });
      loader.load(this.get('pieces.scripts'), $element[0]);
    });
  }
  // END-SNIPPET
});

// <link> tags do not reliably produce load events, particularly if
// the CSS is already cached.
function styleLoaded(element) {
  if (element.tagName !== 'LINK') {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    $(element)
      .on('load', resolve)
      .on('error', reject);
    let started = Date.now();
    let interval = setInterval(() => {
      if (Date.now() - started > 1000) {
        clearInterval(interval);
        reject();
      } else if (Array.from(document.styleSheets).find(s => s.ownerNode === element)) {
        clearInterval(interval);
        resolve();
      }
    }, 20);

  });
}

function importNode(node) {
  const DEEP_COPY = true;
  return window.document.importNode(node, DEEP_COPY);
}
