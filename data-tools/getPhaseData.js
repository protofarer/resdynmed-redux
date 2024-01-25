#!/usr/bin/env node

// fetch dates for major lunar phases for each year up to 2100
// cull each JSON to the following fields for each phase date: phase, year, month, day, time
// concatenate all JSONs into one JSON
// write to text file to be used as a lookup table

import fs from 'fs';
import { DIR_PHASE, YEAR_START, YEAR_END } from './dataCommon.js';

// fetch, transform, store lunar phase data from US Naval Observatory API
// https://aa.usno.navy.mil/data/api#phase

const QUARTERS = {
	'New Moon': 0,
	'Full Moon': 2,
	'Last Quarter': 3
};


for (let year = YEAR_START; year <= YEAR_END; year++) {
	let rawRes = await fetch(`https://aa.usno.navy.mil/api/moon/phases/year?year=${year}`);
	let response = await rawRes.json();
	const hasPhase = response.phasedata.filter(x => x?.phase);
	const table = hasPhase.map(x => {
		return {
			...x,
			phase: QUARTERS[x.phase]
		}
	});

	fs.writeFile(`${DIR_PHASE}/${year}.json`, JSON.stringify(table), (err) => {
		if (err) {
			console.log(`error writing file for year ${year}`, );
			throw err
		};
		// console.log(`The file for year ${year} has been saved!`);
	});
}

console.log(`Fin fetching phase data for ${YEAR_START}-${YEAR_END}.`);