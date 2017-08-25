// based on https://github.com/intercom/ember-href-to/blob/master/app/instance-initializers/browser/ember-href-to.js
import Ember from 'ember';
const { $ } = Ember;

function _trackEvent(data, instance) {
  let metrics = instance.lookup('service:metrics');
  // For future seekers looking for what handles these attributes, these are the strings you are looking for:
  // data-tracking-category, data-tracking-action, data-tracking-region, data-tracking-label

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
  legacyAnalytics.dispatch(event);
}

function isExternalUrl(url) {
  let urlParser = document.createElement('a');
  url = url || '';
  urlParser.href = url;
  return (urlParser.host !== window.location.host);
}

export function normalizeHref(node, base = window.location.origin) {
  let href = node.getAttribute('href') || '';
  let url = new URL(href, base).toString();
  let isExternal = false;

  if (href.startsWith('#') || href.startsWith('mailto:')) {
    return {url, href, isExternal};
  }
  else if (isExternalUrl(url)) {
    href = '';
    isExternal = true;
  }
  else {
    let urlParser = document.createElement('a');
    urlParser.href = url;
    href = urlParser.href.replace(urlParser.origin + '/', '')  }
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

export default {
  name: 'link-handler',
  initialize: function(instance) {
    let router = instance.lookup('service:wnyc-routing');
    let $body = $(document.body);

    $body.off('click.href-to', 'a');
    // TODO: abstract from django component
    $body.on('click.href-to', 'a', function(event) {
      let { currentTarget, preventDefault } = event;
      let { url, href, isExternal } = normalizeHref(currentTarget);
      let validLink = shouldHandleLink(currentTarget);
      let $target = $(currentTarget);

      // track the click
      if ($target.data('trackingCategory') && $target.data('trackingAction')) {
        _trackEvent($target.data(), instance);
      }

      if (validLink) {

        if ($target.closest('.django-content').length > 0 ) {
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
        $target.attr('target', '_blank');
      }
      return true;
    });
  }
};