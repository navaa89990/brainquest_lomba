import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage'; 
import Home from './pages/Home';
import MateriPage from './pages/MateriPage';
import DetailMateriPage from './pages/DetailMateriPage';
import KuisPage from './pages/KuisPage';
import Navbar from './components/Navbar';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';

function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/daftar', '/dashboard'].includes(location.pathname);

  return (
    <>
      {!hideNavbarPaths && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path='/daftar' element={<SignupPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/materi" element={<MateriPage />} />
        <Route path="/materi/:id" element={<DetailMateriPage />} />
        <Route path="/kuis" element={<KuisPage />} />
        <Route path="/kuis/:id" element={<KuisPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;