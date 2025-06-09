import React from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Import Chakra UI components
import {
  Box,
  Flex,
  Text,
  Button,
  Link,
  Image // <-- Import Image component
} from '@chakra-ui/react';

// Import your custom logo image
import MyCustomLogo from '../assets/logo_vc2.png';

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

  return (
    <Box bg="blue.600" p="4" color="white" shadow="md">
      <Flex maxW="container.xl" mx="auto" justify="space-between" align="center">
        {/* Logo and Brand Name */}
        <Flex align="center" gap="3"> {/* Adjust gap as needed */}
          <Link as={ReactRouterLink} to="/dashboard" _hover={{ textDecoration: 'none' }}>
            <Flex align="center" gap="3">
              {/* Logo Image with background handling */}
              <Box bg="white" p="1" borderRadius="md" lineHeight="0">
                <Image
                  src={MyCustomLogo}
                  alt="VentureConnect Logo"
                  boxSize="32px" 
                  objectFit="cover" 
                />
              </Box>
              <Text fontSize="2xl" fontWeight="bold" color="white" _hover={{ color: "gray.200" }}>
                VentureConnect
              </Text>
            </Flex>
          </Link>
        </Flex>

        {/* Navigation Links */}
        <Flex gap="4" align="center">
          {currentUser ? (
            <>
              <Link as={ReactRouterLink} to="/jobs" _hover={{ color: "gray.200" }}>Jobs</Link>
              <Link as={ReactRouterLink} to="/achievements" _hover={{ color: "gray.200" }}>Achievements</Link>
              {/* Add Meetups/Journeys links here */}
              <Link as={ReactRouterLink} to="/profile" _hover={{ color: "gray.200" }}>Profile</Link>
              <Button
                onClick={handleLogout}
                colorScheme="red"
                variant="solid"
                px="4"
                py="2"
                borderRadius="full"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link as={ReactRouterLink} to="/login" _hover={{ color: "gray.200" }}>Login</Link>
              <Link as={ReactRouterLink} to="/signup" _hover={{ color: "gray.200" }}>Sign Up</Link>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default Navbar;