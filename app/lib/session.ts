import { prisma } from "~/db.server"

import { getSunsetTime } from "./use-api"

interface GeoCoords {
	lat: number;
	lon: number;
}

// ! dailysunmoon data already gives you closest phase!
// PROPOSITION:
// ** first do dailysunmoon API fetch current date
// ** parse data and feed into algorithm
// look `closestPhase`, `curPhase`
// if `curPhase` == `closestPhase` we already have phase data
// but curPhase doesnt give you datetime of curPhase
// however, if query daily data right off bat, have a clue which phase to get
// **if curPhase is new or first, IOW prev phase is those, then look for phase
// ** after date right off the bat!


// type SunsetData = Record<string, string>

interface TransformedMoonPhaseDBData {
	date: Date;
	phase: string;
}

export async function getFirstPhaseBeforeDate(date: Date): Promise<TransformedMoonPhaseDBData | null> {
	const data = await prisma.moonPhase.findFirst({
		where: {
			time: {
				lt: date.toISOString()
			}
		},
		orderBy: {
			time: 'desc'
		},
	})
	return data ? {
		date: new Date(data.time),
		phase: data.phase
	} : null
}

export async function getFirstPhaseAfterDate(date: Date): Promise<TransformedMoonPhaseDBData | null> {
		// limit 1
	const data = await prisma.moonPhase.findFirst({
		where: {
			time: {
				gt: date.toISOString()
			}
		},
		orderBy: {
			time: 'asc'
		},
	})
	return data ? {
		date: new Date(data.time),
		phase: data.phase
	} : null
}

export async function generateSessionsAfterDate(startDate: Date, coords: GeoCoords, n?: number) {
  if (!n) n = 1

  const sessions = []

  const initialPhase = await getFirstPhaseBeforeDate(startDate)

  if (!initialPhase) {
    console.error('No phase data found before date:', startDate)
    return
  }

  let currentPhase: TransformedMoonPhaseDBData | null = initialPhase

	interface Cycle {
		newDate?: Date,
		lastDate?: Date,
		fullDate?: Date,
		t1?: number,
		t2?: number
	}
	// let cycle = {
	// 	first: '2023-01-01T00:00:00.000Z',
	// 	last: '2023-01-01T00:00:00.000Z',
	// 	new: '2023-01-01T00:00:00.000Z',
	// 	t1: (lq - f) / 4,
	// 	t2: (n - lq) / 4,
	// }


  // pertain to current cycle of sessions
	let cycle: Cycle = {}
  

  // eslint-disable-next-line no-constant-condition
  while (true) {
		// Sessions ~between Last Quarter and New Moon
		if (!currentPhase) {
			console.error('No phase data found after date:', startDate)
			return
		}

		if (currentPhase.phase === 'NEW'){
			cycle.newDate = currentPhase.date

			// if last quarter date available, can calculate t2 and corresponding sessions
			if (cycle.lastDate) {
				cycle.t2 = (cycle.newDate.getTime() - cycle.lastDate.getTime()) / 4
				const s7 = await findSession7(cycle.lastDate, cycle.t2, coords)	// 7: LQ + T_2 sunset nearest
				if (s7) {
					sessions.push({[s7?.toISOString()]: 7})
					if (sessions.length >= n) break;
					const s8 = await findSession8(s7, cycle.t2, coords)	// 8: LQ + 2*T_2 sunset nearest
					if (s8) {
						sessions.push({[s8?.toISOString()]: 8})
						if (sessions.length >= n) break;
						const s9 = await findSession9(s8, cycle.t2, coords)	// 9: LQ + 3*T_2 sunset nearest
						if (s9) {
							sessions.push({[s9?.toISOString()]: 9})
							if (sessions.length >= n) break;
						} else { console.error('No sunset found for session 9') }
					} else { console.error('No sunset found for session 8') }
				} else { console.error('No sunset found for session 7') }
			} else {
				console.error('Unable to calculate sessions post new moon because no last quarter moon data')
			}

			// 10: sunset nearest new moon
			const s10 = await findSession10(cycle.newDate, coords);
			if (s10) {
				sessions.push({ [s10?.toISOString()]: 10 })
				if (sessions.length >= n) break;
			} else {
				console.error('No sunset found for session 10')
			}

			currentPhase = await getFirstPhaseAfterDate(currentPhase.date)
			// New cycle starts after new moon
			cycle = {};

			// Session based solely off Full Moon
		} else if (currentPhase.phase === 'FULL') {
			cycle.fullDate = currentPhase.date

			const s2 = await findSession2(cycle.fullDate, coords)	// 2: sunset after full moon
			if (s2) {
				sessions.push({[s2.toISOString()]: 2})
				if (sessions.length >= n) break;
			} else {
				console.error('No sunset found for session 2')
			}

			currentPhase = await getFirstPhaseAfterDate(currentPhase.date)

			// Sessions ~between Full Moon and Last Quarter 
		} else if (currentPhase.phase === 'LAST') {
			cycle.lastDate = currentPhase.date

			// if full moon date available, can calculate t1
			if (cycle.fullDate) {
				cycle.t1 = (cycle.lastDate.getTime() - cycle.fullDate.getTime()) / 4
				
				const s1 = await findSession1(cycle.fullDate, cycle.t1, coords)	// 1: FM - T_1 sunset nearest
				if (s1) {
					sessions.push({[s1?.toISOString()]: 1})
					if (sessions.length >= n) break;
				} else { console.error('No sunset found for session 1') }
				const s3 = await findSession3(cycle.fullDate, cycle.t1, coords)	// 3: FM + T_1 sunset nearest
				if (s3) {
					sessions.push({[s3?.toISOString()]: 3})
					if (sessions.length >= n) break;
					const s4 = await findSession4(s3, cycle.t1, coords)	// 4: FM + 2*T_1 sunset nearest
					if (s4) {
						sessions.push({[s4?.toISOString()]: 4})
						if (sessions.length >= n) break;
						const s5 = await findSession5(s4, cycle.t1, coords)	// 5: FM + 3*T_1 sunset nearest
						if (s5) {
							sessions.push({[s5?.toISOString()]: 5})
							if (sessions.length >= n) break;
						} else { console.error('No sunset found for session 5') }
					} else { console.error('No sunset found for session 4') }
				} else { console.error('No sunset found for session 3') }
			} else {
				console.error('Unable to calculate sessions post last quarter moon because no full moon data')
			}

			const s6 = await findSession6(cycle.lastDate, coords);			// 6: sunset nearest last quarter moon
			if (s6) {
				sessions.push({[s6?.toISOString()]: 6})
				if (sessions.length >= n) break;
			} else { console.error('No sunset found for session 6') }

			currentPhase = await getFirstPhaseAfterDate(currentPhase.date)
		}
	}

	return sessions;
}

