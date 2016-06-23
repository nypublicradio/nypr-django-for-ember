import Ember from 'ember';

export default Ember.Service.extend({
  session: Ember.inject.service(),

  selectedTopicTags:[],
  selectedShowSlugs:[],

  setupComplete: false,
  currentSetupStep: 'start',

  init() {
    this.loadFromSession();
  },

  loadFromSession() {
    let session = this.get('session');
    let topics  = session.getWithDefault('data.discover-topics', []);
    let shows   = session.getWithDefault('data.discover-shows', []);
    let setupComplete = session.getWithDefault('data.discover-setup-complete', false);
    let currentSetupStep = session.getWithDefault('data.discover-current-setup-step', 'start');

    this.set('selectedTopicTags', topics);
    this.set('selectedShowSlugs', shows);
    this.set('setupComplete', setupComplete);
    this.set('currentSetupStep', currentSetupStep);
  },

  setDefaultShows(slugs) {
    if (this.get('selectedShowSlugs').length === 0) {
      this.set('selectedShowSlugs', slugs);
    }
  },

  setDefaultTopics(tags) {
    if (this.get('selectedTopicTags').length === 0) {
      this.set('selectedTopicTags', tags);
    }
  },

  discard() {
    this.loadFromSession();
  },

  save() {
    let session = this.get('session');
    session.set('data.discover-shows', this.get('selectedShowSlugs'));
    session.set('data.discover-topics', this.get('selectedTopicTags'));
    session.set('data.discover-setup-complete', this.get('setupComplete'));
    session.set('data.discover-current-setup-step', this.get('currentSetupStep'));

  }
});