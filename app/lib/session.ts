import { prisma } from "~/db.server";

const QUARTERS = {
	'New Moon': 'NEW',
	'First Quarter': 'FIRST',
	'Full Moon': 'FULL',
	'Last Quarter': 'LAST'
};

// in db
interface PhaseDBData {
  time: string;
  phase: string;
}

// parsed
interface PhaseData {
  time: Date,
  phase: Phases
}

type SunsetAPIData = {
  day: string,
  month: string,

}
// ! what the fuck, dailysunmoon data already gives you closest phase!
// PROPOSITION:
// ** first do dailysunmoon API fetch current date
// ** parse data for algorithm
// look `closestPhase`, `curPhase`
// if `curPhase` == `closestPhase` we already have phase data
// but curPhase doesnt give you datetime of curPhase
// however, if query daily data right off bat, have a clue which phase to get
// **if curPhase is new or first, IOW prev phase is those, then look for phase
// ** after date right off the bat!

// USNO daily API
// "1900-01-01": {
//   "apiversion": "4.0.1",
//   "properties": {
//     "data": {
//       "closestphase": {
//         "day": 1,
//         "month": 1,
//         "year": 1900
//         "phase": "New Moon",
//         "time": "13:52",
//       },
//       "curphase": "New Moon",
//       "day": 1,
//       "month": 1,
//       "year": 1900
//       "sundata": [
//         {
//           "phen": "Set",
//           "time": "22:43"
//         },
//       ],
//     }
//   },
// },


type SunsetData = Record<string, string>;

enum Phases {
  NEW,
  FIRST,
  FULL,
  LAST
}

const NEXT_YEAR_SUNSET_LIMIT = 8;
const PREV_YEAR_SUNSET_LIMIT = 11; // 11th sunset not a valid result, only used in findFirstSunsetAfter calculation

// export function generateSessionsByYear(year: number) {
// 	// * READ, TRANSFORM, LOAD DATA
// 	const phases = getPhaseData(year);
// 	const sunsets = getSunsetData(year);

// 	// * CALCULATE SESSIONS
// 	const sessions = findSessionsPrecise(phases, sunsets, year);
// 	return sessions;
// }

export async function generateSessionsAfterDate(startDate: Date, n?: number) {
  if (!n) n = 1;

  let sessions = [];

  let n_sessions_generated = 0;

	// phases: 0=new, 2=full, 3=last quarter
	// let cycle = {
	// 	first: '2023-01-01T00:00:00.000Z',
	// 	last: '2023-01-01T00:00:00.000Z',
	// 	new: '2023-01-01T00:00:00.000Z',
	// 	t1: (lq - f) / 4,
	// 	t2: (n - lq) / 4,
	// }

  // TODO get initial phase aka phase preceding startDate, db query
  // get moonPhase record where date < startDate, order by date desc, limit 1
  // use prisma
  const startDateISOString = startDate.toISOString();
  const initialPhase = await prisma.moonPhase.findFirst({
    where: {
      time: {
        lt: startDateISOString
      }
    },
    orderBy: {
      time: 'desc'
    }
  });
  console.log(`initPhase`, initialPhase)


  if (!initialPhase) {
    console.error('No phase data found before date:', startDate)
    return;
  }

  let phase;
  switch (initialPhase.phase) {
    case 'NEW':
      phase = Phases.NEW;
      break;
    case 'FIRST':
      phase = Phases.FIRST;
      break;
    case 'FULL':
      phase = Phases.FULL;
      break;
    case 'LAST':
      phase = Phases.LAST;
      break;
  };

  let currentPhase = {
    date: new Date(initialPhase.time),
    phase
  };


  // pertain to current cycle of sessions
  let newDate;
  let lastDate;
  let fullDate;
  let t2;
  let t1;
  

  while (n_sessions_generated < n) {
    // get phase data preceding date
    // get sunset data as needed
    // generate n sessions, all post date arg
    // TODO get phase data, parse it to enum and date obj
    // TODO get sunset data, parse it to enum and date obj

		// NEW MOON
		if (currentPhase.phase === Phases.NEW){

			// ! TODO convert time to UTC date object, currently a Date parsed from
			// ! the separate day/month/year fields in raw lunar data
			newDate = currentPhase.date;

			// when new moon, can calculate T_2 and sessions 7-10
			// phase data includes last phase of prev year, so if new moon is first
			// phase in phae data, there won't be a prev last quarter moon to calc T_2
			// nor sessions 7-9
			if (lastDate) {
				t2 = (newDate - lastDate) / 4;
				const s7 = findSession7(lastDate, t2, sunsets);	// 7: LQ + T_2 sunset nearest
				const s8 = findSession8(s7, t2, sunsets);	// 8: LQ + 2*T_2 sunset nearest
				const s9 = findSession9(s8, t2, sunsets);	// 9: LQ + 3*T_2 sunset nearest
				sessions.push({[s7?.toISOString()]: 7},{[s8?.toISOString()]: 8},{[s9?.toISOString()]: 9});
			}

			// 10: sunset nearest new moon
			const s10 = findSession10(cycle.n, sunsets);
			sessions.push({ [s10?.toISOString()]: 10 });

		} else if (data.phase === QUARTERS.FULL) {
			cycle.f = phaseDatetime;
			const s2 = findSession2(cycle.f, sunsets, year);	// 2: sunset after full moon
			sessions.push({[s2?.toISOString()]: 2});

		} else if (data.phase === QUARTERS.LAST) {
			cycle.lq = phaseDatetime;

			if (cycle?.f) {
				cycle.t1 = (cycle.lq - cycle.f) / 4;
				const s1 = findSession1(cycle.f, cycle.t1, sunsets);	// 1: FM - T_1 sunset nearest
				const s3 = findSession3(cycle.f, cycle.t1, sunsets);	// 3: FM + T_1 sunset nearest
				const s4 = findSession4(s3, cycle.t1, sunsets);	// 4: FM + 2*T_1 sunset nearest
				const s5 = findSession5(s4, cycle.t1, sunsets);	// 5: FM + 3*T_1 sunset nearest
				sessions.push(
					{[s1?.toISOString()]: 1}, 
					{[s3?.toISOString()]: 3}, 
					{[s4?.toISOString()]: 4}, 
					{[s5?.toISOString()]: 5}
				);
			}

			const s6 = findSession6(cycle.lq, sunsets);			// 6: sunset nearest last quarter moon
			sessions.push({[s6?.toISOString()]: 6});
		}

    if (sessions.length >= n) {
      break;
    } else {
      // TODO load next phase data
    }
	}

	return sessions;
}

