import Route from '@ember/routing/route';

export default Route.extend({

  // ...

  actions: {

    reorderItems(project, jobs/*, draggedModel*/) {
      project.set('jobs', jobs)
    }

  }

});
