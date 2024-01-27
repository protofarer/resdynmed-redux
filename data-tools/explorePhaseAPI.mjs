#!/usr/bin/env node

// fetch, transform, store lunar phase data from US Naval Observatory API
// https://aa.usno.navy.mil/data/api#phase

import fs from 'fs'

const QUARTERS = {
	'New Moon': 'NEW',
	'First Quarter': 'FIRST',
	'Full Moon': 'FULL',
	'Last Quarter': 'LAST'
};

const YEAR = 1700;
(async () => {
  const res = await fetch(`https://aa.usno.navy.mil/api/moon/phases/year?year=${YEAR}`);
  const data = await res.json();
	const transformed = data.phasedata.map(x => {
		const phase = QUARTERS[x.phase];

		const timeString = x.time.split(":");
		const hours = parseInt(timeString[0], 10);
		const minutes = parseInt(timeString[1], 10);
		const time = new Date(x.year, x.month - 1, x.day, hours, minutes);

		return {time, phase };
	});

	fs.writeFile(`data-tools/${YEAR}.json`, JSON.stringify(transformed), (err) => {
		if (err) {
			console.log(`error writing file for year ${YEAR}`, );
			throw err
		}
	});

})();

