import { typedjson } from "remix-typedjson"

import { getServerTime } from "~/lib/time"

export const loader = async () => {
	const serverTime = getServerTime()
	return typedjson({ serverTime })
}