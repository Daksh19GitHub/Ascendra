import { Outlet } from 'react-router-dom'
import Navbar from '../home/Navbar'
import Footer from '../home/Footer'
import '../styles/index.css'

function LandingLayout() {
  return (
    <div className="landing-page">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default LandingLayout
