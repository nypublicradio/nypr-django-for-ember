import { run } from '@ember/runloop';
import Component from '@ember/component';
import { computed, get } from '@ember/object';
import config from 'ember-get-config';
import {
  isInDom,
  clearAlienDom,
} from 'nypr-django-for-ember/utils/alien-dom';
import $ from 'jquery';

import layout from '../templates/components/django-page';

export default Component.extend({
  layout,
  loadingType: computed('page', function() {
    let id = get(this, 'page.id') || '';
    let firstPart = id.split('/')[0];

    switch(firstPart) {
      case '':
        return 'index';
      case 'shows':
      case 'articles':
      case 'series':
      case 'tags':
      case 'blogs':
        return 'channel';
      case 'story':
        return 'story';
      default:
        return 'legacy';
    }
  }),

  didReceiveAttrs() {
    // If we have a new page model, we want to clear any overlaid
    // content when we rerender.
    let page = this.get('page');
    if (page !== this._lastPage) {
      this.set('showingOverlay', false);
    }
  },

  // BEGIN-SNIPPET component-did-render
  didRender() {
    let page = this.get('page');
    if (page !== this._lastPage) {
      this._lastPage = page;
      let elt = this.$('.django-content');
      elt.empty();

      if (isInDom(page.get('id'))) {
        clearAlienDom();
      }

      this.get('page').appendTo(elt).then(() => {
        // After the server-rendered page has been inserted, we
        // re-enable any overlaid content so that it can wormhole
        // itself into the server-rendered DOM.
        this.set('showingOverlay', true);

        if (this.get('session.data.isStaff')) {
          this.revealStaffLinks(this.$(), config.adminRoot);
        }
        this.$().imagesLoaded().progress((i, image) => {
          run(() => {
            image.img.classList.add('is-loaded');
          });
        });

      });
    }
  },
  revealStaffLinks($element, adminRoot) {
    $element.find('.stf').each(function() {
      var $elt, $this = $(this);
      if (this.tagName.toLowerCase() === 'a') {
        $elt = $this;
      } else {
        $this.append($elt = $("<a/>").addClass(this.className));
      }
      $elt.html($elt.html() || 'Edit This').attr("target", '_blank');
      $elt.attr("href", `${adminRoot}/admin/${$this.attr('data-url')}`);
      $this.show();
      $this.parent().show();
    });
  },
  // END-SNIPPET
});
