import Controller from 'ember-controller';

// BEGIN-SNIPPET markup
const TEXT = `
<div class="body">
  <p><button id="legacyButton">Add a paragraph</button></p>
  <p>Hello</p>
</div>
<script type="text/javascript">
  var button = document.getElementById('legacyButton');
  button.addEventListener('click', function() {
    var p = document.createElement('p');
    p.innerHTML = "world!";
    var body = document.querySelector('.body');
    body.appendChild(p);
  });
</script>
`;
// END-SNIPPET

export default Controller.extend({
  actions: {
    makeDjangoPage() {
      // BEGIN-SNIPPET on-the-fly
      let markup = this.store.createRecord('django-page', {text: TEXT});
      this.set('markup', markup);
      // END-SNIPPET
    }
  }
});
