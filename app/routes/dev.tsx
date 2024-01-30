import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { generateSessionsAfterDate, getFirstPhaseAfterDate, getFirstPhaseBeforeDate } from "~/lib/session";
import { getSunsetTime } from "~/lib/use-api";

let val: unknown = null;

const DATE = new Date(Date.UTC(2024, 1, 1))

const COORDS = {
	lat:25.710583,
	lon: -80.441457
}

const tests = [
	async() => {
		await getSunsetTime(DATE, COORDS).then (sunset => {
			console.log(`sunset val:`, sunset);
			val = sunset?.time
		});
	},

	async() => {
		await getFirstPhaseAfterDate(DATE).then(data => {
			val = data
		})
	},

	async() => {
		await getFirstPhaseBeforeDate(DATE).then(data => {
			val = data
		})
	},
	async() => {
		await generateSessionsAfterDate(DATE, COORDS, 10).then(data => {
			val = data
		})
	}
]

export function loader() {
	return json({ n_tests: tests.length })
}


// call functions in `session.ts` to test
export async function action({ request }: ActionFunctionArgs) {
	const body = await request.formData()
	const test = body.get('test')

	let clear = false;

	if (body.get('clear') === 'true') {
		clear = true
	}

	if (test) {
		await tests[parseInt(test as string) - 1]()
	}

	return json({ val, clear })
}

export default function Dev() {
	const { n_tests } = useLoaderData<typeof loader>()
	
	const data = useActionData<typeof action>()
	const [lines, setLines] = useState<string[]>([])

	useEffect(() => {
		if (data?.clear) {
			setLines([])
		} else if (data?.val) {
			const text = JSON.stringify(data.val, null, 2)
			setLines([...lines, text, '--------------------'])
		}
	}, [data])

	const testForms = [];
	for (let i = 0; i < n_tests; i++) {
		testForms.push(
			<Form method='post' key={i}>
				<input type='text' name='test' value={i + 1} hidden={true} readOnly />
				<Button variant='outline' size='sm' type='submit'>{i + 1}</Button>
			</Form>
		)
	}

	return (
		<>
			<div className='bg-black h-full flex flex-col gap-3 p-2'>
				<div className='flex gap-x-2'>
					<Form method='post'>
						<input type='text' name='clear' value='true' hidden={true} readOnly />
						<Button variant='outline' size='sm' type='submit'>Clear</Button>
					</Form>
					{testForms}
				</div>
				<div>
					<textarea 
						className='font-mono whitespace-pre-line border border-blue-700 text-green-500 bg-slate-900'
						id='out'
						rows={25}
						cols={80}
						value={lines.join('\n')}
						readOnly
					>
					</textarea>
				</div>
			</div>
		</>
	)
}