type FindSessionArgsA = [Date, number, GeoCoords];
type FindSessionArgsB = [Date, GeoCoords];

export async function findSession1(...args: FindSessionArgsA): Promise<Date | null> {
	console.log(`try find s1`, )
	const [fullDate, t1, coords] = args;
	const pointInTime = new Date(fullDate.getTime() - t1);
	return await findNearestSunset(pointInTime, coords);
}

export async function findSession2(...args: FindSessionArgsB): Promise<Date | null> {
	console.log(`try find s2`, )
	const [fullDate, coords] = args;
	return await findFirstSunsetAfter(fullDate, coords);
}

export async function findSession3(...args: FindSessionArgsA): Promise<Date | null> {
	const [fullDate, t1, coords] = args;
	const pointInTime = new Date(fullDate.getTime() + t1);
	return await findNearestSunset(pointInTime, coords);
}

export async function findSession4(...args: FindSessionArgsA): Promise<Date | null> {
	const [s3, t1, coords] = args;
	const pointInTime = new Date(s3.getTime() + t1);
	return await findNearestSunset(pointInTime, coords);
}

export async function findSession5(...args: FindSessionArgsA): Promise<Date | null> {
	const [s4, t1, coords] = args;
	const pointInTime = new Date(s4.getTime() + t1);
	return await findNearestSunset(pointInTime, coords);
}

export async function findSession6(...args: FindSessionArgsB): Promise<Date | null> {
	const [datetimeLastQuarter, coords] = args;
	return await findNearestSunset(datetimeLastQuarter, coords);
}

