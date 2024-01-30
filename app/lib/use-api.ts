import axios, { isAxiosError } from "axios";

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

interface ApiError {
  response_status?: number;
  message?: string;
  error_details?: unknown;
};

// missing:
// - handle connection/network issues
// - timeouts
// - retry logic (for 503 service unavailable)
// - validate response data

export async function fetchDailyAPI(date: Date, coords: { lat: number, lon: number }): Promise<{ entry?: USNODailyDataSingleDay, error?: ApiError }> {
  const dateString = date.toISOString().slice(0,10); // YYYY-MM-DD per https://aa.usno.navy.mil/data/api
  const formattedCoords = `${coords.lat},${coords.lon}`;
  const url = `https://aa.usno.navy.mil/api/rstt/oneday?id=kennybar&date=${dateString}&coords=${formattedCoords}`;

  try {
    const response = await axios.get<USNODailyDataSingleDay>(url, { timeout: 5000 });

    const data = response.data;
    if (data.apiversion.split('.')[0] !== '4') {
      return { error: { message: 'USNO API version changed from 4, check for breaking changes' } };
    }

    return { entry: data };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    let errorMessage = 'Error fetching data from USNO daily API';

    if (isAxiosError(error)) {
      errorMessage = error.message;

      if (error.response) {
        return {
          error: {
            response_status: error.response.status,
            message: errorMessage,
            error_details: error.response.data
          }
        };
      }
    }

    return {
      error: {
        message: errorMessage,
        error_details: error 
      }
    }
  }
}

export function parseSunsetFromDailyData(entry: Entry): string | undefined {
  const sunsetTime = entry.properties.data.sundata.find(x => x.phen === 'Set')?.time;

  if (!sunsetTime) {
    console.error(`No sunset time found in entry`, entry);
    return;
  }

  return sunsetTime;
}

interface SunsetTimeResult {
  time: string | undefined;
  entry: Entry;
}
export async function getSunsetTime(date: Date, coords: { lat: number, lon: number }): Promise<SunsetTimeResult | null> {
  const { entry, error } = await fetchDailyAPI(date, coords);

  if (error) {
    console.error("USNO API error:", {
      responseStatus: error.response_status,
      message: error.message,
      details: error.error_details
    })
    return null;
  }

  if (!entry) {
    console.error('No data received from USNO API');
    return null;
  }

  const sunsetTimeString = parseSunsetFromDailyData(entry);
  console.log(`sunsettime:`, sunsetTimeString)

  // ? need? date obj with orig day + sunset time
  return { time: sunsetTimeString, entry };
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