import { create } from 'zustand'

// const SECONDS_IN_DAY = 60 * 60 * 24
// ? CSDR rm setClientTime, setServerTime

interface TimeState {
  initServerTime?: Date
  initLocalTime?: string
  dT?: number // n of seconds client's system difference from serverTime, a constant only updated on sync
  timeZone?: string
}

interface TimeActions {
  getPassedTime: () => number | undefined
  getCurrentLocalTime: () => string | undefined
  getCurrentUTC: () => string | undefined
}

// TODO if no time is set, and offline, throw and show error, disable offline functionality

export const useTimeStore = create<TimeState & TimeActions>((set, get) => ({
  initServerTime: undefined,
  initLocalTime: undefined,

  getPassedTime: () => {
    const initServerTime = get().initServerTime
    const dT = get().dT

    if (!initServerTime || !dT) {
      return undefined
    }

    return (Date.now() - (initServerTime.getTime() - dT)) / 1000
  },

  getCurrentLocalTime: () => {
    let initServerTime = get().initServerTime
    const timeZone = get().timeZone
    const passedTime = get().getPassedTime()

    if (!initServerTime || !timeZone || !passedTime) {
      return undefined
    }

    initServerTime = new Date(initServerTime.getTime() + passedTime)

    return initServerTime.toLocaleString('en-US', { 
      timeZone, 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      hour12: true, 
      minute: 'numeric', 
    })
  },

  getCurrentUTC: () => {
    const initServerTime = get().initServerTime
    const passedTime = get().getPassedTime()
    console.log(`iST`, initServerTime)
    console.log(`pT`, passedTime)
    
    
    if (!initServerTime || !passedTime) {
      return undefined
    }

    const currentUTC = new Date(initServerTime.getTime() + passedTime)
    const out = currentUTC.toISOString()
    
    return out
  }
}))