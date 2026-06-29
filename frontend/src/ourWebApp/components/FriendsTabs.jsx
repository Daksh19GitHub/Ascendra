import { NavLink } from 'react-router-dom'
import { usePendingFriendRequestsCount } from '../hooks/usePendingFriendRequestsCount'

function FriendsTabs({ pendingTotal: pendingTotalProp }) {
  const pendingTotal = usePendingFriendRequestsCount(undefined, pendingTotalProp)

  return (
    <div className="friends-tabs">
      <NavLink
        to="/app/friends"
        end
        className={({ isActive }) => `friends-tab${isActive ? ' active' : ''}`}
      >
        My friends
      </NavLink>
      <NavLink
        to="/app/friends/requests"
        className={({ isActive }) => `friends-tab${isActive ? ' active' : ''}`}
      >
        Pending requests
        {pendingTotal > 0 && (
          <span className="friends-tab-badge" aria-label={`${pendingTotal} pending requests`}>
            {pendingTotal > 99 ? '99+' : pendingTotal}
          </span>
        )}
      </NavLink>
    </div>
  )
}

export default FriendsTabs
