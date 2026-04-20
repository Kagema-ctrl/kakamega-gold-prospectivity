import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import GeologicalDashboard from './pages/GeologicalDashboard'
import InvestorDashboard from './pages/InvestorDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/geological" element={<GeologicalDashboard />} />
        <Route path="/investor" element={<InvestorDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
