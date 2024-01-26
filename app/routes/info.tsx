import IntroText from "~/components/static/IntroText";
import SessionTexts from "~/components/static/SessionTexts";

export default function Info() {
	return (
		<main className='relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center'>
      <div className="mx-auto mt-10 max-w-sm sm:flex sm:flex-col sm:max-w-none sm:justify-center">
				<IntroText />
				<SessionTexts />
			</div>
		</main>
	)
}