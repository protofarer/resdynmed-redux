import store from "store2"

export function syncStores(serverTimeString: string) {
  store.set('serverTime', serverTimeString)

  const serverTime = new Date(serverTimeString)
  const dT = (Date.now() - serverTime.getTime()) / 1000
  store.set('dT', dT)

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  store.set('timeZone', timeZone)

  const displayTime = serverTime.toLocaleString('en-US', { 
    timeZone, 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: 'numeric', 
    hour12: true, 
    minute: 'numeric', 
  })
  store.set('displayTime', displayTime)

  const displayUTCTime = serverTime.toLocaleString('en-US', {
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: 'numeric', 
    hour12: true, 
    minute: 'numeric', 
  })
  return { displayTime, displayUTCTime }
}