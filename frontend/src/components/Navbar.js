import React from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import {
  Box,
  Flex,
  Text,
  Button,
  Link,
  Image,
  useDisclosure,
  useBreakpointValue,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  VStack,
  HStack, // Import HStack for desktop layout
  CloseButton,
  Divider,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

import MyCustomLogo from '../assets/logo_vc.png';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleLogout = async () => {
    onClose();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert('Failed to log out: ' + error.message);
    }
  };

  const navbarHeight = "64px";

  // --- Links for Authenticated Users (for mobile drawer) ---
  const MobileNavLinks = () => (
    <VStack as="nav" spacing={6} align="stretch" w="full" pt={4}>
      <Link as={ReactRouterLink} to="/dashboard" onClick={onClose} _hover={{ color: "blue.300" }}>Dashboard</Link>
      <Link as={ReactRouterLink} to="/jobs" onClick={onClose} _hover={{ color: "blue.300" }}>Jobs</Link>
      <Link as={ReactRouterLink} to="/community" onClick={onClose} _hover={{ color: "blue.300" }}>Community</Link>
      <Link as={ReactRouterLink} to="/profile" onClick={onClose} _hover={{ color: "blue.300" }}>Profile</Link>
      <Divider borderColor="gray.700" />
      <Button
        onClick={handleLogout}
        colorScheme="red"
        variant="ghost" // Ghost variant for mobile drawer
        w="full"
        _hover={{ bg: "red.900" }}
      >
        Logout
      </Button>
    </VStack>
  );

  // --- Links for Unauthenticated Users (for mobile drawer) ---
  const MobileUnauthenticatedLinks = () => (
     <VStack as="nav" spacing={6} align="stretch" w="full" pt={4}>
        <Link as={ReactRouterLink} to="/login" onClick={onClose} _hover={{ color: "blue.300" }}>Login</Link>
        <Link as={ReactRouterLink} to="/signup" onClick={onClose} _hover={{ color: "blue.300" }}>Sign Up</Link>
     </VStack>
  );

  return (
    <>
      <Box
        bg="gray.800"
        py="3"
        px={{ base: 4, md: 6 }}
        color="white"
        position="fixed"
        top="0"
        width="100%"
        zIndex="10"
        height={navbarHeight}
        boxShadow="0 4px 12px -2px rgba(66, 153, 225, 0.6)"
      >
        <Flex maxW="container.xl" mx="auto" justify="space-between" align="center" h="100%">
          <Link as={ReactRouterLink} to="/dashboard" _hover={{ textDecoration: 'none' }}>
            <Flex align="center" gap="3">
              <Box bg="white" p="1" borderRadius="md" lineHeight="0">
                <Image src={MyCustomLogo} alt="VentureConnect Logo" boxSize="36px" objectFit="contain" />
              </Box>
              <Text fontSize="xl" fontWeight="extrabold" color="white" display={{ base: 'none', sm: 'block' }}>
                VentureConnect
              </Text>
            </Flex>
          </Link>

          {isMobile ? (
            // --- Hamburger Menu on Mobile ---
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              onClick={onOpen}
              variant="ghost"
              color="white"
              _hover={{ bg: "gray.700" }}
            />
          ) : (
            // --- Full, Horizontal Links on Desktop ---
            <HStack as="nav" spacing={5} fontWeight="medium">
              {currentUser ? (
                <>
                  <Link as={ReactRouterLink} to="/dashboard" _hover={{ color: "blue.300", textDecoration: 'none' }}>Dashboard</Link>
                  <Link as={ReactRouterLink} to="/jobs" _hover={{ color: "blue.300", textDecoration: 'none' }}>Jobs</Link>
                  <Link as={ReactRouterLink} to="/community" _hover={{ color: "blue.300", textDecoration: 'none' }}>Community</Link>
                  <Link as={ReactRouterLink} to="/profile" _hover={{ color: "blue.300", textDecoration: 'none' }}>Profile</Link>
                  <Button
                    onClick={handleLogout}
                    colorScheme="red"
                    variant="solid" // Solid variant for desktop
                    size="sm"
                    px="4"
                    borderRadius="full"
                    _hover={{ bg: "red.700" }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link as={ReactRouterLink} to="/login" _hover={{ color: "blue.300", textDecoration: 'none' }}>Login</Link>
                  <Link as={ReactRouterLink} to="/signup" _hover={{ color: "blue.300", textDecoration: 'none' }}>Sign Up</Link>
                </>
              )}
            </HStack>
          )}
        </Flex>
      </Box>

      {/* --- Drawer for Mobile Menu --- */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.800" color="white">
          <DrawerHeader borderBottomWidth="1px" borderColor="gray.700">
            <Flex justify="space-between" align="center">
              <Text>Menu</Text>
              <CloseButton onClick={onClose} />
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            {currentUser ? <MobileNavLinks /> : <MobileUnauthenticatedLinks />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default Navbar;