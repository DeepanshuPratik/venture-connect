import React from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Box,
  Flex,
  Text,
  Button,
  Link,
  Spacer,
  useColorModeValue,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaRocket, FaBars, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaBriefcase, FaTrophy, FaUsers, FaUserCircle } from 'react-icons/fa';

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

  const isMobile = useBreakpointValue({ base: true, md: false });

  // --- Theme Colors for Futuristic Navbar (main bar) ---
  const bgColor = useColorModeValue('rgba(20, 20, 40, 0.8)', 'rgba(10, 10, 20, 0.9)');
  const borderColor = useColorModeValue('blue.700', 'purple.600');
  const linkColor = useColorModeValue('gray.200', 'gray.300');
  const hoverLinkColor = useColorModeValue('blue.300', 'cyan.300');
  const brandColor = useColorModeValue('blue.200', 'cyan.200');
  const brandHoverColor = useColorModeValue('blue.400', 'cyan.400');

  // --- Colors for Mobile Menu Dropdown (White Background, Black Text) ---
  // These define the base colors for the MenuList
  const menuBgColor = useColorModeValue('white', 'gray.100'); // White/Light Gray background for the menu list
  const menuTextColor = useColorModeValue('gray.800', 'gray.700'); // Dark text color for menu items

  // These define the desired "active" look for menu items (which will now be default)
  const menuItemDefaultBg = useColorModeValue('blue.50', 'blue.100'); // Light blue/gray for default background
  const menuItemDefaultColor = useColorModeValue('blue.700', 'blue.800'); // Darker blue for default text

  // Active state for when the item is pressed/tapped
  const menuItemActiveBg = useColorModeValue('blue.100', 'blue.200'); // Slightly darker active state
  const menuLogoutDefaultColor = useColorModeValue('red.600', 'red.500'); // Standard red for logout text
  const menuLogoutHoverColor = useColorModeValue('red.700', 'red.600'); // Darker red text on hover for logout

  return (
    <Box
      bg={bgColor}
      p={4}
      color={linkColor}
      shadow="lg"
      position="sticky"
      top="0"
      zIndex="banner"
      width="full"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor={borderColor}
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
          transition="all 0.3s ease-in-out"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <FaRocket />
          <Text display={{ base: 'none', sm: 'block' }}>VentureConnect</Text>
        </Link>

        {/* Desktop Navigation (hidden on mobile) */}
        <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
          {currentUser ? (
            <>
              <Link
                as={ReactRouterLink} to="/jobs"
                _hover={{ textDecoration: 'none', color: hoverLinkColor, transform: 'translateY(-2px)' }} transition="all 0.2s ease-in-out"
              >Jobs</Link>
              <Link
                as={ReactRouterLink} to="/achievements"
                _hover={{ textDecoration: 'none', color: hoverLinkColor, transform: 'translateY(-2px)' }} transition="all 0.2s ease-in-out"
              >Achievements</Link>
              <Link
                as={ReactRouterLink} to="/community"
                _hover={{ textDecoration: 'none', color: hoverLinkColor, transform: 'translateY(-2px)' }} transition="all 0.2s ease-in-out"
              >Community</Link>
              <Link
                as={ReactRouterLink} to="/profile"
                _hover={{ textDecoration: 'none', color: hoverLinkColor, transform: 'translateY(-2px)' }} transition="all 0.2s ease-in-out"
              >Profile</Link>
              <Button
                onClick={handleLogout}
                colorScheme="red" size="sm" borderRadius="full"
                _hover={{ bg: 'red.500', transform: 'scale(1.05)', shadow: 'lg' }} transition="all 0.2s ease-in-out"
              >Logout</Button>
            </>
          ) : (
            <>
              <Link
                as={ReactRouterLink} to="/login"
                _hover={{ textDecoration: 'none', color: hoverLinkColor, transform: 'translateY(-2px)' }} transition="all 0.2s ease-in-out"
              >Login</Link>
              <Button
                as={ReactRouterLink} to="/signup"
                colorScheme="blue" size="sm" borderRadius="full"
                _hover={{ bg: 'blue.500', transform: 'scale(1.05)', shadow: 'lg' }} transition="all 0.2s ease-in-out"
              >Sign Up</Button>
            </>
          )}
        </HStack>

        {/* Mobile Navigation (hamburger menu, hidden on desktop) */}
        <Box display={{ base: 'block', md: 'none' }}>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<FaBars />}
              variant="outline"
              color={linkColor}
              borderColor={borderColor}
              _hover={{ bg: 'rgba(255,255,255,0.1)', color: hoverLinkColor }}
              _active={{ bg: 'rgba(255,255,255,0.2)' }}
            />
            <MenuList
              bg={menuBgColor}
              borderColor={borderColor}
              color={menuTextColor}
              shadow="xl"
              py={2}
              borderRadius="md"
              boxShadow="0 0 10px rgba(0, 100, 255, 0.3)"
            >
              {currentUser ? (
                <>
                  <MenuItem
                    icon={<FaBriefcase />}
                    onClick={() => navigate('/jobs')}
                    bg={menuItemDefaultBg} // Default background is now the hover background
                    color={menuItemDefaultColor} // Default text color is now the hover text color
                    _hover={{ bg: menuItemDefaultBg, color: menuItemDefaultColor }} // Hover is same as default
                    _active={{ bg: menuItemActiveBg, color: menuItemDefaultColor }} // Active is slightly darker
                  >Jobs</MenuItem>
                  <MenuItem
                    icon={<FaTrophy />}
                    onClick={() => navigate('/achievements')}
                    bg={menuItemDefaultBg}
                    color={menuItemDefaultColor}
                    _hover={{ bg: menuItemDefaultBg, color: menuItemDefaultColor }}
                    _active={{ bg: menuItemActiveBg, color: menuItemDefaultColor }}
                  >Achievements</MenuItem>
                  <MenuItem
                    icon={<FaUsers />}
                    onClick={() => navigate('/community')}
                    bg={menuItemDefaultBg}
                    color={menuItemDefaultColor}
                    _hover={{ bg: menuItemDefaultBg, color: menuItemDefaultColor }}
                    _active={{ bg: menuItemActiveBg, color: menuItemDefaultColor }}
                  >Community</MenuItem>
                  <MenuItem
                    icon={<FaUserCircle />}
                    onClick={() => navigate('/profile')}
                    bg={menuItemDefaultBg}
                    color={menuItemDefaultColor}
                    _hover={{ bg: menuItemDefaultBg, color: menuItemDefaultColor }}
                    _active={{ bg: menuItemActiveBg, color: menuItemDefaultColor }}
                  >Profile</MenuItem>
                  <MenuItem
                    icon={<FaSignOutAlt />}
                    onClick={handleLogout}
                    bg={menuItemDefaultBg} // Default background
                    color={menuLogoutDefaultColor} // Specific logout color
                    _hover={{ bg: menuItemDefaultBg, color: menuLogoutHoverColor }} // Darker red text on hover
                    _active={{ bg: menuItemActiveBg, color: menuLogoutHoverColor }} // Active state
                  >Logout</MenuItem>
                </>
              ) : (
                <>
                  <MenuItem
                    icon={<FaSignInAlt />}
                    onClick={() => navigate('/login')}
                    bg={menuItemDefaultBg}
                    color={menuItemDefaultColor}
                    _hover={{ bg: menuItemDefaultBg, color: menuItemDefaultColor }}
                    _active={{ bg: menuItemActiveBg, color: menuItemDefaultColor }}
                  >Login</MenuItem>
                  <MenuItem
                    icon={<FaUserPlus />}
                    onClick={() => navigate('/signup')}
                    bg={menuItemDefaultBg}
                    color={menuItemDefaultColor}
                    _hover={{ bg: menuItemDefaultBg, color: menuItemDefaultColor }}
                    _active={{ bg: menuItemActiveBg, color: menuItemDefaultColor }}
                  >Sign Up</MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>
  );
}

export default Navbar;