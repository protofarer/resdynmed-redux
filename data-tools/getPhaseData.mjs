#!/usr/bin/env node

// fetch dates for major lunar phases for each year up to 2100
// cull each JSON to the following fields for each phase date: phase, year, month, day, time
// concatenate all JSONs into one JSON
// write to text file to be used as a lookup table

import fs from 'fs';
import path from 'path';
import { DIR_MOONPHASES } from './dataCommon.mjs';

// fetch, transform, store lunar phase data from US Naval Observatory API
// https://aa.usno.navy.mil/data/api#phase

const QUARTERS = {
	'New Moon': 'NEW',
	'First Quarter': 'FIRST',
	'Full Moon': 'FULL',
	'Last Quarter': 'LAST'
};

const [START, END] = [1700, 2100];

async function fetchAll() {
	for (let year = START; year <= END; year++) {
		let res = await fetch(`https://aa.usno.navy.mil/api/moon/phases/year?year=${year}`);
		let data = await res.json();
		const hasPhase = data.phasedata.filter(x => x?.phase);
		const transformed = hasPhase.map(x => {
			const timeString = x.time.split(":");
			const hours = parseInt(timeString[0], 10);
			const minutes = parseInt(timeString[1], 10);
			const time = new Date(x.year, x.month - 1, x.day, hours, minutes);

			return {
				time,
				phase: QUARTERS[x.phase]
			}
		});
	
		fs.writeFile(`${DIR_MOONPHASES}/${year}.json`, JSON.stringify(transformed), (err) => {
			if (err) {
				console.log(`error writing file for year ${year}`, );
				throw err
			}
			console.log(`The file for year ${year} has been saved!`);
		});
	}
	console.log(`Fin fetching phase data for ${START}-${END}.`);
}

// cause forgot to do the time transform
async function transformAll() {
  const files = fs.readdirSync(DIR_MOONPHASES);

  for (const file of files) {
    const filePath = path.join(DIR_MOONPHASES, file);

		const stats = fs.lstatSync(filePath);
		if (!stats.isFile()) continue;

    // each file contains a year's worth of moon phases
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const moonPhasesByYear = JSON.parse(fileContents);

		const fixedTimes = moonPhasesByYear.map(x => {
			const timeString = x.time.split(":");
			const hours = parseInt(timeString[0], 10);
			const minutes = parseInt(timeString[1], 10);
			const time = new Date(x.year, x.month - 1, x.day, hours, minutes);

			return {
				phase: x.phase,
				time
			}
		});
	
		fs.writeFile(`${DIR_MOONPHASES}/fixed/${file}`, JSON.stringify(fixedTimes), (err) => {
			if (err) {
				console.log(`error writing file for year ${file}`, );
				throw err
			}
			console.log(`The file for year ${file} has been saved!`);
		});
	}
	console.log(`Fin fixing times for ${START}-${END}.`);
}

await transformAll();

