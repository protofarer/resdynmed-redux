import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";

const MY_COORDS = {
	lat:25.710583,
	lon: -80.441457
}

// call functions in `session.ts` to test
export async function action({ request }: ActionFunctionArgs) {
	// TODO send formdata with test values of 1, 2, 3...
	const body = await request.formData()
	const test = body.get('test')
	// const existingText = body.get('existingText')

	if (body.get('clear')) {
		return json({ clear: true, text: '' })
	}
	
	switch (test) {
		case '1':
			return test1()
		default:

	}

	function test1() {
		// console.log(`existing text`, existingText)
		
		return json({ text: `newtxt`, clear: false })
	}

	return json({ text: 'hello', clear: false })
}

export default function Dev() {
	const data = useActionData<typeof action>()
	const [lines, setLines] = useState<string[]>([])

	useEffect(() => {
		if (data?.clear) {
			setLines([])
		}
		if (data?.text) {
			setLines([...lines, data.text])
		}
	}, [data])

	return (
		<>
			<div className='bg-black h-full flex flex-col gap-3 p-2'>
				<div className='flex gap-x-2'>
					<Form method='post'>
						<input type='text' name='test' value='1' hidden={true} readOnly />
						<input type='text' name='existingText' value={data?.text} hidden={true} readOnly />
						<Button variant='outline' type='submit'> fetch a sunset </Button>
					</Form>
					<Form method='post'>
						<input type='text' name='clear' value='true' hidden={true} readOnly />
						<Button variant='outline' type='submit'>Clear</Button>
					</Form>
				</div>
				<div>
					<textarea 
						className='whitespace-pre-line border border-blue-700 text-green-500 bg-slate-900'
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