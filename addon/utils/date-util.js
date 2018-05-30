import { isArray, A } from "@ember/array";
import { get } from "@ember/object";
import { isNone } from "@ember/utils";


export default {

  /**
   * Get new date (from given date) in UTC and without time!
   *
   * @method getNewDate
   * @param Date  fromDate
   * @return Date cloned date with 0 time in UTC TZ
   * @public
   */
  getNewDate(fromDate) {
    let date = null;

    if (fromDate && typeof fromDate.getTime === 'function') {
      date = new Date(fromDate.getTime());

    } else if (typeof fromDate === 'string' && !isNaN(fromDate)) {
      date = new Date(parseInt(fromDate));
    } else if (typeof fromDate === 'number' || typeof fromDate === 'string') {
      date = new Date(fromDate);
    }

    if (isNone(fromDate)) {
      date = new Date();
    }

    date = this.dateNoTime(date);
    return date;
  },

  /**
   * Remove time from date (set 0) and set to UTC
   *
   * @method dateNoTime
   * @param Date  date
   * @return Date date without time in UTC
   * @public
   */
  dateNoTime(date) {
    date.setUTCHours(0,0,0,0);
    return date;
  },

  /**
   * Generate new date from given date + given number of days
   *
   * @method datePlusDays
   * @param Date  date
   * @param int   days
   * @return Date cloned date n-days later
   * @public
   */
  datePlusDays(date, days) {
    let newDate = this.getNewDate(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  },

  /**
   * Calculate number of days in a month
   *
   * @method daysInMonth
   * @param Date  date  date of day in that month
   * @return int number of days in that month (28-31)
   * @public
   */
  daysInMonth(date) {
    let newDate = this.getNewDate(date);
    newDate.setMonth(newDate.getMonth()+1);
    newDate.setDate(0);  // set to last day of previous month
    return newDate.getDate();
  },

  /**
   * Day difference between two dates
   *
   * @method datePlusDays
   * @param Date  startDate
   * @param Date  endDate
   * @param bool  includeLastDay  adds an additional day for the last date
   * @return int  number of days inbetween
   * @public
   */
  diffDays(startDate, endDate, includeLastDay) {

    if (!startDate || !endDate) return;

    startDate.setUTCHours(0,0,0,0);
    endDate.setUTCHours(0,0,0,0);

    let diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (86400000)); // 86400000 = 24*60*60*1000;

    if (includeLastDay) {
      diffDays+=1;
    }

    return diffDays;
  },

  /**
   * Get Calendar-Week to date
   *
   * @method getCW
   * @param Date  date
   * @return int  calendar week
   * @public
   */
  getCW(date) {
    date.setUTCHours(0,0,0,0);
    let onejan = new Date(date.getFullYear(),0,1);
    let dayOfYear = ((date - onejan + 86400000)/86400000);
    return Math.ceil(dayOfYear/7)
  },

  /**
   * Merge time-period objects that implement dateStart and dateEnd attributes within a given date range
   *
   * @method mergeTimePeriods
   * @param array childs
   * @param Date  periodStartDate
   * @param Date  periodEndDate
   * @return array
   * @public
   */
  mergeTimePeriods(childs, periodStartDate, periodEndDate) {

    if (!isArray(childs) || !(childs.length > 0)) return null;


    // go through dates and search periods including active childs
    let periods = A(),
        actChilds = A() ,
        actIndex = 0,
        actDate = this.getNewDate(periodStartDate).getTime(), // assure 0 hours UTC
        endDate = this.datePlusDays(periodEndDate, 1).getTime(),
        dateMap = this.preparePeriodDateMap(childs);

    let debugmax = 3;
    while(actDate < endDate) {

      // TODO: remove once its stable
      debugmax++;
      if (debugmax>1000) break;

      // add/remove childs with same start/end date to/from stack
      while(dateMap[actIndex] && dateMap[actIndex].timestamp === actDate) {

        let dateItem = dateMap[actIndex];

        if (dateItem.isStart) {
          actChilds.pushObject(dateItem.child);
        } else {
          actChilds.removeObject(dateItem.child);
        }

        actIndex++;
      }

      // next date
      let nextDate = (dateMap.length > (actIndex)) ? dateMap[actIndex].timestamp : endDate;

      // add period entry with active childs
      periods.pushObject({
        dateStart: this.getNewDate(actDate),
        dateEnd: this.datePlusDays(nextDate, -1), // including last day
        childs: A(actChilds.toArray()) // clone it
      });

      // start next iteration with nextDate
      actDate = nextDate;
    }

    return periods;
  },

  /**
   * Prepare array from period-childs consisting of objects with all start/end dates for iterating
   *
   * @method preparePeriodDateMap
   * @param array childs
   * @return array format: [{ timestamp:timestamp1, isStart:true, child:childObj }, {timestamp:timestamp2, isStart:false, child:childObj2 }}
   * @private
   */
  preparePeriodDateMap(childs) {

    let dateMap = A();
    childs.forEach(child => {

      // dateStart
      dateMap.pushObject({
        timestamp: this.getNewDate(get(child, 'dateStart')).getTime(),
        debugDate: this.getNewDate(get(child, 'dateStart')),
        isStart: true,
        child: child
      });

      // dateEnd
      dateMap.pushObject({
        timestamp: this.datePlusDays(get(child, 'dateEnd'), +1).getTime(), // add 1 day, so overlapping is ok
        isStart: false,
        child: child
      });

    });

    return dateMap.sortBy('timestamp');
  }

}
