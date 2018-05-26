import Route from '@ember/routing/route';
import {isNone} from '@ember/utils';
import EmberObject, { get, computed} from '@ember/object';
import { mapBy, max, min } from '@ember/object/computed';



export default Route.extend({

  model() {

    let projects = [];
    let today = new Date();

    // job-types with color
    let jobTypes = [{
      title: 'Concept',
      color: '#d84599'
    },{
      title: 'Design',
      color: '#71b5a0'
    },{
      title: 'Programming',
      color: '#e5ce42'
    }];

    // let intelligent project object
    let ProjectObject = EmberObject.extend({
          title: 'empty',
          jobs: null,

          jobsStart: mapBy('jobs','dateStart'),
          minStart: min('jobsStart'),
          jobsEnd: mapBy('jobs','dateEnd'),
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
    for(let i=1; i<=3; i++) {

      let jobs = [];
      let numJobs = Math.ceil(Math.random()*8)+2;
      let projectStart = getRandomDate(today, 20, true);

      // some jobs for each project
      for(let j=1; j<numJobs; j++) {
        let jobStart = getRandomDate(projectStart);
        let jobType = jobTypes[j%3];
        jobs.push({
          title: `${jobType.title} ${j}`,
          dateStart: jobStart,
          dateEnd: getRandomDate(jobStart),
          color: jobType.color
        });
      }

      // intelligent project object creation
      projects.push(ProjectObject.create({
          title: `Project ${i}`,
          jobs: jobs
      }));

    }

    // console.log(projects, 'projects');
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


