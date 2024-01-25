import fs from 'fs';
import { expect, test } from 'vitest';;
import { 
	getPhaseData,
	getSunsetData,
	findNearestSunset,
	findSunsetDatetimeByDay,
	findFirstSunsetAfter,
	findSessionsPrecise,
	findSession1,
	findSession2,
	findSession3,
	findSession4,
	findSession5,
	findSession6,
	findSession7,
	findSession8,
	findSession9,
	findSession10,
	convertPhaseDataToDate, 
} from './lib.js';
import { DIR_PHASE, DIR_TOOLS, QUARTERS } from './dataCommon.js';


test('find sunset by day', () => {
	const sunsets = getSunsetData(2023);

	// * expected happy path
	// finds sunset on same day even if difference is more than 12 hours
	const dt = new Date("2023-01-01");
	const sunset1 = findSunsetDatetimeByDay(dt, sunsets);
	expect(sunset1).toEqual(new Date("2023-01-01T22:42Z"));
	
	// finds sunset on same day despite specifying a time
	const dt2 = new Date("2023-01-01T23:59Z");
	const sunset2 = findSunsetDatetimeByDay(dt2, sunsets);
	expect(sunset2).toEqual(new Date("2023-01-01T22:42Z"));

	// can get last 10 sunsets of previous year
	const dt3 = new Date("2022-12-31");
	const sunset3 = findSunsetDatetimeByDay(dt3, sunsets);
	expect(sunset3).toEqual(new Date("2022-12-31T22:42Z"));

	const dt5 = new Date("2022-12-30");
	const sunset5 = findSunsetDatetimeByDay(dt5, sunsets);
	expect(sunset5).toEqual(new Date("2022-12-30T22:41Z"));

	const dt6 = new Date("2022-12-29");
	const sunset6 = findSunsetDatetimeByDay(dt6, sunsets);
	expect(sunset6).toEqual(new Date("2022-12-29T22:40Z"));

	const dt7 = new Date("2022-12-28");
	const sunset7 = findSunsetDatetimeByDay(dt7, sunsets);
	expect(sunset7).toEqual(new Date("2022-12-28T22:40Z"));

	const dt8 = new Date("2022-12-27");
	const sunset8 = findSunsetDatetimeByDay(dt8, sunsets);
	expect(sunset8).toEqual(new Date("2022-12-27T22:39Z"));

	const dt9 = new Date("2022-12-26");
	const sunset9 = findSunsetDatetimeByDay(dt9, sunsets);
	expect(sunset9).toEqual(new Date("2022-12-26T22:39Z"));

	const dt10 = new Date("2022-12-25");
	const sunset10 = findSunsetDatetimeByDay(dt10, sunsets);
	expect(sunset10).toEqual(new Date("2022-12-25T22:38Z"));

	const dt11 = new Date("2022-12-24");
	const sunset11 = findSunsetDatetimeByDay(dt11, sunsets);
	expect(sunset11).toEqual(new Date("2022-12-24T22:38Z"));

	const dt12 = new Date("2022-12-23");
	const sunset12 = findSunsetDatetimeByDay(dt12, sunsets);
	expect(sunset12).toEqual(new Date("2022-12-23T22:37Z"));

	const dt13 = new Date("2022-12-22");
	const sunset13 = findSunsetDatetimeByDay(dt13, sunsets);
	expect(sunset13).toEqual(new Date("2022-12-22T22:36Z"));

	// can get first 8 sunsets of next year
	const dt4 = new Date("2024-01-01");
	const sunset4 = findSunsetDatetimeByDay(dt4, sunsets);
	expect(sunset4).toEqual(new Date("2024-01-01T22:42Z"));

	const dt14 = new Date("2024-01-02");
	const sunset14 = findSunsetDatetimeByDay(dt14, sunsets);
	expect(sunset14).toEqual(new Date("2024-01-02T22:43Z"));

	const dt15 = new Date("2024-01-03");
	const sunset15 = findSunsetDatetimeByDay(dt15, sunsets);
	expect(sunset15).toEqual(new Date("2024-01-03T22:44Z"));

	const dt16 = new Date("2024-01-04");
	const sunset16 = findSunsetDatetimeByDay(dt16, sunsets);
	expect(sunset16).toEqual(new Date("2024-01-04T22:44Z"));

	const dt17 = new Date("2024-01-05");
	const sunset17 = findSunsetDatetimeByDay(dt17, sunsets);
	expect(sunset17).toEqual(new Date("2024-01-05T22:45Z"));

	const dt18 = new Date("2024-01-06");
	const sunset18 = findSunsetDatetimeByDay(dt18, sunsets);
	expect(sunset18).toEqual(new Date("2024-01-06T22:46Z"));

	const dt19 = new Date("2024-01-07");
	const sunset19 = findSunsetDatetimeByDay(dt19, sunsets);
	expect(sunset19).toEqual(new Date("2024-01-07T22:46Z"));

	const dt20 = new Date("2024-01-08");
	const sunset20 = findSunsetDatetimeByDay(dt20, sunsets);
	expect(sunset20).toEqual(new Date("2024-01-08T22:47Z"));

	// * expected error path
	// no further than 11 sunsets into prevous year
	const dt21 = new Date("2022-12-20");
	const sunset21 = findSunsetDatetimeByDay(dt21, sunsets);
	expect(sunset21).toBeNull();

	// no further than 8 sunsets into next year
	const dt22 = new Date("2024-01-09");
	const sunset22 = findSunsetDatetimeByDay(dt22, sunsets);
	expect(sunset22).toBeNull();

	// cannot get from years more than +/- 1 year
	const dt23 = new Date("2021-12-31");
	const sunset23 = findSunsetDatetimeByDay(dt23, sunsets);
	expect(sunset23).toBeNull();

	const dt24 = new Date("2025-01-01");
	const sunset24 = findSunsetDatetimeByDay(dt24, sunsets);
	expect(sunset24).toBeNull();
})

