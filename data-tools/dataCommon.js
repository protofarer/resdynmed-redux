#!/usr/bin/env node

import path from 'path';
import os from 'os';

const DIR_HOME = os.homedir();
export const DIR_SUNSET = path.join(DIR_HOME, "projects", "resdynmed", "sourcedata", "dailysunset");
export const DIR_PHASE = path.join(DIR_HOME, "projects", "resdynmed", "sourcedata", "lunarphase");
export const DIR_DAILY = path.join(DIR_HOME, "projects", "resdynmed", "sourcedata", "dailysunmoon");
export const DIR_TOOLS = path.join(DIR_HOME, "projects", "resdynmed", "tools");

export const MY_COORDS = "25.710583,-80.441457";

export const QUARTERS = {
	NEW: 0,
	FULL: 2,
	LAST: 3
}

// already done: 2022-2100, 1971-1976, 1977-2021
// inclusive
export const YEAR_START = 1978;
export const YEAR_END = 2021;

// const COORDS_SEATTLE = "47.60,-122.33"