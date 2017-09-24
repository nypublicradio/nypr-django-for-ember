import Controller from 'ember-controller';

export default Controller.extend({
  actions: {
    // BEGIN-SNIPPET find-page
    getSearchPage() {
      this.set('isLoading', true);

      this.store.find('django-page', 'search')
        .then(search => this.set('search', search))
        .then(() => this.set('isLoading', false));
    }
    // END-SNIPPET
  }
})
