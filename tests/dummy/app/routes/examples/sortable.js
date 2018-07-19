import Route from '@ember/routing/route';
import ExampleRoute from '../../mixins/example-route';

export default Route.extend(ExampleRoute, {

  actions: {

    reorderItems(project, jobs/*, draggedModel*/) {
      project.set('jobs', jobs)
    }
  }
});
