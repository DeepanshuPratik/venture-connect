import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';

// Import Chakra UI components
import {
  Box,
  Text,
  VStack,
  Flex,
  Heading,
  Divider,
  Tag,
  TagLabel,
  Stack,
  Link as ChakraLink,
  Button
} from '@chakra-ui/react';

// Helper to format dates for display and calculation (no change)
const formatDate = (dateValue) => {
  if (!dateValue) return 'Present';
  const date = dateValue instanceof Date ? dateValue : dateValue.toDate(); // Handle both Date objects and Firestore Timestamps
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

const calculateDuration = (startDateValue, endDateValue, isCurrent) => {
  if (!startDateValue) return '';

  const start = startDateValue instanceof Date ? startDateValue : startDateValue.toDate();
  const end = isCurrent ? new Date() : (endDateValue instanceof Date ? endDateValue : endDateValue.toDate());

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return ''; // Invalid date
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0 || (months === 0 && end.getDate() < start.getDate())) {
    years--;
    months += 12;
  }

  if (years > 0 && months > 0) {
    return `(${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''})`;
  } else if (years > 0) {
    return `(${years} year${years > 1 ? 's' : ''})`;
  } else if (months > 0) {
    return `(${months} month${months > 1 ? 's' : ''})`;
  } else {
    return '(Less than a month)';
  }
};