export async function findSession7(...args: FindSessionArgsA): Promise<Date | null> {
	const [datetimeLastQuarter, t2, coords] = args;
	const pointInTime = new Date(datetimeLastQuarter.getTime() + t2);
	return await findNearestSunset(pointInTime, coords);
}

export async function findSession8(...args: FindSessionArgsA): Promise<Date | null> {
	const [s7, t2, coords] = args;
	const pointInTime = new Date(s7.getTime() + t2);
	return await findNearestSunset(pointInTime, coords);
}

export async function findSession9(...args: FindSessionArgsA): Promise<Date | null> {
	const [s8, t2, coords] = args;
	const pointInTime = new Date(s8.getTime() + t2);
	return await findNearestSunset(pointInTime, coords);
}

export async function findSession10(...args: FindSessionArgsB): Promise<Date | null> {
	const [datetimeNewMoon, coords] = args;
	return await findNearestSunset(datetimeNewMoon, coords);
}

export async function findFirstSunsetAfter(date: Date, coords: GeoCoords): Promise<Date | null> {
	const dateDayAfter = new Date(date);
	dateDayAfter.setDate(date.getDate() + 1);
	const sunsetTimeDayAfter = (await getSunsetTime(dateDayAfter, coords))?.time;

	if (!sunsetTimeDayAfter) {
		return null;
	}

	const dateStringDayAfter = dateDayAfter.toISOString().slice(0,10);
	const sunsetDatetimeDayAfter = new Date(`${dateStringDayAfter}T${sunsetTimeDayAfter}Z`);
	
	return sunsetDatetimeDayAfter;
}

// Since doesn't return sunsets that outside of year, return null if no sunset found within 12 hours
export async function findNearestSunset(date: Date, coords: GeoCoords): Promise<Date | null> {
	// check sunset from day before, day of, and day after
	const sunsetDayBefore = await findSunsetDatetimeByDay(new Date(date.getTime() - (1000 * 60 * 60 * 24)), coords);
	const sunsetDayOf = await findSunsetDatetimeByDay(date, coords);
	const sunsetDayAfter = await findSunsetDatetimeByDay(new Date(date.getTime() + (1000 * 60 * 60 * 24)), coords);
	const sunsetsAdjacent = [sunsetDayBefore, sunsetDayOf, sunsetDayAfter];

	let min = Infinity;
	let sunsetNearest = null;
	for (const sunset of sunsetsAdjacent) {
		// construct date object based on element and convert numeric values into properly "0" padded strings for use in Date constructor
		// NB: time is already padded in lunar phase data
		// NB: lunar phase data is ordered chronologically
    if (!sunset) {
      break;
    }
		const diff = date.getTime() - sunset.getTime();
		if (Math.abs(diff) < Math.abs(min)) {
			min = diff;
			sunsetNearest = sunset;
		} else {
			break;
		}
	};
	return sunsetNearest;
}

export async function findSunsetDatetimeByDay(date: Date, coords: GeoCoords): Promise<Date | null> {
	// so far used for sunsets found by some multiple of T_1 or T_2 from another sunset
	const sunsetTime = (await getSunsetTime(date, coords))?.time;
	if (!sunsetTime) {
		return null;
	}
	const dateString = date.toISOString().slice(0,10);
	return new Date(`${dateString}T${sunsetTime}Z`);
}

export function convertRawSunsetDataToDate(obj: { month: string, day: string, year: string, time: string }) {
		const month = String(obj.month.padStart(2, '0'));
		const day = String(obj.day.padStart(2, '0'));
		return new Date(`${obj.year}-${month}-${day}T${obj.time}Z`);
}

// export function convertPhaseTimeToAPIDate(time: string) {
// 		// const month = String(obj.month).padStart(2, '0');
// 		// const day = String(obj.day).padStart(2, '0');
// 		// return new Date(`${obj.year}-${month}-${day}T${obj.time}Z`);
// }


// export function read(filepath) {
// 	try {
// 		const file = fs.readFileSync(filepath);
// 		return JSON.parse(file);
// 	} catch (err) {
// 		console.error(`Error reading file ${filepath}: ${err.message}`);
// 		throw err;
// 	}
// }

