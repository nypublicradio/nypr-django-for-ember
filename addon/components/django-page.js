import Ember from 'ember';
import service from 'ember-service/inject';
import config from 'ember-get-config';
import LegacySupportMixin from 'nypr-django-for-ember/mixins/legacy-support';
import {
  isInDom,
  clearAlienDom,
} from 'nypr-django-for-ember/utils/alien-dom';

import layout from '../templates/components/django-page';

const { get, computed } = Ember;

export default Ember.Component.extend(LegacySupportMixin, {
  layout,
  router: service('wnyc-routing'),
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
          Ember.run(() => {
            image.img.classList.add('is-loaded');
          });
        });

      });
    }
  },

  goToSearch(q) {
    this.get('router').transitionTo('djangorendered', ['search/'], {q});
  }
});
