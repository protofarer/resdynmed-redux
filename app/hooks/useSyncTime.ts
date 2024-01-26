import { useEffect } from 'react';
import { useTypedFetcher } from 'remix-typedjson';

import { useTimeStore } from '~/stores/timeStore'; // Adjust the path as needed
import { ServerTimeResponse } from '~/types';

const useSyncedTime = () => {
  const fetcher = useTypedFetcher<ServerTimeResponse>({ key: 'serverTime' })
  // const { sync, getPassedTime, displayTime } = useTimeStore()

  // useEffect(() => {
  //   let isStale = true;

  //   const dt = getPassedTime()
  //   if (dt && dt < 60 * 60 * 24) {
  //     isStale = false
  //   }

  //   if (isStale) {
  //     fetcher.load('/server-time')
  //   }
  // }, [fetcher, getPassedTime])

  // useEffect(() => {
  //   if (fetcher.data?.serverTime) {
  //     sync(fetcher.data.serverTime)
  //   }
  // }, [fetcher.data?.serverTime, sync])

  return { 
    state: fetcher.state, 
    serverTime: fetcher.data?.serverTime,
      // ? does this work? can I get displayTime right after or does hook have to complete?
    // displayTime: displayTime,
  }
}

export default useSyncedTime