// // TODO phase data by date and n
// export function getPhaseData(year) {
//   // get only enough phase data for the current query
// 		const data = read(`${DIR_PHASE}/${year}.json`);
	
// 		// needed for calculations near edges of the year
// 		const dataPrev = read(`${DIR_PHASE}/${year-1}.json`);
// 		const lastPhasePrevYear = dataPrev[dataPrev.length - 1];
	
// 		const dataNext = read(`${DIR_PHASE}/${year+1}.json`);
// 		const firstPhaseNextYear = dataNext[0];
	
// 		return [lastPhasePrevYear, ...data, firstPhaseNextYear];
// }

// export function getSunsetData(year) {
// 	const data = read(`${DIR_SUNSET}/${year}.json`);

// 	// needed for calculations near edges of the year
// 	const dataPrev = read(`${DIR_SUNSET}/${year-1}.json`);

// 	let prevYearDayCounter = new Date(`${year-1}-12-31`);
// 	let prevYearSunsets = {};
// 	for (let i = 0; i < PREV_YEAR_SUNSET_LIMIT; i++) {
// 		const prevYearDay = prevYearDayCounter.toJSON().slice(0,10);
// 		const prevYearSunset = dataPrev[prevYearDay];
// 		prevYearSunsets[prevYearDay] = prevYearSunset;
// 		prevYearDayCounter.setDate(prevYearDayCounter.getDate() - 1);
// 	}

// 	const dataNext = read(`${DIR_SUNSET}/${year+1}.json`);

// 	let nextYearSunsets = {};
// 	let nextYearDayCounter = new Date(`${year+1}-01-01`);
// 	for (let i = 0; i < NEXT_YEAR_SUNSET_LIMIT; i++) {
// 		const nextYearDay = nextYearDayCounter.toJSON().slice(0,10);
// 		const nextYearSunset = dataNext[nextYearDay];
// 		nextYearSunsets[nextYearDay] = nextYearSunset;
// 		nextYearDayCounter.setDate(nextYearDayCounter.getDate() + 1);
// 	}

// 	return {
// 		...prevYearSunsets, 
// 		...data, 
// 		...nextYearSunsets
// 	};
// }

// export function isLeapYear(y) {
// 	return (y % 4 === 0 && y% 100 !== 0) || y % 400 === 0;
// }

// export function sortChronologically(arr) {
// 	arr.sort((a,b) => new Date(Object.keys(a)[0]).getTime() - new Date(Object.keys(b)[0]).getTime());
// }

// export async function fetchSessionsForYearAndAdjacent(year: number) {
//   const sessions1 = await fetch(`/sessions/${year - 1}.json`).then((response) => response.json());
//   const sessions2 = await fetch(`/sessions/${year}.json`).then((response) => response.json());
//   const sessions3 = await fetch(`/sessions/${year + 1}.json`).then((response) => response.json());
//   return [...sessions1, ...sessions2, ...sessions3];
// }

// export async function fetchSessionsForYear(year: number) {
//   return await fetch(`/sessions/${year}.json`).then((response) => response.json());
// }

// export function findFirstCycleStartIndexFromDate(date: Date, sessions) {
// // find first cycle start index on or after given date
//   let startIdx = -1;
//   const day = date.getDate();
//   const padDay = day < 10 ? `0${day}` : day;
//   const month = date.getMonth() + 1;
//   const padMonth = month < 10 ? `0${month}` : month;
//   const matchString =  `${date.getFullYear()}-${padMonth}-${padDay}`;
//   startIdx = sessions.findIndex(x => Object.keys(x)[0].slice(0, 10) >= matchString) ;
//   return startIdx;
// }

// // ? NB added sessions to args upon migrate, was this fn ever used?
// export function findPrevCycleStartIndexFromDate(date: Date, sessions) {
// // find first cycle start index before given date
//   let startIdx = -1;
//   const day = date.getDate();
//   const padDay = day < 10 ? `0${day}` : day;
//   const month = date.getMonth() + 1;
//   const padMonth = month < 10 ? `0${month}` : month;
//   const matchString =  `${date.getFullYear()}-${padMonth}-${padDay}`;
//   startIdx = sessions.findIndex(x => Object.keys(x)[0].slice(0, 10) >= matchString) ;
//   return startIdx;
// }