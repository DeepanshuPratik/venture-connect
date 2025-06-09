import React from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, Flex, Text, Button, Link, Spacer, useColorModeValue } from '@chakra-ui/react';

function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert('Failed to log out: ' + error.message);
    }
  };

  const bgColor = useColorModeValue('blue.600', 'blue.800');
  const textColor = useColorModeValue('white', 'gray.100');

  return (
    <Box bg={bgColor} p={4} color={textColor} shadow="md">
      <Flex maxW="container.xl" mx="auto" align="center">
        <Link as={ReactRouterLink} to="/dashboard" fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" _hover={{ textDecoration: 'none', color: 'gray.200' }}>
          VentureConnect
        </Link>
        <Spacer />
        <Flex gap={4} align="center">
          {currentUser ? (
            <>
              <Link as={ReactRouterLink} to="/jobs" _hover={{ textDecoration: 'none', color: 'gray.200' }}>Jobs</Link>
              <Link as={ReactRouterLink} to="/achievements" _hover={{ textDecoration: 'none', color: 'gray.200' }}>Achievements</Link>
              <Link as={ReactRouterLink} to="/community" _hover={{ textDecoration: 'none', color: 'gray.200' }}>Community</Link> {/* NEW LINK */}
              <Link as={ReactRouterLink} to="/profile" _hover={{ textDecoration: 'none', color: 'gray.200' }}>Profile</Link>
              <Button
                onClick={handleLogout}
                colorScheme="red"
                size="sm"
                borderRadius="full"
                _hover={{ bg: 'red.500' }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link as={ReactRouterLink} to="/login" _hover={{ textDecoration: 'none', color: 'gray.200' }}>Login</Link>
              <Link as={ReactRouterLink} to="/signup" _hover={{ textDecoration: 'none', color: 'gray.200' }}>Sign Up</Link>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default Navbar;