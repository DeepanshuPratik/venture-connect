import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { db } from '../../firebase/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

// Import Chakra UI components (no change)
import {
  Box,
  Text,
  VStack,
  Flex,
  Heading,
  Divider,
  Tag,
  TagLabel,
  Link as ChakraLink,
  Button,
  useToast,
  Avatar
} from '@chakra-ui/react';

// --- Helper Functions (no change) ---
const formatDate = (dateValue) => {
  if (!dateValue) return 'Present';
  const date = dateValue instanceof Timestamp ? dateValue.toDate() : new Date(dateValue);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

const calculateDuration = (startDateValue, endDateValue, isCurrent) => {
  if (!startDateValue) return '';
  const start = startDateValue instanceof Timestamp ? startDateValue.toDate() : new Date(startDateValue);
  const end = isCurrent ? new Date() : (endDateValue instanceof Timestamp ? endDateValue.toDate() : new Date(endDateValue));
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (months < 0 || (months === 0 && end.getDate() < start.getDate())) {
    years--;
    months += 12;
  }
  if (years > 0 && months > 0) return `(${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''})`;
  if (years > 0) return `(${years} year${years > 1 ? 's' : ''})`;
  if (months > 0) return `(${months} month${months > 1 ? 's' : ''})`;
  return '(Less than a month)';
};

const isProvided = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

// --- Main Component ---
function MyProfilePage() {
  // --- FIX 1: Get 'currentUser' from context, not 'loggedInUserProfile'
  const { currentUser, loading: authLoading } = useAuth();
  const { id: userIdFromParams } = useParams();
  const toast = useToast();

  const [profileToDisplay, setProfileToDisplay] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // --- FIX 2: A robust useEffect that always fetches fresh data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      setPageLoading(true);

      // Determine the user ID to fetch. Use the URL param first, then the logged-in user's ID.
      const idToFetch = userIdFromParams || currentUser?.uid;

      // If no ID is available (e.g., logged out), stop and clear the profile.
      if (!idToFetch) {
        setPageLoading(false);
        setProfileToDisplay(null);
        return;
      }

      try {
        // Fetch the document from Firestore using the determined ID.
        const userDocRef = doc(db, 'users', idToFetch);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // If the document exists, set it to state.
          setProfileToDisplay({ id: userDocSnap.id, ...userDocSnap.data() });
        } else {
          // If no document is found, show an error.
          toast({
            title: "Profile Not Found",
            description: "The user profile document does not exist in the database.",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
          setProfileToDisplay(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({ title: "Error", description: "Could not fetch the user profile.", status: "error" });
        setProfileToDisplay(null);
      } finally {
        setPageLoading(false);
      }
    };

    // Only run the fetch logic after the initial authentication check is complete.
    if (!authLoading) {
      fetchProfile();
    }
  }, [userIdFromParams, currentUser, authLoading, toast]); // Dependencies are correct

  if (pageLoading || authLoading) {
    return <LoadingSpinner />;
  }

  if (!profileToDisplay) {
    return (
      <Box maxW="3xl" mx="auto" p={6} textAlign="center">
        <Heading>Profile Not Available</Heading>
        <Text mt={4}>This user's profile could not be loaded or does not exist.</Text>
        <Link to="/dashboard">
          <Button mt={6} colorScheme="blue">Go to Dashboard</Button>
        </Link>
      </Box>
    );
  }

  // --- FIX 3: Make the 'isOwnProfile' check more reliable
  const isOwnProfile = currentUser?.uid === profileToDisplay.id;

  const sortedWorkExperiences = [...(profileToDisplay.workExperiences || [])].sort((a, b) => {
    const dateA = a.startDate ? (a.startDate.toDate ? a.startDate.toDate() : new Date(a.startDate)) : new Date(0);
    const dateB = b.startDate ? (b.startDate.toDate ? b.startDate.toDate() : new Date(b.startDate)) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  // The rest of your component's JSX is perfectly fine and requires no changes.
  const hasAnyEntrepreneurDetail =
    isProvided(profileToDisplay.startupName) ||
    isProvided(profileToDisplay.startupTagline) ||
    isProvided(profileToDisplay.startupIndustry) ||
    isProvided(profileToDisplay.startupWebsite) ||
    isProvided(profileToDisplay.startupVision) ||
    isProvided(profileToDisplay.startupStage);

  const hasAnyTalentDetail =
    isProvided(profileToDisplay.skills) ||
    isProvided(profileToDisplay.portfolioLink) ||
    isProvided(profileToDisplay.resumeLink);

  return (
    <Box maxW="3xl" mx="auto" px={6} py={8} bg="white" rounded="lg" shadow="md">
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" mb={8}>
        <Flex align="center" mb={{ base: 4, md: 0 }}>
          <Avatar size="2xl" name={profileToDisplay.name} src={profileToDisplay.photoURL} mr={6} />
          <VStack align={{ base: 'center', md: 'flex-start' }}>
            <Heading as="h1" size="xl" color="gray.800">
              {profileToDisplay.name}
            </Heading>
            {isProvided(profileToDisplay.role) && <Text fontSize="lg" color="gray.500" textTransform="capitalize">{profileToDisplay.role}</Text>}
          </VStack>
        </Flex>
        {isOwnProfile && (
          <ChakraLink as={Link} to="/profile/edit">
            <Button colorScheme="blue">Edit Profile</Button>
          </ChakraLink>
        )}
      </Flex>
      {/* ... rest of your JSX ... */}
      <VStack spacing={6} align="stretch">
        {/* Basic Info */}
        <Box>
          <Heading size="md" mb={3}>Basic Information</Heading>
          {isProvided(profileToDisplay.name) && <Text mb={1}><Text as="strong" color="gray.800">Name:</Text> {profileToDisplay.name}</Text>}
          {isProvided(profileToDisplay.email) && <Text mb={1}><Text as="strong" color="gray.800">Email:</Text> {profileToDisplay.email}</Text>}
          {isProvided(profileToDisplay.role) && <Text mb={1}><Text as="strong" color="gray.800">Role:</Text> <Text as="span" textTransform="capitalize">{profileToDisplay.role}</Text></Text>}
          {isProvided(profileToDisplay.bio) && <Text mb={1}><Text as="strong" color="gray.800">Bio:</Text> {profileToDisplay.bio}</Text>}
        </Box>
        <Divider />

        {/* --- Role-specific sections --- */}
        {profileToDisplay.role === 'entrepreneur' ? (
          <>
            <Box>
              <Heading size="md" mb={3}>Running Startup</Heading>
              {isProvided(profileToDisplay.startupName) && <Text mb={1}><Text as="strong" color="gray.800">Startup Name:</Text> {profileToDisplay.startupName}</Text>}
              {isProvided(profileToDisplay.startupTagline) && <Text mb={1}><Text as="strong" color="gray.800">Tagline:</Text> {profileToDisplay.startupTagline}</Text>}
              {isProvided(profileToDisplay.startupIndustry) && <Text mb={1}><Text as="strong" color="gray.800">Industry:</Text> {profileToDisplay.startupIndustry}</Text>}
              {isProvided(profileToDisplay.startupWebsite) && (
                <Text mb={1}>
                  <Text as="strong" color="gray.800">Website:</Text>
                  <ChakraLink href={profileToDisplay.startupWebsite} isExternal color="blue.500" ml={1}>
                    {profileToDisplay.startupWebsite}
                  </ChakraLink>
                </Text>
              )}
              {isProvided(profileToDisplay.startupVision) && <Text mb={1}><Text as="strong" color="gray.800">Vision:</Text> {profileToDisplay.startupVision}</Text>}
              {isProvided(profileToDisplay.startupStage) && <Text mb={1}><Text as="strong" color="gray.800">Stage:</Text> {profileToDisplay.startupStage}</Text>}
              {!hasAnyEntrepreneurDetail && <Text color="gray.500">No startup details provided yet.</Text>}
            </Box>
            <Divider />
            <Box>
              <Heading size="md" mb={3}>Previous Work History</Heading>
              {sortedWorkExperiences.length === 0 ? (
                <Text color="gray.500">No previous work experiences added yet.</Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {sortedWorkExperiences.map((exp) => (
                    <Box key={exp.id} p={4} borderWidth="1px" borderRadius="lg" shadow="sm">
                      <Text fontSize="lg" fontWeight="semibold" mb={1}>{exp.jobTitle}</Text>
                      <Text fontSize="md" color="gray.600" mb={1}>{exp.companyName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate) || (exp.isCurrent ? 'Present' : '')} {calculateDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                      </Text>
                      {isProvided(exp.description) && <Text mt={2} fontSize="sm">{exp.description}</Text>}
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </>
        ) : ( // User is 'talent'
          <>
            <Box>
              <Heading size="md" mb={3}>Work History / Startup Experience</Heading>
              {sortedWorkExperiences.length === 0 ? (
                <Text color="gray.500">No work experiences added yet.</Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {sortedWorkExperiences.map((exp) => (
                    <Box key={exp.id} p={4} borderWidth="1px" borderRadius="lg" shadow="sm">
                      <Text fontSize="lg" fontWeight="semibold" mb={1}>{exp.jobTitle}</Text>
                      <Text fontSize="md" color="gray.600" mb={1}>{exp.companyName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate) || (exp.isCurrent ? 'Present' : '')} {calculateDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                      </Text>
                      {isProvided(exp.description) && <Text mt={2} fontSize="sm">{exp.description}</Text>}
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
            <Divider />
            <Box>
              <Heading size="md" mb={3}>Skills & Portfolio</Heading>
              {isProvided(profileToDisplay.skills) ? (
                <Flex wrap="wrap" gap={2} mb={2}>
                  {profileToDisplay.skills.map((skill, i) => (
                    <Tag key={i} size="md" variant="solid" colorScheme="green">
                      <TagLabel>{skill}</TagLabel>
                    </Tag>
                  ))}
                </Flex>
              ) : (
                <Text color="gray.500">No skills provided.</Text>
              )}

              {isProvided(profileToDisplay.portfolioLink) && (
                <Text mb={1}><Text as="strong" color="gray.800">Portfolio Link:</Text> <ChakraLink href={profileToDisplay.portfolioLink} isExternal color="blue.500">{profileToDisplay.portfolioLink}</ChakraLink></Text>
              )}
              {isProvided(profileToDisplay.resumeLink) && (
                <Text mb={1}><Text as="strong" color="gray.800">Resume Link:</Text> <ChakraLink href={profileToDisplay.resumeLink} isExternal color="blue.500">{profileToDisplay.resumeLink}</ChakraLink></Text>
              )}
              {!hasAnyTalentDetail && <Text color="gray.500">No skills or portfolio links provided yet.</Text>}
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
}

export default MyProfilePage;