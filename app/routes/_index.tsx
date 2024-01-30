import { LoaderFunctionArgs, json, type MetaFunction, LinksFunction, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect } from "react";

import About from "~/components/static/About";
import { Button } from "~/components/ui/button";
import { useTimeStore } from "~/stores/timeStore";
import stylesHref from '~/styles/global.css'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesHref }
]

export const meta: MetaFunction = () => [{ title: "Resonant Dynamic Meditation Experience" }]

export async function loader({ request }: LoaderFunctionArgs) {
  // if user auth'd, use account's timezone instead of client's system corrected version
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    return { q: null, cities: null }
  }

  // const cities = await getCities(q)
  const cities = ['miami', 'varginhas', 'bangladesh', 'bangkok']
  const filteredCities = cities.filter(city => city.startsWith(q || ""))

  return json({ q, cities: filteredCities })
}

// TODO action, validate query before redirect
export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData()
  const location = formData.get('loc')
  const time = formData.get('time')

  const isLocationValid = true
  if (!isLocationValid) {
    return json({ error: 'invalid location' }, { status: 400 })
  }

  return redirect(`/portal?loc=${location}&time=${time}`)
}

function Index() {
  const { getCurrentUTC } = useTimeStore()
  
  const { q, cities } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const submit = useSubmit()
  const searching = navigation.location &&
    new URLSearchParams(navigation.location.search).has('q')

  useEffect(() => {
    const searchField = document.getElementById('q')
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || ''
    }
  }, [q])

  return (
    <main className="relative min-h-screen bg-white">
      <div className="mx-auto mt-5">
        {/* Search and Results */}
        <div className='border-b border-black flex flex-col items-center p-y-1 p-x-2 gap-y-2'>
          <Form
            id='search-form'
            role='search'
            onChange={(event) => {
              const isFirstSearch = q === null;
              submit(event.currentTarget, { replace: !isFirstSearch })
            }}
            className='border border-green-700 relative'
          >
            <input
              id='q'
              name='q'
              type='search'
              defaultValue={q || ''}
              placeholder='Search for a location'
              aria-label='Search for a location'
              className={searching ? 'loading' : ''}
            />
            <div id='search-spinner' hidden={!searching} aria-hidden />
          </Form>
          <div>
            {/* This rolldown must be definitive locations for USNO API to use */}
            {cities ? cities.map((city: string) => (
              // TODO onClick, execute query
              <div key={city}>{city}</div>
            )) : null}
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