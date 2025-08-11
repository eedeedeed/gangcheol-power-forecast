import React from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import ThemeProvider from './contexts/ThemeContext';
import AuthProvider, { AuthContext } from './contexts/AuthContext';
import BuildingProvider from './contexts/BuildingContext';
import NotificationProvider from './contexts/NotificationContext';

// Styles
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/monitoring.css';
import './styles/alerts.css';
import './styles/guide.css';
import './styles/auth.css';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Page Components
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import BuildingMonitoring from './pages/BuildingMonitoring';
import Alerts from './pages/Alerts';
import Guide from './pages/Guide';
import Settings from './pages/Settings';
import ProfilePage from './pages/ProfilePage';

// QueryClient 인스턴스 생성
const queryClient = new QueryClient();

function MainLayout() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            <h2>Power Monitoring</h2>
          </Link>
          <Navbar />
        </div>
      </nav>
      <div className="main-container">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}

function ProtectedRoute() {
  const { isLoggedIn } = React.useContext(AuthContext);
  return isLoggedIn ? <MainLayout /> : <Navigate to="/auth" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BuildingProvider>
            <NotificationProvider>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/monitoring" element={<BuildingMonitoring />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/guide" element={<Guide />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </NotificationProvider>
          </BuildingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;