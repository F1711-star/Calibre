import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import InboxPage from './pages/InboxPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useI18n } from './context/I18nContext';

function HomeRedirect() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  if (loading) return <div className="page-loading">{t.common.loading}</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'manager') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/inbox" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute role="learner">
            <InboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="manager">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
