import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import dateUtil from '@kockpit/ember-gantt/utils/date-util';

export default Controller.extend({

  ajax: service(),

  projectsData: null,

  goDate: null,
  viewStart: null,
  viewEnd: null,

  init() {
    this._super(...arguments);

    let today = dateUtil.getNewDate();
    set(this, 'viewStart', dateUtil.datePlusDays(today, -10));
    set(this, 'viewEnd', dateUtil.datePlusDays(today, 120));

    set(this, 'goDate', today);

    this.loadProjectsData(this.viewStart, this.viewEnd, '');
  },


  // load initially projects and afterwards only data for newly expanding periods
  loadProjectsData(start, end, expanded) {

    let options = {
      start,
      end,
      ignoreIds: this.projectsData.mapBy('id') // to really assure no deja-vues
    };

    this.ajax.request('/projects', options ).then( data => {

      // push new data at the correct position of the existing data
      if (expanded == 'before') {
        this.projectsData.unshift(data);

      } else if (expanded === 'after') {
        this.projectsData.push(data);

      } else {
        set(this, 'projectsData', data);
      }

    });
  },


  actions: {

    goToDate(date) {
      date = date || dateUtil.getNewDate(); // scroll-to today if date not passed
      this.set('goDate', date);
    },

    /**
     * @param {Date}   newStartDate    new total view start date
     * @param {Date}   newEndDate      new total view end date
     * @param {string} expaned         { 'after' | 'before' }
     * @param {Date}   previousStart   previous start date
     * @param {Date}   previousEnd     previous end date
    */
    loadProjects(newStartDate, newEndDate, expanded, previousStart, previousEnd) {

      // expand before
      if (expanded === 'before') {
        this.loadProjects(newStartDate, previousStart, expanded);

      // expand after
      } else {
        this.loadProjects(previousEnd, newEndDate, expanded);
      }
    }


  }

});
