import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Navbar from './components/Navbar';

import AuthPage           from './pages/AuthPage';
import StudentDashboard   from './pages/StudentDashboard';
import MyLogsPage         from './pages/MyLogsPage';
import LogHoursPage       from './pages/LogHoursPage';
import SupervisorDashboard from './pages/SupervisorDashboard';
import SupervisorLogsPage  from './pages/SupervisorLogsPage';
import StudentsPage        from './pages/StudentsPage';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin" />
    </div>
  );
  if (user) return <Navigate to={user.role === 'supervisor' ? '/supervisor' : '/dashboard'} replace />;
  return <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />

          {/* Student */}
          <Route path="/dashboard" element={<PrivateRoute role="student"><Layout><StudentDashboard /></Layout></PrivateRoute>} />
          <Route path="/logs"      element={<PrivateRoute role="student"><Layout><MyLogsPage /></Layout></PrivateRoute>} />
          <Route path="/logs/new"  element={<PrivateRoute role="student"><Layout><LogHoursPage /></Layout></PrivateRoute>} />

          {/* Supervisor */}
          <Route path="/supervisor"          element={<PrivateRoute role="supervisor"><Layout><SupervisorDashboard /></Layout></PrivateRoute>} />
          <Route path="/supervisor/logs"     element={<PrivateRoute role="supervisor"><Layout><SupervisorLogsPage /></Layout></PrivateRoute>} />
          <Route path="/supervisor/students" element={<PrivateRoute role="supervisor"><Layout><StudentsPage /></Layout></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