test('nearest sunset', () => {
	const sunsets = getSunsetData(2023);
	const dt = new Date("2023-01-01");

	// sunset day before: 2022-12-31T22:42Z
	// sunset day of: 2023-01-01T22:42Z
	// sunset day after: 2023-01-02T22:43Z

	const sunset = findNearestSunset(dt, sunsets);
	expect(sunset).toEqual(new Date("2022-12-31T22:42Z"));

	const dt2 = new Date("2023-01-01T12:30Z");
	const sunset2 = findNearestSunset(dt2, sunsets);
	expect(sunset2).toEqual(new Date("2023-01-01T22:42Z"));

	const dt3 = new Date("2023-01-02T23:59Z");
	const sunset3 = findNearestSunset(dt3, sunsets);
	expect(sunset3).toEqual(new Date("2023-01-02T22:43Z"));
})

test('first sunset after', () => {
	const year = 2023;
	const sunsets = getSunsetData(year);
	// sunset day of: 2023-01-01T22:42Z
	// sunset day after: 2023-01-02T22:43Z

	// specify time before sunset, gets sunset same day
	const dt = new Date("2023-01-01");
	const sunset = findFirstSunsetAfter(dt, sunsets, year);
	expect(sunset).toEqual(new Date("2023-01-01T22:42Z"));

	// gets next sunset when time specified interesects a sunset
	const dt2 = new Date("2023-01-01T22:42Z");
	const sunset2 = findFirstSunsetAfter(dt2, sunsets, year);
	expect(sunset2).toEqual(new Date("2023-01-02T22:43Z"));

	// specify time after a sunset, gets next sunset
	const dt5 = new Date("2023-01-01T23:00Z");
	const sunset5 = findFirstSunsetAfter(dt5, sunsets, year);
	expect(sunset5).toEqual(new Date("2023-01-02T22:43Z"));

	// prev year data available
	const dt3 = new Date("2022-12-31");
	const sunset3 = findFirstSunsetAfter(dt3, sunsets, year);
	expect(sunset3).toEqual(new Date("2022-12-31T22:42Z"));

	// next year data available
	const dt4 = new Date("2024-01-01");
	const sunset4 = findFirstSunsetAfter(dt4, sunsets, year);
	expect(sunset4).toEqual(new Date("2024-01-01T22:42Z"));

	// specified date is outside the sunset limit (dates included for calc) but next sunset falls within range

	// date point (out of sunset data range) may be before sunset same day and
	// thus correctly failing to return that sunset but for the wrong reason
	// (couldnt find a sunset for that day), but if the date point is after that
	// excluded sunset we would never know because I simply dont have the time for
	// that excluded sunset. And so, to be able to make that check I must include
	// one more sunset in previous year (from 10 to 11). Does the same apply to
	// next year? :: No.
	// correction: keep that extra sunset, but no sunset should be returned if it
	// falls on same day of a date point outside of included range (see
	// PREV_YEAR_SUNSET_LIMIT)
	const dt6 = new Date("2022-12-21T23:00Z");
	const sunset6 = findFirstSunsetAfter(dt6, sunsets, year);
	expect(sunset6).toEqual(new Date("2022-12-22T22:36Z"));

	// * expected error path
	// if sunset earlier than last 10 sunsets of previous year, returns null
	const dt7 = new Date("2022-12-21");
	const sunset7 = findFirstSunsetAfter(dt7, sunsets, year);
	
	expect(sunset7).toBeNull();

	const dt8 = new Date("2022-12-20");
	const sunset8 = findFirstSunsetAfter(dt8, sunsets, year);
	expect(sunset8).toBeNull();

})

