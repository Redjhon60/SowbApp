import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StudentProfilePage from './pages/StudentProfilePage';
import PaymentsPage from './pages/PaymentsPage';
import EmployeesPage from './pages/EmployeesPage';
import ExpensesPage from './pages/ExpensesPage';
import TransportPage from './pages/TransportPage';
import TimetablePage from './pages/TimetablePage';
import DocumentsPage from './pages/DocumentsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import BackupPage from './pages/BackupPage';

// Layout
import Sidebar from './components/shared/Sidebar';
import TopBar from './components/shared/TopBar';

// ─── Auth Context ────────────────────────────────────────────────
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// ─── Settings Context ─────────────────────────────────────────────
export const SettingsContext = createContext({});
export const useSettings = () => useContext(SettingsContext);

// ─── Protected Layout ─────────────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}>
        <TopBar />
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

// ─── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('smp_user')); } catch { return null; }
  });
  const [settings, setSettings] = useState({});

  const login = useCallback((userData) => {
    sessionStorage.setItem('smp_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('smp_user');
    setUser(null);
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      if (window.api) {
        const s = await window.api.getSettings();
        setSettings(s);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (user) refreshSettings();
  }, [user, refreshSettings]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <SettingsContext.Provider value={{ settings, refreshSettings }}>
        <Router>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/students" element={<PrivateRoute><StudentsPage /></PrivateRoute>} />
            <Route path="/students/:id" element={<PrivateRoute><StudentProfilePage /></PrivateRoute>} />
            <Route path="/payments" element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />
            <Route path="/employees" element={<PrivateRoute><EmployeesPage /></PrivateRoute>} />
            <Route path="/expenses" element={<PrivateRoute><ExpensesPage /></PrivateRoute>} />
            <Route path="/transport" element={<PrivateRoute><TransportPage /></PrivateRoute>} />
            <Route path="/timetable" element={<PrivateRoute><TimetablePage /></PrivateRoute>} />
            <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="/backup" element={<PrivateRoute><BackupPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SettingsContext.Provider>
    </AuthContext.Provider>
  );
}
