import Controller from '@ember/controller';

export default Controller.extend(ExampleController, {

  actions: {

    collapse(project) {
      project.toggleProperty('collapsed');
    }

  }

});
