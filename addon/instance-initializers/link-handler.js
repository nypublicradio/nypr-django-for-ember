// based on https://github.com/intercom/ember-href-to/blob/master/app/instance-initializers/browser/ember-href-to.js
import config from 'ember-get-config';
import Ember from 'ember';

function findParent(target, selector) {
  while(target.parentNode) {
    if (target.matches(selector)) {
      return target;
    }
    target = target.parentNode;
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
  } else if (!href.startsWith('/') || href.startsWith('//')) {
                                      // ^^^^ we shouldn't get here if href = current domain
                                      // and if it doesn't we want to open in a new tab
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
  let { target } = event;
  let anchorTag = findParent(target, 'a');

  if (!anchorTag) {
    return; // not a link click
  }

  let { url, href, isExternal } = normalizeHref(anchorTag);
  let validLink = shouldHandleLink(anchorTag);

  if (validLink) {

    if (url === location.toString()) {
      // could be a valid link, but we still want to short circuit if we'll
      // route to the current page
      return false;
    }

    let { routeName, params, queryParams } = router.recognize(href);
    router.transitionTo(routeName, params, queryParams);
    event.preventDefault();
    return false;
  } else if (isExternal && !Ember.testing && !href.startsWith('mailto:')) {
                                             //^^^ don't add _blank to mailto links
    target.setAttribute('target', '_blank');
  }
  return true;
}

export default {
  name: 'link-handler',
  initialize: function(instance) {
    let router = instance.lookup('service:wnyc-routing');
    let boundListener = listener.bind(null, router, instance);
    let root = document.querySelector(instance.rootElement);

    root.addEventListener('click', boundListener);
  }
};
