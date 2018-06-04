import Controller from '@ember/controller';

export default Controller.extend({



  actions: {
    collapse(project) {
      project.toggleProperty('collapsed');
    },
    viewDateChange(startDate, endDate) {
      console.log(startDate, 'view date changed');
    }
  }
});
