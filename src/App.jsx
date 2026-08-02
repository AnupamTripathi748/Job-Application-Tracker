import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context & Guards
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Elements
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AllJobs from './pages/AllJobs';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Layout Wrapper with Sidebar + Header + Nested Routing
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navigation header bar */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Dynamic page container */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing introductory page */}
          <Route path="/landing" element={<Landing />} />
          
          {/* Unified Login / Register page */}
          <Route path="/register" element={<Register />} />

          {/* Secure Protected Routes layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard summary metric stats */}
            <Route index element={<Dashboard />} />
            
            {/* Core jobs search & tracker workspace */}
            <Route path="all-jobs" element={<AllJobs />} />
            
            {/* User profile manager settings */}
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallbacks */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Global Notification system */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </AuthProvider>
  );
}
