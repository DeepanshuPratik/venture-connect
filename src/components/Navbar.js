import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import {
  Box,
  Flex,
  Text,
  Button,
  Link,
  Image,
  useTheme
} from '@chakra-ui/react';

import MyCustomLogo from '../assets/logo_vc2.png';

function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [scrolled, setScrolled] = useState(false); // New state to track scroll position

  // Effect to add and remove scroll listener
  useEffect(() => {
    const handleScroll = () => {
      // Set 'scrolled' to true if scroll position is beyond 50px
      // This threshold can be adjusted
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert('Failed to log out: ' + error.message);
    }
  };

  const navbarHeight = "64px";

  return (
    <Box
      // Base styles for the Navbar
      py="3"
      px="4"
      color="white"
      position="fixed"
      top="0"
      width="100%"
      zIndex="10"
      height={navbarHeight}
      // Conditional styles for glass effect on scroll
      bg={scrolled ? "rgba(8, 88, 199, 0.8)" : "blue.600"} // Transparent dark blue (blue.800 equivalent) or solid blue.600
      backdropFilter={scrolled ? "blur(8px)" : "none"} // The glass blur effect
      shadow={scrolled ? "xl" : "md"} // More prominent shadow when scrolled
      transition="all 0.3s ease-in-out" // Smooth transition for all properties
    >
      <Flex maxW="container.xl" mx="auto" justify="space-between" align="center" h="100%">
        {/* Logo and Brand Name */}
        <Flex align="center" gap="3">
          <Link as={ReactRouterLink} to="/dashboard" _hover={{ textDecoration: 'none' }}>
            <Flex align="center" gap="3">
              <Box bg="white" p="1" borderRadius="md" lineHeight="0">
                <Image
                  src={MyCustomLogo}
                  alt="VentureConnect Logo"
                  boxSize="36px"
                  objectFit="contain"
                />
              </Box>
              <Text fontSize="xl" fontWeight="extrabold" color="white">
                VentureConnect
              </Text>
            </Flex>
          </Link>
        </Flex>

        {/* Navigation Links */}
        <Flex gap="5" align="center">
          {currentUser ? (
            <>
              <Link
                as={ReactRouterLink}
                to="/jobs"
                _hover={{ color: "teal.200", textDecoration: 'none' }}
                fontWeight="medium"
              >Jobs</Link>
              <Link
                as={ReactRouterLink}
                to="/achievements"
                _hover={{ color: "teal.200", textDecoration: 'none' }}
                fontWeight="medium"
              >Achievements</Link>
              <Link
                as={ReactRouterLink}
                to="/profile"
                _hover={{ color: "teal.200", textDecoration: 'none' }}
                fontWeight="medium"
              >Profile</Link>
              <Button
                onClick={handleLogout}
                colorScheme="red"
                variant="solid"
                size="sm"
                px="4"
                py="2"
                borderRadius="full"
                _hover={{ bg: "red.700" }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                as={ReactRouterLink}
                to="/login"
                _hover={{ color: "teal.200", textDecoration: 'none' }}
                fontWeight="medium"
              >Login</Link>
              <Link
                as={ReactRouterLink}
                to="/signup"
                _hover={{ color: "teal.200", textDecoration: 'none' }}
                fontWeight="medium"
              >Sign Up</Link>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default Navbar;