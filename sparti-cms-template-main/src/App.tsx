
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'
import { SpartiCMS, SpartiCMSWrapper, CMSSettingsProvider } from '../sparti-builder'

function App() {
  console.log('App component rendering');
  
  return (
    <CMSSettingsProvider>
      <Router>
        <Routes>
          {/* CMS Admin Routes under /admin */}
          <Route path="/admin/*" element={<SpartiCMS />} />
          
          {/* Main website route with CMS wrapper */}
          <Route path="/" element={
            <SpartiCMSWrapper>
              <LandingPage />
            </SpartiCMSWrapper>
          } />
          
          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </CMSSettingsProvider>
  )
}

export default App