test('trivial sessions: 2, 6, 10', () => {
	const year1 = 2023;
	const phases1 = getPhaseData(year1);
	// 	"day": 6,
	// 	"month": 1,
	// 	"phase": 2,
	// 	"time": "23:08",

	// 	"day": 15,
	// 	"month": 1,
	// 	"phase": 3,
	// 	"time": "02:10",

	// 	"day": 21,
	// 	"month": 1,
	// 	"phase": 0,
	// 	"time": "20:53",
	const sunsets1 = getSunsetData(year1);

	const year2 = 2024;
	const phases2 = getPhaseData(year2);
	// 	"day": 4,
	// 	"month": 1,
	// 	"phase": 3,
	// 	"time": "03:30",

	// 	"day": 11,
	// 	"month": 1,
	// 	"phase": 0,
	// 	"time": "11:57",

	// 	"day": 25,
	// 	"month": 1,
	// 	"phase": 2,
	// 	"time": "17:54",
	const sunsets2 = getSunsetData(year2);


	// SESSION 2

	
	const fm1 = phases1.find(x => x?.phase === QUARTERS.FULL && x.year === year1); // find first full moon
	const dtfm1 = convertPhaseDataToDate(fm1);
	const s21 = findSession2(dtfm1, sunsets1);
	// after FM AND before FM + 2 day
	expect(s21 > dtfm1 && s21 < new Date(s21.getTime() + 2 + 24 * 60 * 60 * 1000)).toBeTruthy();

	const fm2 = phases2.find(x => x?.phase === QUARTERS.FULL && x.year === year2);
	const dtfm2 = convertPhaseDataToDate(fm2);
	const s22 = findSession2(dtfm2, sunsets2);
	expect(s22 > dtfm2 && s22 < new Date(s22.getTime() + 2 * 24 * 60 * 60 * 1000) ).toBeTruthy();


	// SESSION 6

	const lq1 = phases1.find(x => x?.phase === QUARTERS.LAST && x.year === year1); // find first last quarter moon
	const dtlq1 = convertPhaseDataToDate(lq1);
	const s61 = findSession6(dtlq1, sunsets1);
	// since lq @ 1/15 @ 02:10 expect sunset on prev day
	expect(s61.getDate() === 14).toBeTruthy();

	const lq2 = phases2.find(x => x?.phase === QUARTERS.LAST && x.year === year2);
	const dtlq2 = convertPhaseDataToDate(lq2);
	const s62 = findSession6(dtlq2, sunsets2);
	// since lq @ 1/4 @ 3:30 expect sunset on prev day
	expect(s62.getDate() === 3).toBeTruthy();

	// SESSION 10

	const nm1 = phases1.find(x => x?.phase === QUARTERS.NEW && x.year === year1); // first new moon
	const dtnm1 = convertPhaseDataToDate(nm1);
	const s101 = findSession10(dtnm1, sunsets1);
	// since nm @ 1/21 @ 20:53 expect sunset on same day
	expect(s101.getDate() === 21).toBeTruthy();

	const nm2 = phases2.find(x => x?.phase === QUARTERS.NEW && x.year === year2);
	const dtnm2 = convertPhaseDataToDate(nm2);
	const s102 = findSession10(dtnm2, sunsets2);
	// since nm @ 1/11 @ 11:57 expect sunset on same day
	expect(s102.getDate() === 11).toBeTruthy();
})

