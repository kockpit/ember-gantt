import { A } from "@ember/array";
import { getProperties } from "@ember/object";
import dateUtil from 'dummy/utils/date-util';
import { module, test } from 'qunit';

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


module('Unit | Utility | date-util', function(/*hooks*/) {


  test('getNewDate', function(assert) {
    assert.expect(5);

    let today = new Date();
    today.setUTCHours(0,0,0,0);

    let date = dateUtil.getNewDate();
    assert.equal(date.toString(), today.toString(), 'no date passed = today');

    let todayPlus10 = dateUtil.datePlusDays(date, 10);
    let date2 = dateUtil.getNewDate( parseInt(todayPlus10.getTime()) );
    assert.equal(date2.toString(), todayPlus10.toString(), 'from timestamp integer');

    let date3 = dateUtil.getNewDate( ""+(todayPlus10.getTime()) );
    assert.equal(date3.toString(), todayPlus10.toString(), 'from timestamp string');

    let date4 = dateUtil.getNewDate( '2018-05-25');
    assert.equal(date4.toString(), (new Date('2018-05-25')).toString(), 'from iso string (YYYY-MM-DD)');

    let date5 = dateUtil.getNewDate( todayPlus10 );
    assert.equal(date5.toString(), todayPlus10.toString(), 'from date object');
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

  test('diffDays', function(assert) {
    assert.expect(4);

    let days = dateUtil.diffDays(testStartDate, testStartDate, false);
    assert.equal(days, 0, 'same day, not including last day = 0');

    days = dateUtil.diffDays(testStartDate, testStartDate, true);
    assert.equal(days, 1, 'same day, including last day = 1');

    days = dateUtil.diffDays(testStartDate, testEndDate, false);
    assert.equal(days, 49, 'start-end test dates, not including last day');

    days = dateUtil.diffDays(testStartDate, testEndDate, true);
    assert.equal(days, 50, 'start-end test dates, DO include last day');
  });


  test('preparePeriodDateMap', function(assert) {
    assert.expect(5);

    let dateMap = dateUtil.preparePeriodDateMap(timePeriodChilds);

    //
    assert.equal(dateMap.length, (timePeriodChilds.length*2), 'double the size of childs');

    assert.equal(dateMap[0].timestamp, dateUtil.getNewDate(testStartDate).getTime(), 'first timestamp');
    assert.equal(dateMap[0].isStart, true, 'first is start');
    assert.equal(dateMap[dateMap.length-1].timestamp, 1531180800000, 'last timestamp');
    assert.equal(dateMap[dateMap.length-1].isStart, false, 'last is end');

  });

  test('mergeTimePeriods: child starting with range', function(assert) {
    assert.expect(2);

    let periods = dateUtil.mergeTimePeriods(timePeriodChilds, testStartDate, testEndDate);

    let result = periods.map(period => getProperties(period, ['dateStart','dateEnd','childs.length']) );
    let expectedResult = [
      { dateStart: dateUtil.getNewDate('2018-05-25'), dateEnd: dateUtil.getNewDate('2018-05-29'), 'childs.length': 1},
      { dateStart: dateUtil.getNewDate('2018-05-30'), dateEnd: dateUtil.getNewDate('2018-06-09'), 'childs.length': 2},
      { dateStart: dateUtil.getNewDate('2018-06-10'), dateEnd: dateUtil.getNewDate('2018-06-14'), 'childs.length': 1},
      { dateStart: dateUtil.getNewDate('2018-06-15'), dateEnd: dateUtil.getNewDate('2018-06-23'), 'childs.length': 0},
      { dateStart: dateUtil.getNewDate('2018-06-24'), dateEnd: dateUtil.getNewDate('2018-06-28'), 'childs.length': 2},
      { dateStart: dateUtil.getNewDate('2018-06-29'), dateEnd: dateUtil.getNewDate('2018-07-04'), 'childs.length': 3},
      { dateStart: dateUtil.getNewDate('2018-07-05'), dateEnd: dateUtil.getNewDate('2018-07-09'), 'childs.length': 1},
      { dateStart: dateUtil.getNewDate('2018-07-10'), dateEnd: dateUtil.getNewDate('2018-07-14'), 'childs.length': 0}
    ];

    assert.equal(periods.length, 8, 'should create 8 period segments');
    assert.deepEqual( result, expectedResult, "deep-equal resulting data");
  });

  test('mergeTimePeriods: child starting later than range', function(assert) {
    assert.expect(2);

    let childs = A(A(timePeriodChilds).toArray()); // clone test-data
    childs.removeObject(childs.lastObject); // remove starting child (which has same start-date as range)

    let periods = dateUtil.mergeTimePeriods(childs, testStartDate, testEndDate);

    let result = periods.map(period => getProperties(period, ['dateStart','dateEnd','childs.length']) );
    let expectedResult = [
      { dateStart: dateUtil.getNewDate('2018-05-25'), dateEnd: dateUtil.getNewDate('2018-05-29'), 'childs.length': 0},
      { dateStart: dateUtil.getNewDate('2018-05-30'), dateEnd: dateUtil.getNewDate('2018-06-09'), 'childs.length': 1},
      { dateStart: dateUtil.getNewDate('2018-06-10'), dateEnd: dateUtil.getNewDate('2018-06-23'), 'childs.length': 0},
      { dateStart: dateUtil.getNewDate('2018-06-24'), dateEnd: dateUtil.getNewDate('2018-06-28'), 'childs.length': 2},
      { dateStart: dateUtil.getNewDate('2018-06-29'), dateEnd: dateUtil.getNewDate('2018-07-04'), 'childs.length': 3},
      { dateStart: dateUtil.getNewDate('2018-07-05'), dateEnd: dateUtil.getNewDate('2018-07-09'), 'childs.length': 1},
      { dateStart: dateUtil.getNewDate('2018-07-10'), dateEnd: dateUtil.getNewDate('2018-07-14'), 'childs.length': 0}
    ];

    assert.equal(periods.length, 7, 'should create 7 period segments');
    assert.deepEqual( result, expectedResult, "deep-equal resulting data");
  });


});


