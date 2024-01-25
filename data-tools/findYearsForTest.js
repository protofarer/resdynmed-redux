#!/usr/bin/env node

// find years that meet test criteria

import fs from 'fs';

import { findNearestSunset, getPhaseData, getSunsetData } from '../tools/lib.js';
import { QUARTERS, DIR_TOOLS } from './dataCommon.js';

// years from which to find test data, use years for which prev AND next year have data
const YEAR_START = 1901;
const YEAR_END = 2099;

const FILE = `${DIR_TOOLS}/testYears.json`;

let allResults = {};
// for each phase:
// dayOnePhaseSunsetCurr
// dayOnePhaseSunsetPrev
// dayMinusOnePhaseSunsetCurr <-- this never occurs since sunsets by definition always occurs later in day and thus the nearest sunset will not be from Current Year
// dayMinusOnePhaseSunsetPrev

for (let year = YEAR_START; year < YEAR_END; year++) {
	const phases = getPhaseData(year);
	const sunsets = getSunsetData(year);
	processByYear(year, phases, sunsets, allResults);
	if (
		allResults?.["dayOnePhaseSunsetCurrFULL"] &&
		allResults?.["dayOnePhaseSunsetPrevFULL"] &&
		allResults?.["dayMinusOnePhaseSunsetPrevFULL"] &&
		allResults?.["dayOnePhaseSunsetCurrLAST"] &&
		allResults?.["dayOnePhaseSunsetPrevLAST"] &&
		allResults?.["dayMinusOnePhaseSunsetPrevLAST"] &&
		allResults?.["dayOnePhaseSunsetCurrNEW"] &&
		allResults?.["dayOnePhaseSunsetPrevNEW"] &&
		allResults?.["dayMinusOnePhaseSunsetPrevNEW"]
	) {
		console.log(`Found all desired test case data`);
		break;
	}
}

// ? couldnt find
// dayOnePhaseSunsetCurrLAST
// dayMinusOnePhaseSunsetPrevLAST

console.log(`allResults:`);
console.table(allResults);

fs.writeFile(FILE, JSON.stringify(allResults), (err) => {
	if (err) {
		console.log(`error writing file for test years`);
		throw err
	};
	console.log(`The test year file has been saved!`);
});



