# NYPR Publisher x Ember Utils

This addon is a collection of Ember framework pieces and utilities that allows for server-rendered areas of NYPR web properties to be rendered inside an Ember app. The brunt of the work was completed in collaboration with @ef4, and further integrated by the NYPR Digital team.

What follows is an overview of the major pieces of this project and how they work together. Much of this text was originally produced by @ef4 and edited by NYPR Digital over time.

**Note**: when the term **app** or **upstream app** is used, it is referring to an Ember app within which this Ember Addon has been installed, e.g. the `wnyc-web-client` or another project that was generated using the `$ ember new` command.

## The Hybrid Architecture

The key to understanding this new architecture is to think of an NYPR web property (e.g. wnyc.org) as two applications, not one. This is a significant shift from how a traditional website works. It's actually much closer to how native mobile apps work, and keeping that analogy in mind can help during development.

The frontend application, written in Ember, manages all navigation and rendering. It communicates with the backend application ([the publisher app](https://github.com/nypublicradio/publisher)) when it needs to fetch or store information. By minimizing the coupling between the two applications, we make it easier to develop and test each one, sticking to the strengths of each respective framework's conventions.

The architecture is "hybrid" because the data passed from backend to frontend is not strictly semantic. It is often pre-rendered into HTML, CSS, and even Javascript. 

## Ember Application Tour

This section highlights several important pieces of the `nypr-django-for-ember` adoon that make the hybrid architecture possible.

### Routing
Routes are defined using standard Ember conventions, in the upstream app's `app/router.js`. The NYPR web client apps have a catch-all route named `djangorendered` that is intended to handle any URL not explicitly defined in the router by fetching the corresponding page from the server and rendering it in the Ember client. This route fetches a `django-page` from Publisher, using everything after the domain as the `id`.

### Fetching Content from Django
There is an Ember Data model named `django-page`, with corresponding adapter and serializer implementations. The adapter and serializer abstract the details of page fetching so the rest of the Ember application can use standard conventions for fetching and caching data.

Requests from the Ember app include a custom `X-WNYC-Ember` HTTP header that is used within Publisher to tailor responses that are more appropriate for consumption by Ember apps, such as stripping script tags which the Ember app is responsible for loading. Search for `HTTP_X_WNYC_EMBER` in the Publisher repo for more information.

The `django-page` model has an `appendTo` method that puts the page's content into the DOM, while dealing gracefully with styles and scripts. It depends on the `script-loader` service (described further below) to simulate the way any scripts would have executed during a normal page load.

The `appendTo` method processes the extracted DOM nodes and prepares any JavaScript, CSS, and embedded Ember components for injection to the Ember context. For any scripts found, it preserves execution order by maintaining its original location in the DOM. This method also calls the `beforeAppend` compat hook (explained below).

### Rendering Django Content
Once you have a `django-page` model, you can render it with the `django-page` component. The component has two important features.

First, it knows how to render the page model into the DOM, accommodating for some legacy features like admin-only edit links and removing any server-rendered DOM nodes.

Second it can gracefully embed dynamic Ember content *inside* the server-rendered content. Here's an excerpt from and older version of the story template in `wnyc-web-client` (it has since been refactored to a conventional Ember template):

```handlebars
{{#django-page page=model.page}}
  {{#if model.story.commentsEnabled }}
    {{#ember-wormhole to="comments" }}
      {{story-comments story=model.story
                       user=model.user
                       getComments=model.getComments
                       browserId=model.browserId.identity }}
    {{/ember-wormhole}}
  {{/if}}
{{/django-page}}
```

The above means "render the given Django page, then if comments are enabled, render the `story-comments` component inside the element with `id="comments"`". This is the key technique for gradually enhancing existing pages with new dynamic capability.

### Intercepting Clicks
Capturing user clicks is critical to enable persistent navigation on the client. To that end, this addon includes a `link-handler` initializer which listens for clicks on the body and converts them into Ember transitions. This conversion only happens on appropriate links, i.e. does not match for a `data-ember-action` attribute, does not have an `ember-view` class, etc. 

### Script Loader Service
The `script-loader` service solves one particular problem: during the initial rendering of a web page, `<script>` tags execute synchronously in order of appearance. But at any later point, newly created `<script>` tags run in unpredictable order. Much of the legacy Javascript assumes strict ordering. So the script loader manually retrieves and executes scripts in exactly the same order they would have run during initial page load.

Another browser feature that only works at initial load is `document.write.` To keep existing legacy scripts working, there is an `async-writer` service that replaces `document.write` for scripts that are running after page load.

`script-loader` and `async-writer` work together to ensure that even scripts added via `document.write` execute in the correct order. But sometimes the legacy code is quirky enough that we don't actually want to run it at all, or we need to deliberately change ordering, which brings us to the legacy-loader.

The `script-loader` leverages a server feature in order to load external JS in parallel. If it detects that a script is from a different domain, it requests the script via the publisher `dynamic-script-loader` endpoint, which serves a proxy to avoid CORS during AJAX ops. The returned text is wrapped with a `<script>` tag and appended to the DOM.

### Legacy Loader and Compatibility Hooks
The `legacy-loader` service and `app/lib/compat-hooks` exist to make the refactoring of legacy Javascript more manageable. When a problem is uncovered, it can often be fixed quickly by adding a new rule to one of these, and later when the offending code gets refactored the rule can be removed.

Publisher uses Django Compressor to manage most Javascript assets. There is a Javascript precompiler called `ModuleWrapper` at `puppy/cms/util/module_wrapper.py`, which adds a tiny module loader interface to each Javascript file. The `legacy-loader` service is able to use that interface to control the execution of individual Javascript files, even after they have been concatenated and minified. See the comments in `app/services/legacy-loader.js` for more detail on how it can be used to suppress or reorder evaluation of individual scripts.

There is an optional `LOG_LEGACY_LOADER` flag in `config/environment.js` that can enable verbose browser console logging of which scripts are running. The log is very helpful in identifying where an exception is coming from, but it's also very noisy when you're working on something else.

### Alien DOMs
Navigating to our sites from an external domain (or e.g. entering www.wnyc.org into a browser location bar) presents a special case for integrating with server-rendered content. Handling these initial loads, or "cold boots", requires the app to be aware of a DOM it can consume without making a network fetch request. The presence of such DOM nodes is considered an Alien DOM and is handled in the following ways.

* When a new `django-page` is requested from the store, the adapter uses the `isInDom` function to see if the given ID is in fact already rendered in the current document. It looks for a script tag generated by Publisher.
* When the `django-page` component is about to render itself using the nodes provided by a given `django-page` data model, it uses `clearAlienDom` to make sure there aren't any server-generated nodes remaining


## Installation

* `git clone <repository-url>` this repository
* `cd nypr-django-for-ember`
* `npm install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
