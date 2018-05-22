import Route from '@ember/routing/route';
import {isNone} from '@ember/utils';
import EmberObject, { get, computed} from '@ember/object';
import { mapBy, max, min } from '@ember/object/computed';



export default Route.extend({

  model() {

    let projects = [];
    let today = new Date();

    // let intelligent project object
    let ProjectObject = EmberObject.extend({
          title: 'empty',
          jobs: null,

          jobsStart: mapBy('jobs','startsAt'),
          minStart: min('jobsStart'),
          jobsEnd: mapBy('jobs','endsAt'),
          maxEnd: max('jobsEnd'),

          minStartDate: computed('minStart', function() {
            let start = get(this, 'minStart');
            if (typeof start === 'number') {
              let newdate = new Date(start);
              newdate.setUTCHours(0,0,0,0);
              return newdate;
            }
            return start;
          }),
          maxEndDate: computed('maxEnd', function() {
            let end = get(this, 'maxEnd');
            if (typeof end === 'number') {
              let newdate = new Date(end);
              newdate.setUTCHours(0,0,0,0);
              return newdate;
            }
            return end;
          }),
      });

    // create some dummy content
    for(let i=1; i<300; i++) {

      let jobs = [];
      let numJobs = Math.ceil(Math.random()*8)+2;
      let projectStart = getRandomDate(today, 20, true);
      console.log(projectStart, 'startproject');

      // some jobs for each project
      for(let j=1; j<numJobs; j++) {
        let jobStart = getRandomDate(projectStart);
        jobs.push({
          title: `Job ${j}`,
          startsAt: jobStart,
          endsAt: getRandomDate(jobStart)
        });
      }

      // intelligent project object creation
      projects.push(ProjectObject.create({
          title: `Project ${i}`,
          jobs: jobs
      }));

    }

    console.log(projects, 'projects');
    return { projects };
  },


});


function getRandomDate(date, maxDays, allowBefore) {

  allowBefore = isNone(allowBefore) ? false : allowBefore;
  maxDays = maxDays || 30;

  let newDate = new Date(date.getTime());
  newDate.setUTCHours(0,0,0,0);
  let randomDays = Math.ceil(Math.random() * maxDays);

  if (allowBefore) {
    randomDays -= Math.ceil(Math.random()*15);
  }

  newDate.setDate( newDate.getDate() + randomDays );

  return newDate;
}


