import store from "store2"

import { useTimeStore } from "./timeStore"

export function syncStores(serverTimeString: string) {
  store.set('initServerTime', serverTimeString)

  const initServerTime = new Date(serverTimeString)
  const dT = (Date.now() - initServerTime.getTime()) / 1000
  store.set('dT', dT)

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  store.set('timeZone', timeZone)

  const initLocalTime = initServerTime.toLocaleString('en-US', { 
    timeZone, 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: 'numeric', 
    hour12: true, 
    minute: 'numeric', 
  })
  store.set('initLocalTime', initLocalTime)

  useTimeStore.setState({ initServerTime, initLocalTime, dT, timeZone })

  return { initLocalTime }
}