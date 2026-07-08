import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/authContext';
import { ThemeProvider } from './lib/ThemeContext';
import { ProtectedRoute } from './lib/protectedRoute';
import { AdminRoute } from './lib/AdminRoute';
import LoginPage from './pages/LoginPage'; 
import Home from './pages/Home';
import MateriPage from './pages/MateriPage';
import DetailMateriPage from './pages/DetailMateriPage';
import KuisPage from './pages/KuisPage';
import Navbar from './components/Navbar';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

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
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;