test.only('sessions for: early year full moon with nearest sunset in prev year', () => {
	const file = fs.readFileSync(`${DIR_TOOLS}/testYears.json`);
	const data = JSON.parse(file).dayOnePhaseSunsetPrevFULL;

	// verify expected test data
	const year = data.year;
	expect(year).toEqual(2048);

	const phase = data.phase;
	expect(phase).toEqual(QUARTERS.FULL);

	const phases = getPhaseData(year);
	// first 3 phases 2048
	// {
	// 	"day": 1,
	// 	"month": 1,
	// 	"phase": 2,
	// 	"time": "06:57",
	// 	"year": 2048
	// },
	// {
	// 	"day": 8,
	// 	"month": 1,
	// 	"phase": 3,
	// 	"time": "18:49",
	// 	"year": 2048
	// },
	// {
	// 	"day": 15,
	// 	"month": 1,
	// 	"phase": 0,
	// 	"time": "11:32",
	// 	"year": 2048
	// },

	// ~s1: 12/30/47
	// ~s2: 1/1/48 FM (sunset after)
	// ~s3: 1/2/48
	// ~s4: 1/4/48
	// ~s5: 1/6/48
	// ~s6: 1/8/48 LQ
	// ~s7: 1/10/48
	// ~s8: 1/12/48
	// ~s9: 1/14/48
	// ~s10: 1/15/48 NM

	const sunsets = getSunsetData(year);
	const sessions = findSessionsPrecise(phases, sunsets, year);
	sessions.sort((a,b) => new Date(Object.keys(a)[0]).getTime() - new Date(Object.keys(b)[0]).getTime());

	expect(Object.keys(sessions[0])[0].slice(0,10)).toEqual('2048-01-01');
	expect(Object.keys(sessions[1])[0].slice(0,10)).toEqual('2048-01-02');
	expect(Object.keys(sessions[2])[0].slice(0,10)).toEqual('2048-01-04');
	expect(Object.keys(sessions[3])[0].slice(0,10)).toEqual('2048-01-06');
	expect(Object.keys(sessions[4])[0].slice(0,10)).toEqual('2048-01-08');
	expect(Object.keys(sessions[5])[0].slice(0,10)).toEqual('2048-01-10');
	expect(Object.keys(sessions[6])[0].slice(0,10)).toEqual('2048-01-12');
	expect(Object.keys(sessions[7])[0].slice(0,10)).toEqual('2048-01-14');
	expect(Object.keys(sessions[8])[0].slice(0,10)).toEqual('2048-01-15');


	// last 5 phases of 2048

	// "day": 20,
	// "month": 11,
	// "phase": 2,
	// "time": "11:19",
	// "year": 2048

	// "day": 28,
	// "month": 11,
	// "phase": 3,
	// "time": "16:33",
	// "year": 2048

	// "day": 5,
	// "month": 12,
	// "phase": 0,
	// "time": "15:30",

	// "day": 20,
	// "month": 12,
	// "phase": 2,
	// "time": "06:39",

	// "day": 28,
	// "month": 12,
	// "phase": 3,
	// "time": "08:31",

	// 1st phase 2049

	// "day": 4,
	// "month": 1,
	// "phase": 0,
	// "time": "02:24",

	// ~s6: 11/28/48 LQ
	// ~s7: 11/29/48 t2=41.7
	// ~s8: 12/1/48
	// ---
	// ~s9: 12/3/48
	// ~s10: 12/5/48 NM
	// ~s1: 12/17/48
	// ~s2: 12/20/48 FM (sunset after)
	// ~s3: 12/21/48
	// ~s4: 12/23/48
	// ~s5: 12/25/48
	// ~s6: 12/27/48 LQ
	// ~s7: 12/29/48
	// ~s8: 12/31/48

	// s1 discrep
	// FM: 12/20 6:39
	// FM - T: 12/18 10:39
	// sunset on 12/18: 22:35
	// delta: 14 hrs
	// thus s1 on 12/17

	// s9 discrep due to short t2 (41.7) used in calc s7, setting s8-s9 back 1 day than guesstimate
	
	expect(Object.keys(sessions[sessions.length - 11])[0].slice(0, 10)).toEqual('2048-12-01');
	expect(Object.keys(sessions[sessions.length - 10])[0].slice(0, 10)).toEqual('2048-12-03');
	expect(Object.keys(sessions[sessions.length - 9])[0].slice(0, 10)).toEqual('2048-12-05');
	expect(Object.keys(sessions[sessions.length - 8])[0].slice(0, 10)).toEqual('2048-12-17');
	expect(Object.keys(sessions[sessions.length - 7])[0].slice(0, 10)).toEqual('2048-12-20');
	expect(Object.keys(sessions[sessions.length - 6])[0].slice(0, 10)).toEqual('2048-12-21');
	expect(Object.keys(sessions[sessions.length - 5])[0].slice(0, 10)).toEqual('2048-12-23');
	expect(Object.keys(sessions[sessions.length - 4])[0].slice(0, 10)).toEqual('2048-12-25');
	expect(Object.keys(sessions[sessions.length - 3])[0].slice(0, 10)).toEqual('2048-12-27');
	expect(Object.keys(sessions[sessions.length - 2])[0].slice(0, 10)).toEqual('2048-12-29');
	expect(Object.keys(sessions[sessions.length - 1])[0].slice(0, 10)).toEqual('2048-12-31');
})