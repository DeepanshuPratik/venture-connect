import React from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Box,
  Flex,
  Text,
  Button,
  Link, // Chakra UI Link component
  Spacer,
  useColorModeValue, // For potential light/dark mode adaptability
  HStack, // For horizontal stacking with consistent spacing
} from '@chakra-ui/react';
import { FaRocket } from 'react-icons/fa'; // Importing a cool icon for the brand

function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert('Failed to log out: ' + error.message); // Consider Chakra Toast for better UX here
    }
  };

  // Define colors for the futuristic theme
  const bgColor = useColorModeValue('rgba(20, 20, 40, 0.8)', 'rgba(10, 10, 20, 0.9)'); // Dark, slightly transparent
  const borderColor = useColorModeValue('blue.700', 'purple.600'); // Subtle border color
  const linkColor = useColorModeValue('gray.200', 'gray.300');
  const hoverLinkColor = useColorModeValue('blue.300', 'cyan.300');
  const brandColor = useColorModeValue('blue.200', 'cyan.200');
  const brandHoverColor = useColorModeValue('blue.400', 'cyan.400');

  return (
    <Box
      bg={bgColor}
      p={4}
      color={linkColor}
      shadow="lg" // Larger shadow for depth
      position="sticky" // Makes the navbar stick to the top
      top="0"
      zIndex="banner" // Ensures it stays above other content
      width="full"
      backdropFilter="blur(10px)" // Frosted glass effect
      borderBottom="1px solid"
      borderColor={borderColor}
      // Subtle glow effect
      boxShadow="0 0 15px rgba(0, 100, 255, 0.4), 0 0 30px rgba(0, 100, 255, 0.2)"
    >
      <Flex maxW="container.xl" mx="auto" align="center" justify="space-between">
        {/* Brand/Logo Section */}
        <Link
          as={ReactRouterLink}
          to="/dashboard"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color={brandColor}
          _hover={{
            textDecoration: 'none',
            color: brandHoverColor,
          }}
          transition="all 0.3s ease-in-out" // Smooth transition
          display="flex"
          alignItems="center"
          gap={2}
        >
          <FaRocket /> {/* Futuristic Rocket Icon */}
          VentureConnect
        </Link>

        {/* Navigation Links */}
        <HStack spacing={6}> {/* Increased spacing between links */}
          {currentUser ? (
            <>
              <Link
                as={ReactRouterLink}
                to="/jobs"
                _hover={{ textDecoration: 'none', color: hoverLinkColor, transform: 'translateY(-2px)' }}
                transition="all 0.2s ease-in-out"
              >
                Jobs
              </Link>
              <Link
                as={ReactRouterLink}
                to="/achievements"
                _hover={{ textDecoration: 'none', color: hoverLinkColor, transform: 'translateY(-2px)' }}
                transition="all 0.2s ease-in-out"
              >
                Achievements
              </Link>
              <Link
                as={ReactRouterLink}
                to="/community"
                _hover={{ textDecoration: 'none', color: hoverLinkColor, transform: 'translateY(-2px)' }}
                transition="all 0.2s ease-in-out"
              >
                Community
              </Link>
              <Link
                as={ReactRouterLink}
                to="/profile"
                _hover={{ textDecoration: 'none', color: hoverLinkColor, transform: 'translateY(-2px)' }}
                transition="all 0.2s ease-in-out"
              >
                Profile
              </Link>
              <Button
                onClick={handleLogout}
                colorScheme="red"
                size="sm"
                borderRadius="full"
                _hover={{ bg: 'red.500', transform: 'scale(1.05)', shadow: 'lg' }}
                transition="all 0.2s ease-in-out"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                as={ReactRouterLink}
                to="/login"
                _hover={{ textDecoration: 'none', color: hoverLinkColor, transform: 'translateY(-2px)' }}
                transition="all 0.2s ease-in-out"
              >
                Login
              </Link>
              <Button
                as={ReactRouterLink} // Use Button for Sign Up to make it stand out
                to="/signup"
                colorScheme="blue"
                size="sm"
                borderRadius="full"
                _hover={{ bg: 'blue.500', transform: 'scale(1.05)', shadow: 'lg' }}
                transition="all 0.2s ease-in-out"
              >
                Sign Up
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}

export default Navbar;