function processByYear(year, phases, sunsets, allResults) {
	// fills in gaps in test data across years until matching requirements found

	// a phase on 1st day of current year
	const dayOnePhase = phases.find(
		x => x.year === year && x.month === 1 && x.day === 1 && Object.values(QUARTERS).some(n => n === x.phase)
	);

	
	if (dayOnePhase) {
		// console.log(`==========================`, )
		// console.log(`found day one phase on ${dayOnePhase.month}/${dayOnePhase.day}/${dayOnePhase.year} @ ${dayOnePhase.time} UTC`, )
		
		const startOfCurrYear = new Date(Date.UTC(year, 0, 1, 0, 0));

		const [hours, minutes] = dayOnePhase.time.split(":").map(x => parseInt(x));
		const dayOnePhaseDatetime = new Date(Date.UTC(year, 0, 1, hours, minutes));

		const nearestSunsetDatetime = findNearestSunset(dayOnePhaseDatetime, sunsets);
		const time = nearestSunsetDatetime.toISOString();
		// console.log(`nearest sunset: `, time);

		const phase = dayOnePhase.phase;

		// nearest sunset to phase occurs in curr year
		if (!allResults?.["dayOnePhaseSunsetCurrFULL"] && phase === QUARTERS.FULL) {
			if (nearestSunsetDatetime >= startOfCurrYear) {
				// console.log(`found day one phase curr year`, )
				// console.table(dayOnePhase);
				allResults["dayOnePhaseSunsetCurrFULL"] = {
					year,
					phase,
					nearestSunset: {
						relation: "curr year",
						time
					}
				};
			}
		} else if (!allResults?.["dayOnePhaseSunsetCurrLAST"] && phase === QUARTERS.LAST) {
			if (nearestSunsetDatetime >= startOfCurrYear) {
				// console.log(`found day one phase curr year`, )
				// console.table(dayOnePhase);
				allResults["dayOnePhaseSunsetCurrLAST"] = {
					year,
					phase,
					nearestSunset: {
						relation: "curr year",
						time
					}
				};
			}
		} else if (!allResults?.["dayOnePhaseSunsetCurrNEW"] && phase === QUARTERS.NEW) {
			if (nearestSunsetDatetime >= startOfCurrYear) {
				// console.log(`found day one phase curr year`, )
				// console.table(dayOnePhase);
				allResults["dayOnePhaseSunsetCurrNEW"] = {
					year,
					phase,
					nearestSunset: {
						relation: "curr year",
						time
					}
				};
			}
		}

		// nearest sunset to phase occurs in prev year
		if (!allResults?.["dayOnePhaseSunsetPrevFULL"] && phase === QUARTERS.FULL) {
			if (nearestSunsetDatetime < startOfCurrYear) {
				// console.log(`found day one phase prev year`, )
				// console.table(dayOnePhase);
				allResults["dayOnePhaseSunsetPrevFULL"] = {
					year,
					phase,
					nearestSunset: {
						relation: "prev year",
						time
					}
				};
			}
		} else if (!allResults?.["dayOnePhaseSunsetPrevLAST"] && phase === QUARTERS.LAST) {
			if (nearestSunsetDatetime < startOfCurrYear) {
				// console.log(`found day one phase prev year`, )
				// console.table(dayOnePhase);
				allResults["dayOnePhaseSunsetPrevLAST"] = {
					year,
					phase,
					nearestSunset: {
						relation: "prev year",
						time
					}
				};
			}
		} else if (!allResults?.["dayOnePhaseSunsetPrevNEW"] && phase === QUARTERS.NEW) {
			if (nearestSunsetDatetime < startOfCurrYear) {
				// console.log(`found day one phase prev year`, )
				// console.table(dayOnePhase);
				allResults["dayOnePhaseSunsetPrevNEW"] = {
					year,
					phase,
					nearestSunset: {
						relation: "prev year",
						time
					}
				};
			}
		}

	}

	// a phase on last day of prev year
	const dayMinusOnePhase = phases.find(
		x => x.year === year - 1 && x.month === 12 && x.day === 31 && Object.values(QUARTERS).some(n => n === x?.phase)
	);

	if (dayMinusOnePhase) {
		// console.log(`==========================`, )
		// console.log(`found day minus one phase on ${dayMinusOnePhase.month}/${dayMinusOnePhase.day}/${dayMinusOnePhase.year} @ ${dayMinusOnePhase.time} UTC`, )
		
		const startOfCurrYear = new Date(year, 0, 1);

		const [hours, minutes] = dayMinusOnePhase.time.split(":").map(x => parseInt(x));
		const dayMinusOnePhaseDatetime = new Date(Date.UTC(year - 1, 11, 31, 23, hours, minutes));

		const nearestSunsetDatetime = findNearestSunset(dayMinusOnePhaseDatetime, sunsets);
		const time = nearestSunsetDatetime.toISOString();
		// console.log(`nearest sunset: `, time);

		const phase = dayMinusOnePhase.phase;

		// nearest sunset to phase occurs in curr year
		if (!allResults?.["dayMinusOnePhaseSunsetPrevFULL"] && dayMinusOnePhase.phase === QUARTERS.FULL) {
			if (nearestSunsetDatetime < startOfCurrYear) {
				// console.log(`found day minus one phase prev year`, )
				// console.table(dayMinusOnePhase);
				allResults["dayMinusOnePhaseSunsetPrevFULL"] = {
					year,
					phase,
					nearestSunset: {
						relation: "prev year",
						time
					}
				};
			}
		} else if (!allResults?.["dayMinusOnePhaseSunsetPrevLAST"] && dayMinusOnePhase.phase === QUARTERS.LAST) {
			if (nearestSunsetDatetime < startOfCurrYear) {
				// console.log(`found day minus one phase prev year`, )
				// console.table(dayMinusOnePhase);
				allResults["dayMinusOnePhaseSunsetPrevLAST"] = {
					year,
					phase,
					nearestSunset: {
						relation: "prev year",
						time
					}
				};
			}
		} else if (!allResults?.["dayMinusOnePhaseSunsetPrevNEW"] && dayMinusOnePhase.phase === QUARTERS.NEW) {
			if (nearestSunsetDatetime < startOfCurrYear) {
				// console.log(`found day minus one phase prev year`, )
				// console.table(dayMinusOnePhase);
				allResults["dayMinusOnePhaseSunsetPrevNEW"] = {
					year,
					phase,
					nearestSunset: {
						relation: "prev year",
						time
					}
				};
			}
		}

		// ! this never occurs
		// if (!allResults?.["dayMinusOnePhaseSunsetCurr"]) {
		// 	if (nearestSunsetDatetime >= startOfCurrYear) {
		// 		// console.log(`found day minus one phase curr year`, );
		// 		// console.table(dayMinusOnePhase);
		// 		allResults["dayMinusOnePhaseSunsetCurr"] = {
		// 			year,
		// 			phase: dayMinusOnePhase.phase,
		// 			nearestSunset: {
		// 				relation: "curr year",
		// 				time
		// 			}
		// 		};
		// 	}
		// }

	}
}
