
import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {

  docsRoute(this, function() { /* Your docs routes go here */ });

  this.route('getting-started');

  this.route('examples', function() {
    this.route('infinity');
    this.route('milestones');
    this.route('sortable');
    this.route('grid-days');
    this.route('collapse');
  });

  this.route('not-found', { path: '/*path' });
});

export default Router;
