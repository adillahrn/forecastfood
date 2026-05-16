import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import InputDataPage from './pages/InputDataPage'
import NotFoundPage from './pages/NotFoundPage'
import PredictionResultPage from './pages/PredictionResultPage'
import StockRecommendationPage from './pages/StockRecommendationPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/input-data" element={<InputDataPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/predictions" element={<PredictionResultPage />} />
      <Route path="/stock-recommendation" element={<StockRecommendationPage />} />
    </Routes>
  )
}

export default App