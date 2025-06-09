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
  Flex,
  GridItem,
  VStack,
  HStack,
  Tag,
  Link
} from '@chakra-ui/react';

function MyProfilePage() {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return <LoadingSpinner />;
  }

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={6}>My Profile</Heading>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
        {/* Basic Info */}
        <VStack align="flex-start" spacing={3}>
          <Heading as="h2" size="md" color="gray.700">Basic Information</Heading>
          <Text><Text as="strong" color="gray.800">Name:</Text> {userProfile.name}</Text>
          <Text><Text as="strong" color="gray.800">Email:</Text> {userProfile.email}</Text>
          <Text><Text as="strong" color="gray.800">Role:</Text> <Tag colorScheme={userProfile.role === 'entrepreneur' ? 'purple' : 'blue'} textTransform="capitalize">{userProfile.role}</Tag></Text>
          <Text><Text as="strong" color="gray.800">Bio:</Text> {userProfile.bio || 'Not provided'}</Text>
          <Text><Text as="strong" color="gray.800">Previous Track:</Text> {userProfile.previousTrack && userProfile.previousTrack.length > 0 ? userProfile.previousTrack.join(', ') : 'Not provided'}</Text>
        </VStack>

        {/* Role-specific info */}
        {userProfile.role === 'entrepreneur' && (
          <VStack align="flex-start" spacing={3}>
            <Heading as="h2" size="md" color="gray.700">Startup Details</Heading>
            <Text><Text as="strong" color="gray.800">Startup Vision:</Text> {userProfile.startupVision || 'Not provided'}</Text>
            <Text><Text as="strong" color="gray.800">Startup Stage:</Text> <Tag colorScheme="teal">{userProfile.startupStage || 'Not set'}</Tag></Text>
          </VStack>
        )}

        {userProfile.role === 'talent' && (
          <VStack align="flex-start" spacing={3}>
            <Heading as="h2" size="md" color="gray.700">Skills & Portfolio</Heading>
            <Text><Text as="strong" color="gray.800">Skills:</Text></Text>
            <HStack flexWrap="wrap">
              {userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills.map((skill, i) => (
                <Tag key={i} colorScheme="cyan">{skill}</Tag>
              )) : <Text>Not provided</Text>}
            </HStack>
            <Text>
                <Text as="strong" color="gray.800">Portfolio Link:</Text>{' '}
                {userProfile.portfolioLink ? (
                    <Link href={userProfile.portfolioLink} isExternal color="blue.500">
                        {userProfile.portfolioLink}
                    </Link>
                ) : (
                    'Not provided'
                )}
            </Text>
            <Text>
                <Text as="strong" color="gray.800">Resume Link:</Text>{' '}
                {userProfile.resumeLink ? (
                    <Link href={userProfile.resumeLink} isExternal color="blue.500">
                        {userProfile.resumeLink}
                    </Link>
                ) : (
                    'Not provided'
                )}
            </Text>
          </VStack>
        )}
      </Grid>

      <Flex justify="flex-end" mt={8}>
        <Link as={ReactRouterLink} to="/profile/edit" _hover={{ textDecoration: 'none' }}>
          <Button colorScheme="blue" size="md" borderRadius="full">
            Edit Profile
          </Button>
        </Link>
      </Flex>
    </Box>
  );
}

export default MyProfilePage;
