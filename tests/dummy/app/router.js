import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('getting-started');

  this.route('examples', function() {
    this.route('infinity');
    this.route('milestones');
  });
});

export default Router;
