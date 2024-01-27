import introText from '~/data/introText.json'

export default function About() {
	return (
		<section className='flex flex-col items-center'>
			<h2 className='text-xl'>About</h2>
			<p className='italic text-sm' dangerouslySetInnerHTML={{ __html: introText.about }}></p>
		</section>
	)
}