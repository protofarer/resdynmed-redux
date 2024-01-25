import introText from '~/data/introText.json'

export default function About() {
	return (
		<section>
			<h2 className='text-xl font-semibold'>About</h2>
			<p dangerouslySetInnerHTML={{ __html: introText.about }}></p>
		</section>
	)
}