#!/usr/bin/env node

// extract the date and sunset time from the daily sun and moon source data

import fs from 'fs';
import path from 'path';

import { DIR_DAILY, DIR_SUNSET, YEAR_START, YEAR_END } from './dataCommon.js';

// const files = fs.readdirSync(DIR_DAILY);

for (let year = YEAR_START; year <= YEAR_END; year++) {
	process(`${year}.json`);
}

console.log(`Fin extracting sunset data for ${YEAR_START}-${YEAR_END}.`);

function process(file) {
	const filePath = path.join(DIR_DAILY, file);

	// check if json
	if (path.extname(filePath) !== ".json")
		return;

	try {
		// read
		const rawFile = fs.readFileSync(filePath, 'utf8');
		const allData = JSON.parse(rawFile);

		// filter
		const sunsetData = {};
		for (let date in allData) {
			sunsetData[date] = allData[date].properties.data.sundata.find(x => x.phen === "Set")?.time || null;
		}

		// write
		const targetFilePath = path.join(DIR_SUNSET, file);
		fs.writeFileSync(targetFilePath, JSON.stringify(sunsetData, null, 2));
		// console.log(`Processed sunset data for file ${file} saved!`);
	} catch (err) {
		console.error(`Error processing file ${file}: ${err.message}`);
	}
}

function processAll() {
	files.forEach(file => {
		process(file);
	});
}