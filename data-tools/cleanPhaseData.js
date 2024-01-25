#!/usr/bin/env node

// read all files from sourcedata/lunarphases
// for each file, read the data and remove elements from the read in array that are missing the "phase" property
// write the remaining array to a new file in sourcedata/lunarphases2

import fs from 'fs';
import path from 'path';
import os from 'os';

const DIR_HOME = os.homedir();
const DIR_PHASE = path.join(DIR_HOME, "projects", "resdynmed", "sourcedata", "lunarphase");
const DIR_PHASE2 = path.join(DIR_HOME, "projects", "resdynmed", "sourcedata", "lunarphase2");

const files = fs.readdirSync(DIR_PHASE);

files.forEach(file => {
	const data = JSON.parse(fs.readFileSync(path.join(DIR_PHASE, file)));
	const newData = data.filter(d => d?.phase !== undefined);
	fs.writeFileSync(path.join(DIR_PHASE2, file), JSON.stringify(newData));
}
)

