import { LoaderFunctionArgs, json, type MetaFunction, LinksFunction, redirect, ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";

import About from "~/components/static/About";
import { Button } from "~/components/ui/button";
import { useTimeStore } from "~/stores/timeStore";
import stylesHref from '~/styles/global.css'

export type Entry = { 
  city: string;
  state?: string;
  country: string;
} & Coords

export interface Coords {
  lat: number;
  lon: number;
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesHref }
]

export const meta: MetaFunction = () => [{ title: "Resonant Dynamic Meditation Experience" }]

export async function loader({ request }: LoaderFunctionArgs) {
  // if user auth'd, use account's timezone instead of client's system corrected version
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    return json({ q: '', matches: null })
  }

  // TODO
  // const entries = await matchOnLocationQuery(q)

  const entries: Entry[] = [
    { city: 'atlanta', state: 'Georgia', country: 'US', lat: 100.010, lon: -10.99999 }, 
    { city: 'barcelona', state: undefined, country: 'US', lat: 200.010, lon: -10.99999 }, 
    { city: 'bangladesh', state: undefined, country: 'US', lat: 300.010, lon: -10.99999 }, 
    { city: 'cincinnati', state: 'ohio', country: 'US', lat: 400.010, lon: -10.99999 }, 
    { city: 'cleveland', state: 'ohio', country: 'US', lat: 500.010, lon: -10.99999 }, 
    { city: 'columbus', state: 'ohio', country: 'US', lat: 600.010, lon: -10.99999 }
  ]
  const matches = entries.filter(entry => entry.city.startsWith(q || ""))

  return json({ q, matches })
}

// Action only for clicking on matches
export async function action({ request }: ActionFunctionArgs) {
  // if coords valid, redirect to portal
  const formData = await request.formData()
  const latInput = formData.get('lat') as string
  const lonInput = formData.get('lon') as string
  console.log(`string coords: ${latInput},${lonInput}`, )

  // TODO put in a validation function
  // TODO validate actual ranges for lat/lon
  try {
    invariant(latInput && lonInput, 'unexpected missing lat or lon')
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
    } else {
      console.error('unknown error')
    }
    return json({ error: 'Missing coordinates' }, { status: 400 })
  }

  const lat = parseFloat(latInput)
  const lon = parseFloat(lonInput)
  console.log(`float coords: ${latInput},${lonInput}`, )

  try {
    invariant(lat && lon, 'lat and lon must be numbers')
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
    } else {
      console.error('unknown error')
    }
    return json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  return redirect(`/portal?lat=${lat}&lon=${lon}`)
}

function Index() {
  const { getCurrentUTC } = useTimeStore()
  const { q, matches } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const submit = useSubmit()
  const searching = navigation.location &&
    new URLSearchParams(navigation.location.search).has('q')

  const [debouncedQuery, setDebouncedQuery] = useState(q);
  const [coords, setCoords] = useState<Coords | undefined>();

  useEffect(() => {
    // const searchField = document.getElementById('q')
    // if (searchField instanceof HTMLInputElement) {
    //   searchField.value = q || ''
    // }
    const handler = setTimeout(() => {
      const isFirstSearch = q === null;
    // TODO validate user input
      submit({ q: debouncedQuery }, { replace: !isFirstSearch })
    }, 300);
    return () => clearTimeout(handler);
  }, [submit, debouncedQuery])

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDebouncedQuery(event.target.value)
  }

  return (
    <main className="relative min-h-screen bg-white">
      <div className="mx-auto mt-5">
        {/* Search and Results */}
        <div className='border-b border-black flex flex-col items-center p-y-1 p-x-2 gap-y-2'>
          <div className='flex items-center gap-x-2'>
            <Form
              id='search-form'
              role='search'
              className='border border-green-700 relative rounded-md'
            >
              <input
                id='search-location'
                name='q'
                type='search'
                defaultValue={q || ''}
                placeholder='Search for a location'
                aria-label='Search for a location'
                className={`${searching ? 'loading' : ''} p-2 rounded-md`}
                onChange={handleSearchChange}
              />
              <div id='search-spinner' hidden={!searching} aria-hidden />
            </Form>
            <Form id='submit-query' method='post'>
              {/* <input name='city' defaultValue={entry?.city} hidden={true} />
              <input name='state' defaultValue={entry?.state} hidden={true} />
              <input name='country' defaultValue={entry?.country} hidden={true} /> */}
              <input name='lat' defaultValue={coords?.lat} hidden={true} />
              <input name='lon' defaultValue={coords?.lon} hidden={true} />
              <Button variant='default' type='submit'>Set Loc</Button>
            </Form>
          </div>
          <div>
            {matches ? (
              <ul>
                {matches.map((entry: Entry) => (
                  <li key={entry.city}>
                    <button 
                      tabIndex={0} 
                      onClick={() => {
                        // TODO submit to action for coords validation
                        setDebouncedQuery(`${entry.city}, ${entry.country}`)
                        setCoords({ lat: entry.lat, lon: entry.lon })
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          // TODO submit to action for coords validation
                          setDebouncedQuery(`${entry.city}, ${entry.country}`)
                          setCoords({ lat: entry.lat, lon: entry.lon })
                        }
                      }}
                    >
                      {entry.city}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <Form
          id='mock-submit-query'
          className='border border-green-700 relative'
          method='post'
        >
          <input
            id='mock-location'
            name='loc'
            value='SOME_LOC'
            hidden={true}
            readOnly
          />
          <input
            id='mock-time'
            name='time'
            value={getCurrentUTC()}
            hidden={true}
            readOnly
          />
          <Button variant='secondary' type='submit'>Mock Submit Loc</Button>
          {/* <button className='border-4 rounded border-purple-600' type='submit'>submit mock</button> */}
        </Form>
        <Link to='/info' className='text-blue-700 text-center font-semibold'>Info</Link>
        <About />
        <br />
        <Link to='/dev' className='text-4xl text-red-700 text-center font-semibold border border-red-500 rounded-md'>Dev</Link>
      </div>
    </main>
  );
}

export default Index