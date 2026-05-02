import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PatientDashboard from './pages/patient/Dashboard';
import PatientUpload from './pages/patient/Upload';
import PatientTimeline from './pages/patient/Timeline';
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientView from './pages/doctor/PatientView';
import Profile from './pages/Profile';
import HealthuBot from './components/HealthuBot';

const PrivateRoute = ({ children, role }: { children: React.ReactNode; role?: 'patient' | 'doctor' }) => {
  const { user, userData, loading } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  if (userData && !userData.onboardingComplete) {
    if (window.location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" />;
    }
  }

  if (role && userData && userData.role !== role) {
    return <Navigate to={userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-28">
          <Navbar />
          <main className="container mx-auto px-4 py-6 max-w-lg md:max-w-xl">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
              
              <Route path="/patient/dashboard" element={<PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/patient/upload" element={<PrivateRoute role="patient"><PatientUpload /></PrivateRoute>} />
              <Route path="/patient/timeline" element={<PrivateRoute role="patient"><PatientTimeline /></PrivateRoute>} />
              
              <Route path="/doctor/dashboard" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
              <Route path="/doctor/patient/:id" element={<PrivateRoute role="doctor"><PatientView /></PrivateRoute>} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <HealthuBot />
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
}

