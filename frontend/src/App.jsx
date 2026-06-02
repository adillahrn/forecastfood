import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import InputDataPage from './pages/InputDataPage'
import NotFoundPage from './pages/NotFoundPage'
import PredictionResultPage from './pages/PredictionResultPage'
import AboutPage from './pages/AboutPage'
import HistoryPage from './pages/HistoryPage'
import AccountSettingsPage from './pages/AccountSettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/input-data" element={<ProtectedRoute><InputDataPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/predictions" element={<ProtectedRoute><PredictionResultPage /></ProtectedRoute>} />
      <Route
      path="/predictions/:id"
      element={
        <ProtectedRoute>
          <PredictionResultPage />
        </ProtectedRoute>
      }/>
      <Route path="/about" element={<AboutPage />} />
      <Route path="/app/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />
    </Routes>
  )
}

export default App