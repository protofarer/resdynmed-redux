import store from 'store2'
import { create } from 'zustand'

// const SECONDS_IN_DAY = 60 * 60 * 24
// ? CSDR rm setClientTime, setServerTime

interface TimeState {
  serverTime?: Date
  displayTime?: string
  dT?: number // n of seconds client's system difference from serverTime, a constant only updated on sync
  timeZone?: string
}

interface TimeActions {
  sync: (serverTime?: Date) => void
  getPassedTime: () => number | undefined
  getDisplayTime: () => Promise<string | undefined>
}

// TODO if no time is set, and offline, throw and show error, disable offline functionality

export const useTimeStore = create<TimeState & TimeActions>((set, get) => ({
  serverTime: new Date(store.get('serverTime')) || null,

  displayTime: store.get('displayTime') || null,

  // since sync receives server time, it doesnt care if stale, it has latest data so it will execute sync
  sync: (serverTime?: Date) => {
    if (!serverTime) {
      return
    }
    set({ serverTime })
    store.set('serverTime', serverTime.toISOString())

    const dT = (Date.now() - serverTime.getTime()) / 1000
    set({ dT })
    store.set('dT', dT)

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    store.set('timeZone', timeZone)
    set({ timeZone })

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
    set({ displayTime })
  },

  getPassedTime: () => {
    const time = get().serverTime
    const dst = get().dT

    if (!time || !dst) {
      return undefined
    }

    return (Date.now() - (time.getTime() - dst)) / 1000
  },

  getDisplayTime: async () => {
    let isStale = true;

    const dt = get().getPassedTime()
    if (dt && dt < 60 * 60 * 24) {
      isStale = false
    }


    if (isStale) {
      try {
        const res = await fetch('http://localhost:8080/server-time')
        const { serverTime } = await res.json()
        get().sync(serverTime)
        console.log(`serverTime in store`, serverTime)
        
      } catch (error) {
        console.error(error)
      }
    }

    return get().displayTime
  }
}))