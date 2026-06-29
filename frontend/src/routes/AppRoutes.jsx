import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { SocketProvider } from '../context/SocketContext'
import AboutPage from '../landing_page/about/AboutPage'
import HomePage from '../landing_page/home/HomePage'
import LandingLayout from '../landing_page/layout/LandingLayout'
import Login from '../landing_page/login/Login'
import Signup from '../landing_page/signup/Signup'
import SupportPage from '../landing_page/support/SupportPage'
import OwnProfileEditRoute from '../ourWebApp/components/OwnProfileEditRoute'
import ProtectedRoute from '../ourWebApp/components/ProtectedRoute'
import AppLayout from '../ourWebApp/layout/AppLayout'
import ChatPage from '../ourWebApp/pages/ChatPage'
import FriendRequests from '../ourWebApp/pages/FriendRequests'
import MyFriends from '../ourWebApp/pages/MyFriends'
import MyPosts from '../ourWebApp/pages/MyPosts'
import ProfileEdit from '../ourWebApp/pages/ProfileEdit'
import PublicProfile from '../ourWebApp/pages/PublicProfile'
import WebAppHome from '../ourWebApp/pages/WebAppHome'
import JobsForYou from '../ourWebApp/pages/JobsForYou'
import AnalyticsPage from '../ourWebApp/pages/AnalyticsPage'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <SocketProvider>
              <AppLayout />
            </SocketProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<WebAppHome />} />
        <Route path="jobs" element={<JobsForYou />} />
        <Route path="profile/edit" element={<OwnProfileEditRoute><ProfileEdit /></OwnProfileEditRoute>} />
        <Route path="profile/:username" element={<PublicProfile />} />
        <Route path="profile" element={<PublicProfile />} />
        <Route path="posts" element={<MyPosts />} />
        <Route path="friends/requests" element={<FriendRequests />} />
        <Route path="friends" element={<MyFriends />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="chat/:username" element={<ChatPage />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
