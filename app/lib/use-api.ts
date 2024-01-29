// key is a date "YYYY-MM-DD"
export type USNODailyDataSingleDay = Entry;

interface Entry {
  apiversion: string;
  geometry: Geometry;
  properties: {
    data: Data;
  };
  type: string;
}

interface Geometry {
  coordinates: [number, number];
  type: string;
}

interface Data {
  closestphase: PhaseInfo;
  curphase: string;
  day: number;
  day_of_week: string;
  fracillum: string;
  isdst: boolean;
  label: null | string;
  month: number;
  moondata: Event[];
  sundata: Event[];
  tz: number;
  year: number;
}

interface PhaseInfo {
  day: number;
  month: number;
  phase: string;
  time: string;
  year: number;
}

interface Event {
    phen: string;
    time: string;
}

// TODO fetch 1 daily sun moon data by date and loc, cull, and parse
export async function fetchDailyAPI(date: Date, coords: { lat: number, lon: number }): Promise<Entry> {
  const dateString = date.toISOString().slice(0,10); // YYYY-MM-DD per https://aa.usno.navy.mil/data/api
  const formattedCoords = `${coords.lat},${coords.lon}`;

	const response = await fetch(`https://aa.usno.navy.mil/api/rstt/oneday?id=kennybar&date=${dateString}&coords=${formattedCoords}`);
  const data = await response.json() as USNODailyDataSingleDay;

  // TODO handle empty and error responses

  if (data.apiversion.split('.')[0] !== '4') {
    console.error(`WARNING: USNO API version changed from 4, check for breaking changes`);
  }

  return data;
}

export function parseSunsetFromDailyData(entry: Entry): string | undefined {
  const sunsetTime = entry.properties.data.sundata.find(x => x.phen === 'Set')?.time;

  if (!sunsetTime) {
    console.error(`No sunset time found in entry`, entry);
    return;
  }

  return sunsetTime;
}

export async function getSunsetTime(date: Date, coords: { lat: number, lon: number }): Promise<{ time: string | undefined, entry: Entry } | undefined> {
  const entry = await fetchDailyAPI(date, coords);
  const sunsetTimeString = parseSunsetFromDailyData(entry);
  console.log(`sunsettime:`, sunsetTimeString)
  return { time: sunsetTimeString, entry };
  
  // TODO need? date obj with orig day + sunset time
}

// DEV

// const date = new Date();
// const coords = { lat: 25.710583, lon: -80.441457 };

// getSunsetTime(date, coords).then (sunset => {
//   console.log(`sunset val:`, sunset);
// });

// test 30 days, always get Set?
// for (let i = 0; i < 30; i++) {
//   const date = new Date();
//   date.setDate(date.getDate() + i);
//   getSunsetTime(date, coords).then (sunset => {
//     console.log(`sunset val:`, sunset);
//   });
// }