import Controller from 'ember-controller';

export default Controller.extend({
  actions: {
    // BEGIN-SNIPPET find-page
    getAboutPage() {
      this.store.find('django-page', 'about')
        .then(about => this.set('about', about));
    }
    // END-SNIPPET
  }
})
