import DS from 'ember-data';
import fetch from 'fetch';
import ENV from '../config/environment';
import { isInDom } from '../lib/alien-dom';


export default DS.Adapter.extend({
  findRecord(store, type, id /*, snapshot */) {
    if (isInDom(id)) {
      return document;
    }
    return fetch(ENV.wnycURL + '/' + id.replace(/^\//, ''), { headers: {'X-WNYC-EMBER':1}})
      .then(response => response.text());
  }
});
