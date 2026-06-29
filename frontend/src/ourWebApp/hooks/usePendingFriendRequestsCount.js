import { useEffect, useState } from 'react'
import { fetchPendingFriendRequests, fetchSentFriendRequests } from '../api/webAppApi'

export function usePendingFriendRequestsCount(refreshKey, overrideCount) {
  const [count, setCount] = useState(
    typeof overrideCount === 'number' ? overrideCount : 0
  )

  useEffect(() => {
    if (typeof overrideCount === 'number') {
      setCount(overrideCount)
      return undefined
    }

    let cancelled = false

    Promise.all([fetchPendingFriendRequests(), fetchSentFriendRequests()])
      .then(([incomingResponse, sentResponse]) => {
        if (cancelled) return

        const incomingCount = incomingResponse.data.requests?.length || 0
        const sentCount = sentResponse.data.requests?.length || 0
        setCount(incomingCount + sentCount)
      })
      .catch(() => {
        if (!cancelled) setCount(0)
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey, overrideCount])

  return count
}
