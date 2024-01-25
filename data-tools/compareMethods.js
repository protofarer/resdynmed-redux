#!/usr/bin/env node

// compare precise with simplified method by:
// 1. what sessions are calculated but have different times
// 2. what is the difference between the times
// 3. what sessions are missing or extra

import fs from 'fs';
import { DIR_TOOLS, QUARTERS } from './dataCommon.js';
import { 
	getSunsetData, 
	getPhaseData, 
	findSessionsPrecise, 
	findSessionsSimple 
} from './lib.js';

const file = fs.readFileSync(`${DIR_TOOLS}/testYears.json`);
const data = JSON.parse(file).dayOnePhaseSunsetCurrFULL;

// verify expected test data
const year = data.year;

if (year !== 1915) {
	console.error(`expected year 1915, got ${year}`);
	process.exit(1);
}

const phase = data.phase;
if (phase !== QUARTERS.FULL) {
	console.error(`expected year to start with Full Moon but got phase ${phase} instead`);
	process.exit(1);
}

// TODO need diff phase data function that includes last full moon of previous
// year, and only gets full moons
const phases = getPhaseData(year);
// day": 1,
// month": 1,
// phase": 2,
// time": "12:20",

// day": 8,
// month": 1,
// phase": 3,
// time": "21:12",

// "day": 15,
// "month": 1,
// "phase": 0,
// "time": "14:42",

// "day": 31,
// "month": 1,
// "phase": 2,
// "time": "04:41",

// expect precise
// ~s2: 1/1 FM (sunset after)
// ~s3: 1/2
// ~s4: 1/4
// ~s5: 1/6
// ~s6: 1/8 LQ
// ~s7: 1/10
// ~s8: 1/12
// ~s9: 1/14
// ~s10: 1/15 NM
// ~s1: 1/29 FM - T

// expect simple
// ~s2: 1/2 FM + 1 day
// ~s3: 1/3	+2
// ~s4: 1/4 +3
// ~s5: 1/6 +5
// ~s6: 1/8 +7
// ~s7: 1/9 +8
// ~s8: 1/10 +9
// ~s9: 1/12 +11
// ~s10: 1/14 +13
// ~s1: 1/27 FM - 4

// TODO need diff data function to include sunsets that go as far back to
// include the earliest possible last full moon of prev year
const sunsets = getSunsetData(year);

const sessionsPrecise = findSessionsPrecise(phases, sunsets, year);
sessionsPrecise.sort((a,b) => new Date(Object.keys(a)[0]).getTime() - new Date(Object.keys(b)[0]).getTime());
console.log(`precise sessions`, sessionsPrecise.slice(0,14));

const sessionsSimple = findSessionsSimple(phases, sunsets, year);
sessionsSimple.sort((a,b) => new Date(Object.keys(a)[0]).getTime() - new Date(Object.keys(b)[0]).getTime());
console.log(`simple sessions`, sessionsSimple.slice(0,14));