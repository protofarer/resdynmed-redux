import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { getFirstPhaseAfterDate } from "~/lib/session";
import { getSunsetTime } from "~/lib/use-api";

// call functions in `session.ts` to test
export async function action({ request }: ActionFunctionArgs) {
	const body = await request.formData()
	const test = body.get('test')

	let clear = false;

	if (body.get('clear') === 'true') {
		clear = true
	}

	let val = null;

	const DATE = new Date()
	
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
	]

	await tests[parseInt(test as string) - 1]()

	return json({ val, clear })
}

export default function Dev() {
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

	return (
		<>
			<div className='bg-black h-full flex flex-col gap-3 p-2'>
				<div className='flex gap-x-2'>
					<Form method='post'>
						<input type='text' name='clear' value='true' hidden={true} readOnly />
						<Button variant='outline' size='sm' type='submit'>Clear</Button>
					</Form>
					<Form method='post'>
						<input type='text' name='test' value='1' hidden={true} readOnly />
						<Button variant='outline' size='sm' type='submit'>1</Button>
					</Form>
					<Form method='post'>
						<input type='text' name='test' value='2' hidden={true} readOnly />
						<Button variant='outline' size='sm' type='submit'>2</Button>
					</Form>
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