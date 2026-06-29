import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import AppNavbar from '../components/AppNavbar'
import AppSidebar from '../components/AppSidebar'
import AiAssistantPanel from '../components/AiAssistantPanel'
import PageTransition from './PageTransition'
import '../styles/index.css'

function AppLayout() {
  const location = useLocation()

  return (
    <div className="webapp-page">
      <AppNavbar />
      <div className="webapp-body">
        <AppSidebar />
        <main className="webapp-main">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
        <AiAssistantPanel />
      </div>
    </div>
  )
}

export default AppLayout
