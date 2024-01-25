#!/usr/bin/env node

import fs from 'fs';

// fetch source data required for daily sunset times for each day of each year up to 2100

// fetch daily sun and moon data from US Naval Observatory API
// https://aa.usno.navy.mil/data/api#rstt
// query template https://aa.usno.navy.mil/api/rstt/oneday?date=DATE&coords=COORDS&tz=TZ

// ID "id=<name or abbrev>"
// DATE "date=YYYY-MM-DD"
// COORDS "coords=<lat,long>" eg "coords=33.71,-10.445"
// TZ (optional) "tz=-5"

// already done 2022-2100, 1971-1976
import { MY_COORDS, DIR_DAILY, YEAR_START, YEAR_END } from './dataCommon.js';
import { isLeapYear } from './lib.js';

let date = new Date(YEAR_START,0,1);
let currYear = YEAR_START;
let d = 0;
let dataYear = {};

while (date.getFullYear() <= YEAR_END) {
	let datestring = date.toISOString().slice(0,10);

	try {

		let rawRes = await fetch(`https://aa.usno.navy.mil/api/rstt/oneday?id=kennybar&date=${datestring}&coords=${MY_COORDS}`);
		let response = await rawRes.json();
		dataYear[datestring] = response;

	} catch (err) {

		console.log(`error fetching data for ${datestring}`, );
		fs.writeFile(`${DIR_DAILY}/${currYear}-error.json`, JSON.stringify(dataYear), (err) => {
			if (err) {
				console.log(`error writing errored daily sun and moon file for year ${currYear}`, );
				throw err
			};
		});

	}

	date.setDate(date.getDate() + 1);

	d++;
	if (d % 10 == 0)
		status(d, currYear);

	// when encounter new year, save to file, start new dict
	if (date.getFullYear() > currYear) {
		console.log(``);
		fs.writeFile(`${DIR_DAILY}/${currYear}.json`, JSON.stringify(dataYear), (err) => {
			if (err) {
				console.log(`error writing daily sun and moon file for year ${currYear}`, );
				throw err
			};
			// console.log(`The daily sun moon file for year ${currYear} has been saved!`);
		});

		currYear = date.getFullYear();
		dataYear = {};
		d = 0;
	}
}

console.log(`\nFin fetching daily data for ${YEAR_START}-${YEAR_END}.`);


function status(d, currYear) {
	let daysInYear = isLeapYear(currYear) ? 366 : 365;
	let percentageComplete = ((d / daysInYear) * 100).toFixed(2);
	// clear line
	process.stdout.write(`\r${' '.repeat(process.stdout.columns)}\r`);
	// write line
	process.stdout.write(`\rYear ${currYear}: ${percentageComplete}% complete (${d}/${daysInYear} days fetched).`);
	// console.log(`Year ${currYear}: ${percentageComplete}% complete (${d}/${daysInYear} days fetched).`);
}
