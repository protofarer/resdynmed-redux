#!/usr/bin/env node

// Run this program after the data has been fetched, transformed, and processed
// Generates the resonant dynamic meditation session datetimes for specified years

import os from 'os';
import path from 'path';
import fs from 'fs';
import { getPhaseData, getSunsetData, findSessionsPrecise } from './lib.js';

const homeDir = os.homedir();
const DIR_SESSIONS = path.join(homeDir, "projects", "resdynmed", "src", "data", "sessions");

const YEAR_START = 1901;
const YEAR_END = 2022;
for (let year = YEAR_START; year <= YEAR_END; year++) {
	const sunsets = getSunsetData(year);
	const phases = getPhaseData(year);
	const sessions = findSessionsPrecise(phases, sunsets, year);
	fs.writeFileSync(path.join(DIR_SESSIONS, `${year}.json`), JSON.stringify(sessions, null, 2));
}