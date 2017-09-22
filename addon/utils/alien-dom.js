import config from 'ember-get-config';
import Ember from 'ember';
// The Alien DOM is a DOM that exists beyond the reaches of an Ember app's
// understanding, i.e. an HTML document that is already present when the app boots.

// BEGIN-SNIPPET is-in-dom
// When we are operating in progressive boot mode, Ember can detect if a requested
// django-page model is already present by testing the requested id (the url path)
// against a marker provided by django.
export function isInDom(id) {
  let unrenderedMarker = document.querySelector('[type="text/x-wnyc-marker"]');
  return unrenderedMarker && id === unrenderedMarker.getAttribute('data-url');
}
// END-SNIPPET

// When we have a django-page model ready to load, we need to clean out any remnants
// of an Alien DOM. This will run on every django-page render, but should be a simple
// no-op after one run.
export function clearAlienDom() {
  let toRemove = config.alienDom.toRemove;
  if (!toRemove) {
    let root = config.environment === 'test' ? '#ember-testing' : 'body';
    toRemove = `${root} > :not(.ember-view):not(#fb-root), ${root} > head > link[rel=stylesheet]:not([href*=assets])`;
  }
  let nodesToRemove = document.querySelectorAll(config.alienDom.toRemove);

  Array.from(nodesToRemove).forEach((n) => {
    n.parentNode.removeChild(n);
  });
}

export function addAlienLanding(id, coordinates) {
  let landingSite = document.querySelector(coordinates);
  let lander = document.createElement('div');
  lander.id = id;
  try {
    if (Ember.testing) {
      landingSite.appendChild(lander);
    } else {
      landingSite.parentNode.insertBefore(lander, landingSite);
    }
  } catch(e) {
    return false;
  }
}

// this method could be a one line, but in testing it would open a new window,
// so let's us override in testing with a method of our own, located at
// `window.assign`.
export function assign(url) {
  if (Ember.testing) {
    window.assign(url);
  } else {
    window.location.assign(url);
  }
}
