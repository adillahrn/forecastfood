import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import InputDataPage from './pages/InputDataPage'
import NotFoundPage from './pages/NotFoundPage'
import PredictionResultPage from './pages/PredictionResultPage'
import StockRecommendationPage from './pages/StockRecommendationPage'
import AboutPage from './pages/AboutPage'
import HistoryPage from './pages/HistoryPage'
import AccountSettingsPage from './pages/AccountSettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/input-data" element={<InputDataPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/predictions" element={<PredictionResultPage />} />
      <Route path="/stock-recommendation" element={<StockRecommendationPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<AccountSettingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}

export default App