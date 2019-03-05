import { getProperties } from "@ember/object";
import dateUtil from 'dummy/utils/date-util';
import { module, test } from 'qunit';
import { htmlSafe } from '@ember/string';

// prepare test data
const testStartDate = new Date(1527266746009);                // Fri May 25 2018 18:45:46 GMT+0200 (CEST)
const testEndDate = dateUtil.datePlusDays(testStartDate, 50); // Sat Jul 14 2018 02:00:00 GMT+0200 (CEST)
const timePeriodChilds = [{
    dateStart: dateUtil.datePlusDays(testStartDate, 5),  // during first child
    dateEnd: dateUtil.datePlusDays(testStartDate, 15),
    color: '#333'
  },{
    dateStart: dateUtil.datePlusDays(testStartDate, 30), // after no active child period
    dateEnd: dateUtil.datePlusDays(testStartDate, 40),
    color: '#444'
  },{
    dateStart: dateUtil.datePlusDays(testStartDate, 30), // identical period to above
    dateEnd: dateUtil.datePlusDays(testStartDate, 40),
    color: '#555'
  },{
    dateStart: dateUtil.datePlusDays(testStartDate, 35), // starts during above but ends later
    dateEnd: dateUtil.datePlusDays(testStartDate, 45),
    color: '#333'
  },{
    dateStart: testStartDate,
    dateEnd: dateUtil.datePlusDays(testStartDate, 20), //
    color: '#111'
  }];


const getDate = function(date) {
  return dateUtil.getNewDate(date);
}


