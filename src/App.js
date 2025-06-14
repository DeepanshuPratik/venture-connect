import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import RoleSelectionPage from './pages/Auth/RoleSelectionPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MyProfilePage from './pages/Profile/MyProfilePage';
import EditProfilePage from './pages/Profile/EditProfilePage';
import JobPostingsListPage from './pages/JobPostings/JobPostingsListPage';
import CreateJobPostingPage from './pages/JobPostings/CreateJobPostingPage';
import JobPostingDetailPage from './pages/JobPostings/JobPostingDetailPage';
import AchievementsListPage from './pages/Achievements/AchievementsListPage';
import CreateAchievementPage from './pages/Achievements/CreateAchievementPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingIntroPage from './pages/LandingIntroPage';

import CommunityPage from './pages/Community/CommunityPage';
import CommunityFeedPage from './pages/Community/CommunityFeedPage';
import EntrepreneurSearchPage from './pages/Community/EntrepreneurSearchPage';
// NEW: Import WriteToUsPage
import WriteToUsPage from './pages/WriteToUsPage';

import { AnimatePresence } from 'framer-motion';
import { Box } from '@chakra-ui/react';

// NEW: A simpler ProtectedRoute just for the role selection page
const RoleSelectionProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner />;
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// RoleSelectionGuard Component (No change)
const RoleSelectionGuard = ({ children }) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (userProfile && userProfile.needsRoleSelection) {
    return <Navigate to="/select-role" replace />;
  }

  return children;
};


// Main Protected Route Component (No change)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading, userProfile } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <RoleSelectionGuard>{children}</RoleSelectionGuard>;
};

function App() {
  const { loading, currentUser, userProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <LoadingSpinner />
      </Box>
    );
  }

  if (currentUser && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/dashboard" replace />;
  }

  const shouldShowNavFooter = location.pathname !== '/' && location.pathname !== '/select-role'; // Also hide on select-role page
  const NAV_HEIGHT = "64px";

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {shouldShowNavFooter && <Navbar />}

      <Box
        as="main"
        flexGrow="1"
        pt={shouldShowNavFooter ? NAV_HEIGHT : "0"}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public and Auth Routes */}
            <Route path="/" element={<LandingIntroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* FIX: Use the new, simpler protected route for /select-role */}
            <Route path="/select-role" element={<RoleSelectionProtectedRoute><RoleSelectionPage /></RoleSelectionProtectedRoute>} />

            {/* Protected Routes (all other routes use the main ProtectedRoute) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            {/* ... other protected routes ... */}
            <Route path="/profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

            <Route path="/jobs" element={<ProtectedRoute><JobPostingsListPage /></ProtectedRoute>} />
            <Route path="/jobs/new" element={<ProtectedRoute allowedRoles={['entrepreneur']}><CreateJobPostingPage /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobPostingDetailPage /></ProtectedRoute>} />

            <Route path="/achievements" element={<ProtectedRoute><AchievementsListPage /></ProtectedRoute>} />
            <Route path="/achievements/new" element={<ProtectedRoute allowedRoles={['entrepreneur']}><CreateAchievementPage /></ProtectedRoute>} />

            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/community/feed" element={<ProtectedRoute><CommunityFeedPage /></ProtectedRoute>} />
            <Route path="/community/entrepreneurs" element={<ProtectedRoute><EntrepreneurSearchPage /></ProtectedRoute>} />

            <Route path="/write-to-us" element={<WriteToUsPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </Box>

      {shouldShowNavFooter && <Footer />}
    </Box>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;