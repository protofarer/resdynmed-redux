import { LoaderFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"

import { Button } from "~/components/ui/button"

export async function loader({ params }: LoaderFunctionArgs) {
	const { lat, lon } = params
	// TODO validate lat lon
	// TODO get city, state, country from lat lon as available
	// TODO calc next session
	
	const [city, state, country] = ['Miami', 'Florida', 'USA']
	const sessionTime = new Date()

	return json({
		city,
		state,
		country,
		lat,
		lon,
		sessionTime
	})
}

export default function Portal() {
	const { city, country, state, sessionTime } = useLoaderData<typeof loader>()
	const s = 7
	return (
		<main className="relative min-h-screen bg-white">
			<div className="mx-auto mt-5">
				<div>City, State, Country</div>
				<div>{city}, {state ? `${state}, ` : null}{country}</div>
				<div>LAT: xxx.xx, LON: xxx.xx</div>
				{/* TODO next sess */}
				<div>NEXT_SESS_INFO</div>
				<div>Next Session Start Time: {sessionTime}</div>
				<Button><Link to={`/sessions/${s}`}>Session {s}</Link></Button>
				{/* TODO show countdown */}
				<div>COUNTDOWN_TIMER</div>
				{/* TODO link to monthly and yearly */}
				<div>LINKS_TO_MONTHLY_N_YEARLY_VIEWS</div>
			</div>
		</main>
	)
}