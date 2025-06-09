import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Import Chakra UI components for layout
import { Flex, Box, Container } from '@chakra-ui/react'; // <--- ADD Flex, Box, Container

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

// New Community Pages
import CommunityPage from './pages/Community/CommunityPage';
import EntrepreneurSearchPage from './pages/Community/EntrepreneurSearchPage';
import CommunityFeedPage from './pages/Community/CommunityFeedPage';


// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading, userProfile } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Role-based protection
  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    // If not allowed, redirect to dashboard or a permission denied page
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      // Centralize loading spinner when the whole app is loading
      <Flex minH="100vh" align="center" justify="center" bg="gray.100">
        <LoadingSpinner />
      </Flex>
    );
  }

  return (
    <Router>
      {/* Outer Flex container to make the footer sticky */}
      <Flex direction="column" minH="100vh"> {/* Use Flex, direction="column", minH="100vh" */}
        <Navbar />

        {/* Main content area - takes up available space */}
        <Box as="main" flexGrow={1} maxW="container.xl" mx="auto" p={4} w="full"> {/* Use Box as "main", flexGrow={1} */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

            {/* Job Postings */}
            <Route path="/jobs" element={<ProtectedRoute><JobPostingsListPage /></ProtectedRoute>} />
            <Route path="/jobs/new" element={<ProtectedRoute allowedRoles={['entrepreneur']}><CreateJobPostingPage /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobPostingDetailPage /></ProtectedRoute>} />

            {/* Achievements */}
            <Route path="/achievements" element={<ProtectedRoute><AchievementsListPage /></ProtectedRoute>} />
            <Route path="/achievements/new" element={<ProtectedRoute allowedRoles={['entrepreneur']}><CreateAchievementPage /></ProtectedRoute>} />

            {/* Community Section */}
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/community/entrepreneurs" element={<ProtectedRoute><EntrepreneurSearchPage /></ProtectedRoute>} />
            <Route path="/community/feed" element={<ProtectedRoute><CommunityFeedPage /></ProtectedRoute>} />


            {/* Home/Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Box> {/* End of main content Box */}

        <Footer />
      </Flex> {/* End of Flex container */}
    </Router>
  );
}

export default App;