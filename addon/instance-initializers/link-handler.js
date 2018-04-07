// based on https://github.com/intercom/ember-href-to/blob/master/app/instance-initializers/browser/ember-href-to.js
import config from 'ember-get-config';
import Ember from 'ember';
// import { getOwner } from '@ember/application';

function _trackEvent(data, instance) {
  let metrics = instance.lookup('service:metrics');
  // For future seekers looking for what handles these attributes, these are the strings you are looking for:
  // data-tracking-category, data-tracking-action, data-tracking-region, data-tracking-label
  if (!metrics) {
    return;
  }

  let category = data.trackingCategory;
  let action   = data.trackingAction;
  let analyticsCode  = '';
  let model = null;
  if (data.trackingModel) {
    let store = instance.lookup('service:store');
    model = store.peekRecord('story', data.trackingModel);
  }
  let region   = data.trackingRegion;
  let label    = data.trackingLabel;
  // If a custom tracking label is set on the link, use that
  if (!label) {

    // format label as either 'code', 'region:code', or just 'region',
    // depending on what we have
    if (model) {
      label = analyticsCode = model.get('analyticsCode');
    }
    if (analyticsCode && model) {
      label = `${region}:${analyticsCode}`;
    } else if (region) {
      label = region;
    }
  }
  let eventToTrack = {category, action};
  // don't add empty properties to events
  if (label) {
    eventToTrack.label = label;
  }
  if (model) {
    eventToTrack.model = model;
  }
  metrics.trackEvent('GoogleAnalytics', eventToTrack);
}

function _trackLegacyEvent(event, instance) {
  let legacyAnalytics = instance.lookup('service:legacy-analytics');
  if (legacyAnalytics) {
    legacyAnalytics.dispatch(event);
  }
}

export function normalizeHref(node, base = location) {
  const regex = /^https?:/i;
  let href = node.getAttribute('href') || '';
  let url = new URL(href, base).toString();
  let isExternal = false;
  let protocolFreeWebRoot = config.webRoot.replace(regex, '');
  let protocolFreeUrl = url.replace(regex, '');

  if (href.startsWith('#') || href.startsWith('mailto:') ) {
    return {url, href, isExternal};
  } else if (protocolFreeUrl.startsWith(protocolFreeWebRoot)) {
    href = protocolFreeUrl.replace(protocolFreeWebRoot, '').replace(/^\//, '') || '/';
  } else if (!href.startsWith('/')) {
    href = '';
    isExternal = true;
  }
  return {url, href, isExternal};
}

export function shouldHandleLink(node, base = location) {
  let { href } = normalizeHref(node, base);
  if (node.getAttribute('target') === '_blank') {
    // ignore links bound for a new window
    return false;
  } else if (Array.from(node.classList).includes('ember-view')) {
    // ignore clicks from ember components
    return false;
  } else if (node.getAttribute('data-ember-action')) {
    // ignore clicks from ember actions
    return false;
  } else if (!href || href.startsWith('#') || href.startsWith('?') || href.startsWith('mailto:')) {
    // ignore href-less or otherwise implemented links
    return false;
  } else if (href.split('.').length > 1) {
    // ignore hrefs with a file extension
    return false;
  }
  return true;
}

function listener(router, instance, event) {
  let { target, preventDefault } = event;
  let { url, href, isExternal } = normalizeHref(target);
  let validLink = shouldHandleLink(target);

  // track the click
  if (target.getAttribute('data-tracking-category') && target.getAttribute('data-tracking-action')) {
    _trackEvent(target.dataset, instance);
  }

  if (validLink) {

    if (target.closest('.django-content')) {
      _trackLegacyEvent(event, instance);
    }

    if (url === location.toString()) {
      // could be a valid link, but we still want to short circuit if we'll
      // route to the current page
      return false;
    }

    let { routeName, params, queryParams } = router.recognize(href);
    router.transitionTo(routeName, params, queryParams);
    preventDefault.bind(event)();
    return false;
  } else if (isExternal && !Ember.testing) {
    target.setAttribute('target', '_blank');
  }
  return true;
}

export default {
  name: 'link-handler',
  initialize: function(instance) {
    let router = instance.lookup('service:wnyc-routing');

    document.removeEventListener('click', listener);
    document.addEventListener('click', listener.bind(null, router, instance));
  }
};
