import { Factory, faker } from 'ember-cli-mirage';

/* This is representing the response we're getting from the API. This is different than the discover/story model format we're using in the discover feature. Data gets transformed a bit by the serializer */

export default Factory.extend({
  pk() { return faker.random.uuid(); },
  title() { return faker.lorem.sentence(); },
  tease() { return faker.lorem.sentence(); },
  url() { return faker.internet.url(); },
  audio() { return faker.internet.url(); },
  type(i) { return faker.list.random('nprarticle', 'article')(i); },
  newsdate() { return faker.date.recent(); },
  estimated_duration(i) {
    return Math.floor(faker.random.number.range(60, 3000)(i)); },
  show() {
    return {
      show_url: faker.internet.url(),
      show_pk: faker.random.uuid(),
      show_slug: faker.lorem.words(1),
      show_title: faker.lorem.sentence()
    };
  }
});