import introText from '~/data/introText.json'

export default function IntroText() {
	return (
		<>
			<h2 className='text-lg font-semibold'>Introduction</h2>
			<p dangerouslySetInnerHTML={{ __html: introText.intro }}></p>
			<h2 className='text-lg font-semibold'>Technique</h2>
			<p dangerouslySetInnerHTML={{ __html: introText.meditate }}></p>
		</>
	)
}