function MyProfilePage() {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return <LoadingSpinner />;
  }

  const sortedWorkExperiences = [...(userProfile.workExperiences || [])].sort((a, b) => {
    const dateA = a.startDate ? (a.startDate.toDate ? a.startDate.toDate() : new Date(a.startDate)) : new Date(0);
    const dateB = b.startDate ? (b.startDate.toDate ? b.startDate.toDate() : new Date(b.startDate)) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  // Helper function to check if a value is "not provided" (empty string, null, undefined, or empty array)
  const isProvided = (value) => {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };

  const hasAnyEntrepreneurDetail =
    isProvided(userProfile.startupName) ||
    isProvided(userProfile.startupTagline) ||
    isProvided(userProfile.startupIndustry) ||
    isProvided(userProfile.startupWebsite) ||
    isProvided(userProfile.startupVision) ||
    isProvided(userProfile.startupStage);

  const hasAnyTalentDetail =
    isProvided(userProfile.skills) ||
    isProvided(userProfile.portfolioLink) ||
    isProvided(userProfile.resumeLink);

  return (
    <Box maxW="3xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="4xl" fontWeight="bold" color="gray.800">My Profile</Text>
        <ChakraLink as={Link} to="/profile/edit">
          <Button colorScheme="blue">Edit Profile</Button>
        </ChakraLink>
      </Flex>

      <VStack spacing={6} align="stretch">
        {/* Basic Info */}
        <Box>
          <Heading size="md" mb={3}>Basic Information</Heading>
          {isProvided(userProfile.name) && <Text mb={1}><Text as="strong" color="gray.800">Name:</Text> {userProfile.name}</Text>}
          {isProvided(userProfile.email) && <Text mb={1}><Text as="strong" color="gray.800">Email:</Text> {userProfile.email}</Text>}
          {isProvided(userProfile.role) && <Text mb={1}><Text as="strong" color="gray.800">Role:</Text> <Text as="span" textTransform="capitalize">{userProfile.role}</Text></Text>}
          {isProvided(userProfile.bio) && <Text mb={1}><Text as="strong" color="gray.800">Bio:</Text> {userProfile.bio}</Text>}
          {
            !isProvided(userProfile.name) && !isProvided(userProfile.email) &&
            !isProvided(userProfile.role) && !isProvided(userProfile.bio) &&
            <Text color="gray.500">No basic information provided yet.</Text>
          }
        </Box>
        <Divider />

        {/* --- Role-specific sections --- */}
        {userProfile.role === 'entrepreneur' ? (
          <>
            <Box>
              <Heading size="md" mb={3}>My Running Startup</Heading>
              {isProvided(userProfile.startupName) && <Text mb={1}><Text as="strong" color="gray.800">Startup Name:</Text> {userProfile.startupName}</Text>}
              {isProvided(userProfile.startupTagline) && <Text mb={1}><Text as="strong" color="gray.800">Tagline:</Text> {userProfile.startupTagline}</Text>}
              {isProvided(userProfile.startupIndustry) && <Text mb={1}><Text as="strong" color="gray.800">Industry:</Text> {userProfile.startupIndustry}</Text>}
              {isProvided(userProfile.startupWebsite) && (
                <Text mb={1}>
                  <Text as="strong" color="gray.800">Website:</Text>
                  <ChakraLink href={userProfile.startupWebsite} isExternal color="blue.500" ml={1}>
                    {userProfile.startupWebsite}
                  </ChakraLink>
                </Text>
              )}
              {isProvided(userProfile.startupVision) && <Text mb={1}><Text as="strong" color="gray.800">Vision:</Text> {userProfile.startupVision}</Text>}
              {isProvided(userProfile.startupStage) && <Text mb={1}><Text as="strong" color="gray.800">Stage:</Text> {userProfile.startupStage}</Text>}
              {
                !hasAnyEntrepreneurDetail &&
                <Text color="gray.500">No startup details provided yet. <ChakraLink as={Link} to="/profile/edit" color="blue.500">Add them now!</ChakraLink></Text>
              }
            </Box>
            <Divider />

            <Box>
              <Heading size="md" mb={3}>Previous Work History</Heading>
              {sortedWorkExperiences.length === 0 ? (
                <Text color="gray.500">No previous work experiences added yet. <ChakraLink as={Link} to="/profile/edit" color="blue.500">Add some!</ChakraLink></Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {sortedWorkExperiences.map((exp) => (
                    <Box key={exp.id} p={4} borderWidth="1px" borderRadius="lg" shadow="sm">
                      <Text fontSize="lg" fontWeight="semibold" mb={1}>{exp.jobTitle}</Text>
                      <Text fontSize="md" color="gray.600" mb={1}>{exp.companyName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate) || (exp.isCurrent ? 'Present' : '')} {calculateDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                      </Text>
                      {exp.description && (
                        <Text mt={2} fontSize="sm">{exp.description}</Text>
                      )}
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
                <Text color="gray.500">No work experiences added yet. <ChakraLink as={Link} to="/profile/edit" color="blue.500">Add some!</ChakraLink></Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {sortedWorkExperiences.map((exp) => (
                    <Box key={exp.id} p={4} borderWidth="1px" borderRadius="lg" shadow="sm">
                      <Text fontSize="lg" fontWeight="semibold" mb={1}>{exp.jobTitle}</Text>
                      <Text fontSize="md" color="gray.600" mb={1}>{exp.companyName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate) || (exp.isCurrent ? 'Present' : '')} {calculateDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                      </Text>
                      {exp.description && (
                        <Text mt={2} fontSize="sm">{exp.description}</Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
            <Divider />

            <Box>
              <Heading size="md" mb={3}>Skills & Portfolio</Heading>
              {isProvided(userProfile.skills) ? (
                <Flex wrap="wrap" gap={2} mb={2}>
                  {userProfile.skills.map((skill, i) => (
                    <Tag key={i} size="md" variant="solid" colorScheme="green">
                      <TagLabel>{skill}</TagLabel>
                    </Tag>
                  ))}
                </Flex>
              ) : (
                <Text color="gray.500">No skills provided.</Text>
              )}

              {isProvided(userProfile.portfolioLink) && (
                <Text mb={1}><Text as="strong" color="gray.800">Portfolio Link:</Text> <ChakraLink href={userProfile.portfolioLink} isExternal color="blue.500">{userProfile.portfolioLink}</ChakraLink></Text>
              )}
              {isProvided(userProfile.resumeLink) && (
                <Text mb={1}><Text as="strong" color="gray.800">Resume Link:</Text> <ChakraLink href={userProfile.resumeLink} isExternal color="blue.500">{userProfile.resumeLink}</ChakraLink></Text>
              )}
              {
                  !hasAnyTalentDetail &&
                  <Text color="gray.500">No skills or portfolio links provided yet. <ChakraLink as={Link} to="/profile/edit" color="blue.500">Add them now!</ChakraLink></Text>
              }
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
}

export default MyProfilePage;