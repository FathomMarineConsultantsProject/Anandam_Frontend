import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MoodPage from './pages/MoodPage';
import MoodCheckinPage from './pages/MoodCheckinPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mood-quick" element={<MoodPage />} />
        <Route path="/mood" element={<MoodCheckinPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;