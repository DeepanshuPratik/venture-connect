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
  Button,
  Link as ChakraLink // Alias Link to avoid conflict with React Router Link
} from '@chakra-ui/react';

// Helper to format dates for display and calculation
const formatDate = (dateString) => {
  if (!dateString) return 'Present';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

const calculateDuration = (startDate, endDate, isCurrent) => {
  if (!startDate) return '';

  const start = new Date(startDate);
  const end = isCurrent ? new Date() : new Date(endDate);

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

  // Sort experiences by start date (most recent first) for display
  const sortedWorkExperiences = [...(userProfile.workExperiences || [])].sort((a, b) => {
    const dateA = a.startDate ? a.startDate.toDate() : new Date(0);
    const dateB = b.startDate ? b.startDate.toDate() : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });


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
          <Text mb={1}><Text as="strong" color="gray.800">Name:</Text> {userProfile.name}</Text>
          <Text mb={1}><Text as="strong" color="gray.800">Email:</Text> {userProfile.email}</Text>
          <Text mb={1}><Text as="strong" color="gray.800">Role:</Text> <Text as="span" textTransform="capitalize">{userProfile.role}</Text></Text>
          <Text mb={1}><Text as="strong" color="gray.800">Bio:</Text> {userProfile.bio || 'Not provided'}</Text>
        </Box>
        <Divider />

        {/* --- Work History Section --- */}
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
                    {formatDate(exp.startDate?.toDate ? exp.startDate.toDate() : exp.startDate)} - {formatDate(exp.endDate?.toDate ? exp.endDate.toDate() : exp.endDate) || (exp.isCurrent ? 'Present' : '')} {calculateDuration(exp.startDate?.toDate ? exp.startDate.toDate() : exp.startDate, exp.endDate?.toDate ? exp.endDate.toDate() : exp.endDate, exp.isCurrent)}
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

        {/* Role-specific info */}
        {userProfile.role === 'entrepreneur' && (
          <Box>
            <Heading size="md" mb={3}>Startup Details</Heading>
            <Text mb={1}><Text as="strong" color="gray.800">Startup Vision:</Text> {userProfile.startupVision || 'Not provided'}</Text>
            <Text mb={1}><Text as="strong" color="gray.800">Startup Stage:</Text> {userProfile.startupStage || 'Not set'}</Text>
          </Box>
        )}
        {userProfile.role === 'talent' && (
          <Box>
            <Heading size="md" mb={3}>Skills & Portfolio</Heading>
            {userProfile.skills && userProfile.skills.length > 0 ? (
              <Flex wrap="wrap" gap={2} mb={2}>
                {userProfile.skills.map((skill, i) => (
                  <Tag key={i} size="md" variant="solid" colorScheme="green">
                    <TagLabel>{skill}</TagLabel>
                  </Tag>
                ))}
              </Flex>
            ) : (
              <Text color="gray.500" mb={2}>No skills provided.</Text>
            )}

            <Text mb={1}><Text as="strong" color="gray.800">Portfolio Link:</Text> {userProfile.portfolioLink ? <ChakraLink href={userProfile.portfolioLink} isExternal color="blue.500">{userProfile.portfolioLink}</ChakraLink> : 'Not provided'}</Text>
            <Text mb={1}><Text as="strong" color="gray.800">Resume Link:</Text> {userProfile.resumeLink ? <ChakraLink href={userProfile.resumeLink} isExternal color="blue.500">{userProfile.resumeLink}</ChakraLink> : 'Not provided'}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default MyProfilePage;