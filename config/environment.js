/* jshint node: true, multistr: true */


module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'overhaul',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    'ember-metrics': ['google-analytics', 'data-warehouse'],
    metricsAdapters: [],
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    sentry: {
      dsn: process.env.SENTRY_DSN,
      debug: process.env.DEPLOY_TARGET !== 'production',
      development: environment !== 'production'
    },

    renderGoogleAds: true,
    // these are provided via a .env file or else by Django's EmberAdapter
    googleAPIv3Key: process.env.GOOGLE_API_V3_KEY,
    wnycAPI: process.env.WNYC_API,
    wnycAccountRoot: process.env.WNYC_ACCOUNT_ROOT,
    wnycEtagAPI: process.env.WNYC_ETAG_API,
    wnycStaticURL: process.env.WNYC_STATIC_URL,
    wnycURL: process.env.WNYC_URL,
    featureFlags: {
      'django-page-routing': false,
      'persistent-player': false,
      'embedded-components': false
    },
    contentSecurityPolicy: {
      'connect-src': "'self' *.wnyc.net:* ws://*.wnyc.net:*",
      'style-src': "'self' 'unsafe-inline' *.wnyc.net:* *.wnyc.org cloud.typography.com fonts.googleapis.com www.google.com platform.twitter.com",
      'img-src': "'self' data: *",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval' data: *",
      'object-src': "'self' *.wnyc.net:* *.wnyc.org *.moatads.com *.googlesyndication.com",
      'font-src': "'self' data: fonts.gstatic.com",
      'frame-src': "'self' *"
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.LOG_LEGACY_LOADER = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

    ENV.renderGoogleAds = false;
  }

  if (environment === 'production') {
  }

  return ENV;
};
