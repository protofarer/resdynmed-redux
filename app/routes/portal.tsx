
// export async function loader({ params }: LoaderFunctionArgs) {
// 	const { loc } = params
// 	// TODO check server cache
// 	// TODO else hit api
// 	// TODO cache api response
// 	// TODO return api response
// 	return json({
// 		displayTime: null
// 	})
// }

export default function Portal() {
	return (
		<main className="relative min-h-screen bg-white">
			<div className="mx-auto mt-5">
				{/* TODO next sess */}
				<div>NEXT_SESS_INFO</div>
				{/* TODO show countdown */}
				<div>COUNTDOWN_TIMER</div>
				{/* TODO link to monthly and yearly */}
				<div>LINKS_TO_MONTHLY_N_YEARLY_VIEWS</div>
			</div>
		</main>
	)
}