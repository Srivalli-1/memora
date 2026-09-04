import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MemoriesPage from './pages/MemoriesPage';
import DiaryPage from './pages/DiaryPage';
import LettersPage from './pages/LettersPage';
import CommitmentsPage from './pages/CommitmentsPage';
import TimelinePage from './pages/TimelinePage';
import SharedSpacesPage from './pages/SharedSpacesPage';
import GamesPage from './pages/GamesPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      {/* Public Landing & Authentication Routes */}
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Authenticated Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/diary" element={<DiaryPage />} />
          <Route path="/letters" element={<LettersPage />} />
          <Route path="/commitments" element={<CommitmentsPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/spaces" element={<SharedSpacesPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
