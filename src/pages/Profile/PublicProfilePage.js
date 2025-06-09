import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Box,
  Heading,
  Text,
  Grid,
  VStack,
  HStack,
  Tag,
  Alert,
  AlertIcon,
  Link,
} from '@chakra-ui/react';

function PublicProfilePage() {
  const { userId } = useParams(); // Get the user ID from the URL
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setError('User profile not found.');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]); // Re-fetch if userId changes

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <VStack minH="calc(100vh - 160px)" justify="center" align="center">
        <Alert status="error" borderRadius="md" maxWidth="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      </VStack>
    );
  }

  if (!profile) {
    return (
      <VStack minH="calc(100vh - 160px)" justify="center" align="center">
        <Text color="gray.600" fontSize="lg">No profile data available.</Text>
      </VStack>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={6}>
        {profile.name}'s Profile
      </Heading>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
        {/* Basic Info */}
        <VStack align="flex-start" spacing={3}>
          <Heading as="h2" size="md" color="gray.700">Basic Information</Heading>
          <Text><Text as="strong" color="gray.800">Name:</Text> {profile.name}</Text>
          <Text><Text as="strong" color="gray.800">Email:</Text> {profile.email}</Text>
          <Text><Text as="strong" color="gray.800">Role:</Text> <Tag colorScheme={profile.role === 'entrepreneur' ? 'purple' : 'blue'} textTransform="capitalize">{profile.role}</Tag></Text>
          <Text><Text as="strong" color="gray.800">Bio:</Text> {profile.bio || 'Not provided'}</Text>
          <Text><Text as="strong" color="gray.800">Previous Track:</Text> {profile.previousTrack && profile.previousTrack.length > 0 ? profile.previousTrack.join(', ') : 'Not provided'}</Text>
        </VStack>

        {/* Role-specific info */}
        {profile.role === 'entrepreneur' && (
          <VStack align="flex-start" spacing={3}>
            <Heading as="h2" size="md" color="gray.700">Startup Details</Heading>
            <Text><Text as="strong" color="gray.800">Startup Vision:</Text> {profile.startupVision || 'Not provided'}</Text>
            <Text><Text as="strong" color="gray.800">Startup Stage:</Text> <Tag colorScheme="teal">{profile.startupStage || 'Not set'}</Tag></Text>
            {profile.startupType && (
                <Text><Text as="strong" color="gray.800">Startup Type:</Text> <Tag colorScheme="orange">{profile.startupType}</Tag></Text>
            )}
          </VStack>
        )}

        {profile.role === 'talent' && (
          <VStack align="flex-start" spacing={3}>
            <Heading as="h2" size="md" color="gray.700">Skills & Portfolio</Heading>
            <Text><Text as="strong" color="gray.800">Skills:</Text></Text>
            <HStack flexWrap="wrap">
              {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill, i) => (
                <Tag key={i} colorScheme="cyan">{skill}</Tag>
              )) : <Text>Not provided</Text>}
            </HStack>
            <Text>
                <Text as="strong" color="gray.800">Portfolio Link:</Text>{' '}
                {profile.portfolioLink ? (
                    <Link href={profile.portfolioLink} isExternal color="blue.500">
                        {profile.portfolioLink}
                    </Link>
                ) : (
                    'Not provided'
                )}
            </Text>
            <Text>
                <Text as="strong" color="gray.800">Resume Link:</Text>{' '}
                {profile.resumeLink ? (
                    <Link href={profile.resumeLink} isExternal color="blue.500">
                        {profile.resumeLink}
                    </Link>
                ) : (
                    'Not provided'
                )}
            </Text>
          </VStack>
        )}
      </Grid>
    </Box>
  );
}

export default PublicProfilePage;