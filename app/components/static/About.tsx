import introText from '~/data/introText.json'

export default function About() {
	return (
		<section className='flex flex-col items-center'>
			<h2 className='font-semibold'>About</h2>
			<p className='italic' dangerouslySetInnerHTML={{ __html: introText.about }}></p>
		</section>
	)
}