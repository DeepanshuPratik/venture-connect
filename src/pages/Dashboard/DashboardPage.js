import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Box,
  Heading,
  Text,
  Button,
  Grid,
  GridItem,
  Link,
  Card,
  CardHeader,
  CardBody,
  VStack,
  Icon
} from '@chakra-ui/react';
import { FaUserEdit, FaBriefcase, FaTrophy, FaUsers } from 'react-icons/fa'; // Import icons

function DashboardPage() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return <LoadingSpinner />;
  }

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={6}>
        Welcome, {userProfile.name}!
      </Heading>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        {/* Quick Links / CTAs */}
        <Card bg="blue.50" border="1px" borderColor="blue.200" shadow="sm">
          <CardHeader>
            <Heading size="md" color="blue.700" display="flex" alignItems="center" gap={2}>
              <Icon as={FaUserEdit} /> Your Profile
            </Heading>
          </CardHeader>
          <CardBody>
            <Text color="gray.600" mb={4}>Keep your profile updated for better connections.</Text>
            <Link as={ReactRouterLink} to="/profile/edit" _hover={{ textDecoration: 'none' }}>
              <Button colorScheme="blue" size="sm" borderRadius="full">
                Edit Profile
              </Button>
            </Link>
          </CardBody>
        </Card>

        {userProfile.role === 'entrepreneur' ? (
          <>
            <Card bg="green.50" border="1px" borderColor="green.200" shadow="sm">
              <CardHeader>
                <Heading size="md" color="green.700" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaBriefcase} /> Post a Job
                </Heading>
              </CardHeader>
              <CardBody>
                <Text color="gray.600" mb={4}>Find the perfect talent for your startup.</Text>
                <Link as={ReactRouterLink} to="/jobs/new" _hover={{ textDecoration: 'none' }}>
                  <Button colorScheme="green" size="sm" borderRadius="full">
                    Create Job Post
                  </Button>
                </Link>
              </CardBody>
            </Card>
            <Card bg="purple.50" border="1px" borderColor="purple.200" shadow="sm">
              <CardHeader>
                <Heading size="md" color="purple.700" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaTrophy} /> Share an Achievement
                </Heading>
              </CardHeader>
              <CardBody>
                <Text color="gray.600" mb={4}>Celebrate your startup's milestones with the community!</Text>
                <Link as={ReactRouterLink} to="/achievements/new" _hover={{ textDecoration: 'none' }}>
                  <Button colorScheme="purple" size="sm" borderRadius="full">
                    Post Achievement
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </>
        ) : (
          <Card bg="indigo.50" border="1px" borderColor="indigo.200" shadow="sm">
            <CardHeader>
              <Heading size="md" color="indigo.700" display="flex" alignItems="center" gap={2}>
                <Icon as={FaBriefcase} /> Find Startup Jobs
              </Heading>
            </CardHeader>
            <CardBody>
              <Text color="gray.600" mb={4}>Explore exciting opportunities from innovative startups.</Text>
              <Link as={ReactRouterLink} to="/jobs" _hover={{ textDecoration: 'none' }}>
                <Button colorScheme="indigo" size="sm" borderRadius="full">
                  Browse Jobs
                </Button>
              </Link>
            </CardBody>
          </Card>
        )}
         <Card bg="yellow.50" border="1px" borderColor="yellow.200" shadow="sm">
          <CardHeader>
            <Heading size="md" color="yellow.700" display="flex" alignItems="center" gap={2}>
              <Icon as={FaUsers} /> Community Updates
            </Heading>
          </CardHeader>
          <CardBody>
            <Text color="gray.600" mb={4}>See latest achievements and meetups.</Text>
            <Link as={ReactRouterLink} to="/achievements" _hover={{ textDecoration: 'none' }}>
              <Button colorScheme="yellow" size="sm" borderRadius="full">
                View All
              </Button>
            </Link>
          </CardBody>
        </Card>
      </Grid>

      <Box mt={10}>
        <Heading as="h2" size="lg" color="gray.800" mb={4}>Recent Activity</Heading>
        <Box bg="gray.50" p={6} rounded="lg" border="1px" borderColor="gray.200" color="gray.600">
          <Text>This section will show a feed of recent job postings, achievements, and meetups relevant to you.</Text>
          <Text mt={2} fontSize="sm">
            (Coming soon: Personalized feed, recommended jobs/profiles)
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardPage;
