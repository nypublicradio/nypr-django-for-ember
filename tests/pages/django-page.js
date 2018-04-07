import { create, visitable } from 'ember-cli-page-object';
import { appendHTML } from 'wnyc-web-client/tests/helpers/html';
import { alienDomClick } from 'nypr-django-for-ember/utils/alien-dom';

export default create({
  visit: visitable(':id'),
  alienClick(selector) {
    return alienDomClick(selector);
  },

  bootstrap({id}) {
    /* eslint-disable */
    let djangoPage = server.schema.djangoPages.find(id);
    /* eslint-enable */
    appendHTML(djangoPage.attrs.text);
    return this;
  }
});
