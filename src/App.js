import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
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

// Import AnimatePresence from framer-motion
import { AnimatePresence } from 'framer-motion';
// Import Box from Chakra UI
import { Box } from '@chakra-ui/react';


// Protected Route Component (No change)
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

  return children;
};

function App() {
  const { loading, currentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <LoadingSpinner />
      </Box>
    );
  }

  // Determine if Navbar/Footer should be visible
  const shouldShowNavFooter = location.pathname !== '/';

  return (
    // Outer Box: Ensures minimum height and provides flex context for its direct children (Navbar, main content, Footer)
    <Box minH="100vh" display="flex" flexDirection="column">
      {shouldShowNavFooter && <Navbar />}

      {/* Main content area: This Box takes up remaining space and wraps the Routes */}
      {/* `as="main"` provides semantic HTML. `flexGrow="1"` ensures it fills available space. */}
      {/* Components rendered by Routes will be children of this `main` Box,
          and thus won't be direct flex items of the outermost container, resolving layout conflicts. */}
      <Box as="main" flexGrow="1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Landing Page Route: Handles its own fixed positioning and exit animation */}
            <Route path="/" element={<LandingIntroPage />} />

            {/* All other routes are rendered directly. They will manage their own layouts. */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

            <Route path="/jobs" element={<ProtectedRoute><JobPostingsListPage /></ProtectedRoute>} />
            <Route path="/jobs/new" element={<ProtectedRoute allowedRoles={['entrepreneur']}><CreateJobPostingPage /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobPostingDetailPage /></ProtectedRoute>} />

            <Route path="/achievements" element={<ProtectedRoute><AchievementsListPage /></ProtectedRoute>} />
            <Route path="/achievements/new" element={<ProtectedRoute allowedRoles={['entrepreneur']}><CreateAchievementPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </Box> {/* End of main content Box */}

      {shouldShowNavFooter && <Footer />}
    </Box>
  );
}

// Wrap App component with Router for useLocation to work correctly
function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;