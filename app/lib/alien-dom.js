import Ember from 'ember';
import config from 'overhaul/config/environment';
import Ember from 'ember';
// The Alien DOM is a DOM that exists beyond the reaches of an Ember app's
// understanding, i.e. an HTML document that is already present when the app boots.

// This is assigned to in installAlienListeners so it can later be referenced for
// removal from the click event.
let alienClickListener;

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
  let notEmber = document.querySelectorAll(`${config.rootElement} > :not(.ember-view), ${config.rootElement} > head > link[rel=stylesheet]:not([href*=assets])`);
  Array.from(notEmber).forEach(n => n.parentNode.removeChild(n));
}

export function unbindAlienListener() {
  document.removeEventListener('click', alienClickListener);
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

// An Alien DOM means legacy events will escape Ember, so the django-page component also
// installs these handlers to capture clicks and other events and send them back to Ember.
// We have to use a closure in order to both capture the passed in component instance as
// well as save the function for later removal from the global click event.
export function installAlienListeners(component) {
  alienClickListener = function(e) {
    component.click(e);
  };

  document.addEventListener('click', alienClickListener, false);

  imagesLoaded(document.body).on('progress', (i, image) => {
    Ember.run(() => {
      image.img.classList.add('is-loaded');
    });
  });
}
