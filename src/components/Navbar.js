import React from "react";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import {
  Box,
  Flex,
  Text,
  Button,
  Link,
  Image,
  useTheme,
} from "@chakra-ui/react";

import MyCustomLogo from "../assets/logo_vc2.png";

function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      alert("Failed to log out: " + error.message);
    }
  };

  const navbarHeight = "64px";

  return (
    <Box
      bg="gray.800"
      py="3"
      px="4"
      color="white"
      position="fixed"
      top="0"
      width="100%"
      zIndex="10"
      height={navbarHeight}
      boxShadow="0 4px 12px -2px rgba(66, 153, 225, 0.6)"
    >
      <Flex
        maxW="container.xl"
        mx="auto"
        justify="space-between"
        align="center"
        h="100%"
      >
        {/* Logo and Brand Name */}
        <Flex align="center" gap="3">
          <Link
            as={ReactRouterLink}
            to="/dashboard"
            _hover={{ textDecoration: "none" }}
          >
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
                to="/dashboard"
                _hover={{ color: "blue.300", textDecoration: "none" }}
                fontWeight="medium"
              >
                Dashboard
              </Link>
              <Link
                as={ReactRouterLink}
                to="/jobs"
                _hover={{ color: "blue.300", textDecoration: "none" }}
                fontWeight="medium"
              >
                Jobs
              </Link>
              {/* This Achievements link now goes to the page for *your* achievements/creation */}
              <Link
                as={ReactRouterLink}
                to="/achievements"
                _hover={{ color: "blue.300", textDecoration: "none" }}
                fontWeight="medium"
              >
                Achievements
              </Link>

              {/* NEW: Community Hub Main Link */}
              <Link
                as={ReactRouterLink}
                to="/community" // This links to the CommunityPage hub
                _hover={{ color: "blue.300", textDecoration: "none" }}
                fontWeight="medium"
              >
                Community
              </Link>

              <Link
                as={ReactRouterLink}
                to="/profile"
                _hover={{ color: "blue.300", textDecoration: "none" }}
                fontWeight="medium"
              >
                Profile
              </Link>
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
                _hover={{ color: "blue.300", textDecoration: "none" }}
                fontWeight="medium"
              >
                Login
              </Link>
              <Link
                as={ReactRouterLink}
                to="/signup"
                _hover={{ color: "blue.300", textDecoration: "none" }}
                fontWeight="medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default Navbar;
