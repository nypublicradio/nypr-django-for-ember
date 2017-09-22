import DS from 'ember-data';
import Ember from 'ember';
import config from 'ember-get-config';

export default DS.Serializer.extend({
  // BEGIN-SNIPPET django-page-serializer
  normalizeResponse(store, primaryModelClass, payload, id /*, requestType */) {
    let attributes = {};
    if (payload instanceof Document) {
      let doc;
      if (Ember.testing) {
        doc = document.implementation.createHTMLDocument();
        doc.body.appendChild(payload.querySelector('#ember-testing').cloneNode(true));
      } else {
        doc = payload.documentElement.cloneNode(true);
      }

      attributes.inlineDocument = serializeInlineDoc(doc);
    } else {
      attributes.text = payload;
    }

    return {
      data: {
        type: 'django-page',
        id,
        attributes,
      }
    };
  }
  // END-SNIPPET
});

// BEGIN-SNIPPET serialize-inline-doc
// on cold boots, the app consumes the current `document`, so we have to do
// some clean up to make sure that things like rendered Ember components and 
// the <link> and <script> tags for the Ember app aren't consumed as part of the
// django-page model. If we didn't clean these out, every time this django-page
// model was rendered, it would load a new version of the ember app within it self.
function serializeInlineDoc(inlineDoc) {
  let toClean = [];
  toClean.push(...inlineDoc.querySelectorAll('.ember-view'));
  toClean.push(inlineDoc.querySelector('script[src*="assets/vendor"]'));
  toClean.push(inlineDoc.querySelector('script[src*="assets/wnyc-web-client"]'));
  toClean.push(inlineDoc.querySelector('link[href*="assets/vendor"]'));
  toClean.push(inlineDoc.querySelector('link[href*="assets/wnyc-web-client"]'));

  toClean.forEach(n => n && n.parentNode.removeChild(n));

  return inlineDoc;
}
// END-SNIPPET
