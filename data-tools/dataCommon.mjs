#!/usr/bin/env node

import path from 'path';
import os from 'os';

const DIR_HOME = os.homedir();
const DIR_PROJECT = 'resdynmed-redux'
const DIR_SRCDAT = 'srcdat'
const DIR_THESE_TOOLS = 'build-data'
export const DIR_SUNSET = path.join(DIR_HOME, "spaces/projects", DIR_PROJECT, DIR_SRCDAT, "dailysunset");
export const DIR_MOONPHASES = path.join(DIR_HOME, "spaces/projects", DIR_PROJECT, DIR_SRCDAT, "moonphases");
export const DIR_DAILY = path.join(DIR_HOME, "spaces/projects", DIR_PROJECT, DIR_SRCDAT, "dailysunmoon");
export const DIR_TOOLS = path.join(DIR_HOME, "spaces/projects", DIR_PROJECT, DIR_THESE_TOOLS);

export const MY_COORDS = "25.710583,-80.441457";

export const QUARTERS = {
	NEW: 0,
	FIRST: 1,
	FULL: 2,
	LAST: 3
}

// already done: 2022-2100, 1971-1976, 1977-2021
// inclusive
export const YEAR_START = 1978;
export const YEAR_END = 2021;

// const COORDS_SEATTLE = "47.60,-122.33"