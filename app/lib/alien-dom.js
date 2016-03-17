import config from 'overhaul/config/environment';
// The Alien DOM is a DOM that exists beyond the reaches of an Ember app's
// understanding, i.e. an HTML document that is already present when the app boots.

// Alien DOMs load up various scripts at boot time which must only run once. These
// will be sanitized from the Alien DOM before render so any future renders will
// not try to load these for a second time.
const toSanitize = [
  /.*google\.com\/jsapi/,
  /.*google-analytics.*/,
  /.*googletagservices.*/,
  /.*quantserve.*/,
  /.*googleapis.*/,
  /assets\/vendor.*.js/,
  /assets\/overhaul.*.js/,
];


// This is assigned to in installAlienListener so it can later be referenced for
// removal from the click event.
let alienEventListener;

// When we are operating in progressive boot mode, Ember can detect if a requested
// django-page model is already present by testing the requested id (the url path)
// against a marker provided by django.
export function isInDom(id) {
  let unrenderedMarker = document.querySelector('[type="text/x-wnyc-marker"]');
  return unrenderedMarker && id === unrenderedMarker.getAttribute('data-url');
}

// When we have a django-page model ready to load, we need to clean out any remnants
// of an Alien DOM. This will run on every django-page render, but should be a simple
// no-op after one run.
export function clearAlienDom() {
  let notEmber = document.querySelectorAll('body > :not(.ember-view), head > link[rel=stylesheet]:not([href*=assets])');
  Array.from(notEmber).forEach(n => n.parentNode.removeChild(n));
  document.removeEventListener('click', alienEventListener);
}

// When we have a django-page ready to render for the first time, we need to clean out
// any scripts which should not be reinitizalized as part of the `appendTo` process.
export function sanitizeAlienDom(djangoPage) {
  Array.from(djangoPage.get('document').querySelectorAll('script'))
    .filter(n => toSanitize.find(r => r.test(n.src)))
    .forEach(n => n.parentNode.removeChild(n));
}

// Embedded Ember components require an ID for ember-wormwhole to use them as a
// destination. This runs in the django-page model's separateScripts method as well
// as in the django-page component's didReceiveAttrs hook if an Alien DOM is present.
export function embeddedComponentSetup(root = document) {
  Array.from(root.querySelectorAll('[data-ember-component]')).forEach(function (el, i) {
    // embedded ember components require an ID that is in sync with the
    // django-page document
    el.id = el.id || `ember-component-${i}`;
  });
}

// An Alien DOM means clicks will escape Ember, so the django-page component also
// installs this click handler to capture clicks and send them back to Ember. We have
// to use a closure in order to both capture the passed in component instance as
// well as save the function for later removal from the global click event.
export function installAlienListener(component) {
  alienEventListener = function(e) {
    component.click(e);
  };

  document.addEventListener('click', alienEventListener, false);
}
