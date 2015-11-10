import DS from 'ember-data';
import fetch from 'fetch';

export default DS.Adapter.extend({
  findRecord(store, type, id /*, snapshot */) {
    return fetch('/wnyc/' + id)
      .then(response => response.text());
  }
});