export function findSession1(fullDate: Date, t1: number, sunsets) {
	const pointInTime = new Date(fullDate.getTime() - t1);
	return findNearestSunset(pointInTime, sunsets);
}

export function findSession2(fullDate, sunsets, year) {
	return findFirstSunsetAfter(fullDate, sunsets, year);
}

export function findSession3(fullDate, t1, sunsets) {
	const pointInTime = new Date(fullDate.getTime() + t1);
	return findNearestSunset(pointInTime, sunsets);
}

export function findSession4(s3, t1, sunsets) {
	const pointInTime = new Date(s3.getTime() + t1);
	return findNearestSunset(pointInTime, sunsets);
}

export function findSession5(s4, t1, sunsets) {
	const pointInTime = new Date(s4.getTime() + t1);
	return findNearestSunset(pointInTime, sunsets);
}

export function findSession6(datetimeLastQuarter, sunsets) {
	return findNearestSunset(datetimeLastQuarter, sunsets);
}

export function findSession7(datetimeLastQuarter, t2, sunsets) {
	const pointInTime = new Date(datetimeLastQuarter.getTime() + t2);
	return findNearestSunset(pointInTime, sunsets);
}

export function findSession8(s7, t2, sunsets) {
	const pointInTime = new Date(s7.getTime() + t2);
	return findNearestSunset(pointInTime, sunsets);
}

export function findSession9(s8, t2, sunsets) {
	const pointInTime = new Date(s8.getTime() + t2);
	return findNearestSunset(pointInTime, sunsets);
}

export function findSession10(datetimeNewMoon, sunsets) {
	return findNearestSunset(datetimeNewMoon, sunsets);
}


export function findFirstSunsetAfter(date, sunsets, year) {
	const dateString = date.toJSON().slice(0,10);
	const sunsetTimeCurrent = sunsets?.[dateString];

	// out of range
	if (!sunsetTimeCurrent) {
		return null;
	}

	const sunsetDatetimeCurrent = new Date(`${dateString}T${sunsetTimeCurrent}Z`);
	const prevYearSunsetLimitDay = createDateByDaysFrom(new Date(`${year}-01-01`), -PREV_YEAR_SUNSET_LIMIT + 1);

	// out of range: result date falls on date excluded from calculation data set
	if(sunsetDatetimeCurrent > date) {
		if (sunsetDatetimeCurrent < prevYearSunsetLimitDay) {
			return null;
		}
		return sunsetDatetimeCurrent;
	}

	const dateDayAfter = new Date(date);
	dateDayAfter.setDate(date.getDate() + 1);
	const dateStringDayAfter = dateDayAfter.toJSON().slice(0,10);
	const sunsetTimeDayAfter = sunsets?.[dateStringDayAfter];

	// out of range
	if (!sunsetTimeDayAfter) {
		return null;
	}
	const sunsetDatetimeDayAfter = new Date(`${dateStringDayAfter}T${sunsetTimeDayAfter}Z`);
	return sunsetDatetimeDayAfter;
}

// Since doesn't return sunsets that outside of year, return null if no sunset found within 12 hours
export function findNearestSunset(date: Date, sunsets: SunsetData) {
	// check sunset from day before, day of, and day after
	const sunsetDayBefore = findSunsetDatetimeByDay(new Date(date.getTime() - (1000 * 60 * 60 * 24)), sunsets);
	const sunsetDayOf = findSunsetDatetimeByDay(date, sunsets);
	const sunsetDayAfter = findSunsetDatetimeByDay(new Date(date.getTime() + (1000 * 60 * 60 * 24)), sunsets);
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

export function findSunsetDatetimeByDay(date: Date, sunsets: SunsetData) {
	// use for sunsets found by some multiple of T_1 or T_2 from another sunset
	const dateString = date.toISOString().slice(0,10);
	const sunsetTime = sunsets?.[dateString];

	if (!sunsetTime) {
		return null;
	}
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