module('Unit | Utility | date-util', function(/*hooks*/) {


  test('getNewDate', function(assert) {
    assert.expect(7);

    let today = new Date();
    today.setUTCHours(0,0,0,0);

    let date = getDate();
    assert.equal(date.toUTCString(), today.toUTCString(), 'no date passed = today');
    assert.equal(date.getUTCMinutes(), 0, 'no mintues');
    assert.equal(date.getUTCHours(), 0, 'no hours');

    let todayPlus10 = dateUtil.datePlusDays(date, 10);

    let date2 = getDate( parseInt(todayPlus10.getTime()) );
    assert.equal(date2.toUTCString(), todayPlus10.toUTCString(), 'from timestamp integer');

    let date3 = getDate( ""+(todayPlus10.getTime()) );
    assert.equal(date3.toUTCString(), todayPlus10.toUTCString(), 'from timestamp string');

    let date4 = getDate('2018-05-25');
    assert.equal(date4.toUTCString(), (new Date('2018-05-25')).toUTCString(), 'from iso string (YYYY-MM-DD)');

    let date5 = getDate(todayPlus10);
    assert.equal(date5.toUTCString(), todayPlus10.toUTCString(), 'from date object');
  });

  test('dateNoTime', function(assert) {

    let newDate = new Date();
    let result = dateUtil.dateNoTime(newDate);

    assert.equal(result.getUTCHours(), 0);
  });

  test('datePlusDays', function(assert) {
    assert.expect(3);

    let today = new Date(1527266746009);
    let tomorrow = dateUtil.datePlusDays(today, 1);
    assert.equal(tomorrow.getTime(), 1527292800000, 'day after');

    let newDate = new Date(1527266746009);
    let result = dateUtil.datePlusDays(newDate, 500);
    assert.equal(result.getTime(), 1570406400000, 'positive value for days');

    result = dateUtil.datePlusDays(newDate, -300);
    assert.equal(result.getTime(), 1501286400000, 'negative value for days');
  });

  test('daysInMonth', function(assert) {
    assert.expect(4);

    assert.equal(dateUtil.daysInMonth(new Date('2018-02-05')), 28, 'february');
    assert.equal(dateUtil.daysInMonth(new Date('2016-02-05')), 29, 'february in leap year');
    assert.equal(dateUtil.daysInMonth(new Date('2017-06-05')), 30, 'june');
    assert.equal(dateUtil.daysInMonth(new Date('2017-07-05')), 31, 'july');

  });

  test('getMonthName', function(assert) {
    assert.equal(dateUtil.getMonthName('2018-07-03', false,  'EN-US'), 'July 2018', 'month July');
    assert.equal(dateUtil.getMonthName('2018-07-03', false,  'EN-US'), 'July 2018', 'month July, short=false');
    assert.equal(dateUtil.getMonthName('2018-07-03', true,   'EN-US'), 'Jul', 'month July, short=true');
    assert.equal(dateUtil.getMonthName('2018-07-03', false,  'DE-DE'), 'Juli 2018', 'month July, in German');

    assert.equal(dateUtil.getMonthName('2018-07-01', false,  'EN-US'), 'July 2018', 'timezone: first july');
    //assert.equal(dateUtil.getMonthName('2018-06-31', false,  'EN-US'), 'June 2018', 'timezone: last june');
  });

  test('diffDays', function(assert) {
    assert.expect(7);

    let days = dateUtil.diffDays(testStartDate, testStartDate, false);
    assert.equal(days, 0, 'same day, not including last day = 0');

    days = dateUtil.diffDays(testStartDate, testStartDate, true);
    assert.equal(days, 1, 'same day, including last day = 1');

    let date1 = getDate('2018-05-29');
    let date2 = getDate('2018-06-05');
    assert.equal(dateUtil.diffDays(date1, date2, false), 7, '29th may to 5th june');
    assert.equal(dateUtil.diffDays(date1, date2, true), 8, '29th may to 5th june, including day');

    days = dateUtil.diffDays(testStartDate, testEndDate, false);
    assert.equal(days, 50, 'start-end test dates, not including last day');

    days = dateUtil.diffDays(testStartDate, testEndDate, true);
    assert.equal(days, 51, 'start-end test dates, DO include last day');

    days = dateUtil.diffDays(getDate('2015-01-01'), getDate('2016-12-31'), true);
    assert.equal(days, 731, '2015-01-01 to 2016-12-31 (2016 as leap year)');
  });

  test('getCW', function(assert) {
    assert.expect(7);

    let date = getDate('2016-12-31');
    assert.equal(dateUtil.getCW(date), 52, 'last day of 2016');

    date = getDate('2017-01-01');
    assert.equal(dateUtil.getCW(date), 52, 'first day of 2017');

    date = getDate('2017-01-02');
    assert.equal(dateUtil.getCW(date), 1, 'starting first cw in 2017');

    date = getDate('2017-01-08');
    assert.equal(dateUtil.getCW(date), 1, 'last day of first cw in 2017');

    date = getDate('2017-01-09');
    assert.equal(dateUtil.getCW(date), 2, '2017-01-09');

    date = getDate('2017-12-24');
    assert.equal(dateUtil.getCW(date), 51, '2017-12-24');

    date = getDate('2015-12-31');
    assert.equal(dateUtil.getCW(date), 53, '2015-12-31'); // having 53 cws

  });

//http://localhost:4200/#/projects/timeline?lead=37%2C31
  test('preparePeriodDateMap: normal', function(assert) {
    assert.expect(5);

    let start = getDate("2018-04-10");
    let end = getDate("2018-08-25");
    let dateMap = dateUtil.preparePeriodDateMap(timePeriodChilds, start, end);

    //
    assert.equal(dateMap.length, (timePeriodChilds.length*2), 'double the size of childs');

    assert.equal(dateMap[0].timestamp, getDate(testStartDate).getTime(), 'first timestamp');
    assert.equal(dateMap[0].isStart, true, 'first is start');
    assert.equal(dateMap[dateMap.length-1].timestamp, 1531180800000, 'last timestamp');
    assert.equal(dateMap[dateMap.length-1].isStart, false, 'last is end');

  });


  test('preparePeriodDateMap: having childs before periodStart and after periodEnd', function(assert) {
    assert.expect(1);

    let start = getDate("2018-05-10");
    let end = getDate("2018-06-25");

    let childs = [
      { dateStart: getDate("2018-04-10"), dateEnd: getDate("2018-05-01")}, // before
      { dateStart: getDate("2018-05-05"), dateEnd: getDate("2018-05-15")}, // overlapping
      { dateStart: getDate("2018-05-15"), dateEnd: getDate("2018-06-10")}, // fully in period (overlapping with prior)
      { dateStart: getDate("2018-06-26"), dateEnd: getDate("2018-06-30")}  // after
    ];

    let dateMap = dateUtil.preparePeriodDateMap(childs, start, end);
    // console.log(dateMap, 'dm');
    dateMap = dateMap.map(item =>  getProperties(item, ['timestamp', 'isStart'] )); // remove childs

    // starting with periodStart end ending with periodEnd
    let expectedResult = [
      { timestamp: getDate('2018-05-10').getTime(), isStart: true },
      { timestamp: getDate('2018-05-15').getTime(), isStart: true },
      { timestamp: getDate('2018-05-16').getTime(), isStart: false },
      { timestamp: getDate('2018-06-11').getTime(), isStart: false }
    ];

    assert.deepEqual( dateMap, expectedResult, "deep-equal resulting data");
  });


  test('mergeTimePeriods: child starting with range', function(assert) {
    assert.expect(2);

    let periods = dateUtil.mergeTimePeriods(timePeriodChilds, testStartDate, testEndDate);

    let result = periods.map(period => getProperties(period, ['dateStart','dateEnd','childs.length']) );
    let expectedResult = [
      { dateStart: getDate('2018-05-25'), dateEnd: getDate('2018-05-29'), 'childs.length': 1},
      { dateStart: getDate('2018-05-30'), dateEnd: getDate('2018-06-09'), 'childs.length': 2},
      { dateStart: getDate('2018-06-10'), dateEnd: getDate('2018-06-14'), 'childs.length': 1},
      { dateStart: getDate('2018-06-15'), dateEnd: getDate('2018-06-23'), 'childs.length': 0},
      { dateStart: getDate('2018-06-24'), dateEnd: getDate('2018-06-28'), 'childs.length': 2},
      { dateStart: getDate('2018-06-29'), dateEnd: getDate('2018-07-04'), 'childs.length': 3},
      { dateStart: getDate('2018-07-05'), dateEnd: getDate('2018-07-09'), 'childs.length': 1},
      { dateStart: getDate('2018-07-10'), dateEnd: getDate('2018-07-14'), 'childs.length': 0}
    ];

    assert.equal(periods.length, 8, 'should create 8 period segments');
    assert.deepEqual( result, expectedResult, "deep-equal resulting data");
  });

  test('mergeTimePeriods: child starting later than range', function(assert) {
    assert.expect(2);

    // clone test-data, without starting child (which has same start-date as range)
    let childs = timePeriodChilds.slice(0, 4);

    let periods = dateUtil.mergeTimePeriods(childs, testStartDate, testEndDate);

    let result = periods.map(period => getProperties(period, ['dateStart','dateEnd','childs.length']) );
    let expectedResult = [
      { dateStart: getDate('2018-05-25'), dateEnd: getDate('2018-05-29'), 'childs.length': 0},
      { dateStart: getDate('2018-05-30'), dateEnd: getDate('2018-06-09'), 'childs.length': 1},
      { dateStart: getDate('2018-06-10'), dateEnd: getDate('2018-06-23'), 'childs.length': 0},
      { dateStart: getDate('2018-06-24'), dateEnd: getDate('2018-06-28'), 'childs.length': 2},
      { dateStart: getDate('2018-06-29'), dateEnd: getDate('2018-07-04'), 'childs.length': 3},
      { dateStart: getDate('2018-07-05'), dateEnd: getDate('2018-07-09'), 'childs.length': 1},
      { dateStart: getDate('2018-07-10'), dateEnd: getDate('2018-07-14'), 'childs.length': 0}
    ];

    assert.equal(periods.length, 7, 'should create 7 period segments');
    assert.deepEqual( result, expectedResult, "deep-equal resulting data");
  });


  test('yearsInPeriod', function(assert) {
    assert.expect(2);

    let start = getDate('2015-02-15');
    let end = getDate('2017-01-01');
    let dayWidth = 10;

    let result = dateUtil.yearsInPeriod(start, end, dayWidth);
    let exptected = [
      { date: start, nr: 2015, width: htmlSafe('width:3200px')}, // 365 - (31 + 14) = 320
      { date: getDate('2016-01-01'), nr: 2016, width: htmlSafe('width:3660px')}, // 366 days
      { date: getDate('2017-01-01'), nr: 2017, width: htmlSafe('width:10px')}, // 1 day
    ];

    assert.deepEqual( result, exptected, "deep-equal resulting years");


    end = getDate('2015-06-15');
    result = dateUtil.yearsInPeriod(start, end, dayWidth);
    exptected = [{ date: start, nr: 2015, width: htmlSafe('width:1210px') }];

    assert.deepEqual( result, exptected, "deep-equal resulting years #2");
  });






});


