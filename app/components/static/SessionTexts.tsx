import sessionTexts from '~/data/sessionTexts.json';

export default function SessionTexts() {
	return (
		<section className="flex flex-col gap-y-3">
		{sessionTexts.map((text, idx) => (
			<section key={idx}>
				<h3 className="text-lg font-semibold">Session {idx + 1}</h3>
				<p dangerouslySetInnerHTML={{ __html: text }}></p>
			</section>
		))}
		</section>
	)
}