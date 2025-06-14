import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';import LoadingSpinner from '../../components/LoadingSpinner';
import { db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  VStack,
  HStack,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure, // For modal control
  Avatar,
  Link as ChakraLink
} from '@chakra-ui/react';

function DashboardPage() {
  const { currentUser, userProfile, loading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal for interested talent

  const [myJobPostings, setMyJobPostings] = useState([]);
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [interestedTalentDetails, setInterestedTalentDetails] = useState([]);
  const [isFetchingInterestedDetails, setIsFetchingInterestedDetails] = useState(false);
  const [jobPostsLoading, setJobPostsLoading] = useState(true);
  const [jobPostsError, setJobPostsError] = useState(null);


  useEffect(() => {
    // Only fetch job postings if user is an entrepreneur and is logged in
    if (userProfile?.role === 'entrepreneur' && currentUser) {
      const q = query(collection(db, 'job_posts'), where('postedBy', '==', currentUser.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyJobPostings(posts);
        setJobPostsLoading(false);
      }, (err) => {
        console.error("Error fetching entrepreneur's job posts:", err);
        setJobPostsError("Failed to load your job postings.");
        setJobPostsLoading(false);
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    } else {
      setJobPostsLoading(false); // Not an entrepreneur, or not logged in, so no jobs to load
    }
  }, [userProfile, currentUser]); // Rerun if userProfile or currentUser changes


  // Function to handle opening the modal and fetching interested talent details
  const handleViewInterested = async (jobPost) => {
    setSelectedJobForModal(jobPost);
    setIsFetchingInterestedDetails(true);
    setInterestedTalentDetails([]); // Clear previous details

    try {
      if (jobPost.interestedUsers && jobPost.interestedUsers.length > 0) {
        const talentPromises = jobPost.interestedUsers.map(async (uid) => {
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);
          return userDocSnap.exists() ? { id: userDocSnap.id, ...userDocSnap.data() } : null;
        });
        const fetchedTalent = await Promise.all(talentPromises);
        setInterestedTalentDetails(fetchedTalent.filter(Boolean)); // Filter out any nulls
      }
    } catch (err) {
      console.error("Error fetching interested talent details:", err);
      // You might want to show a toast/alert here
    } finally {
      setIsFetchingInterestedDetails(false);
      onOpen(); // Open the modal after data is (or isn't) fetched
    }
  };


  if (loading || jobPostsLoading) {
    return <LoadingSpinner />;
  }

  if (jobPostsError) {
    return <Text color="red.600" textAlign="center" fontSize="lg" mt={8}>{jobPostsError}</Text>;
  }

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome, {userProfile.name}!</h1>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={8}>
        {/* Quick Links / CTAs */}
        <Box bg="blue.50" p={6} rounded="lg" shadow="sm" border="1px" borderColor="blue.200">
          <Heading size="md" color="blue.700" mb={3}>Your Profile</Heading>
          <Text color="gray.600" mb={4}>Keep your profile updated for better connections.</Text>
          <Link to="/profile/edit">
            <Button colorScheme="blue">Edit Profile</Button>
          </Link>
        </Box>

        {userProfile.role === 'entrepreneur' ? (
          <>
            <Box bg="green.50" p={6} rounded="lg" shadow="sm" border="1px" borderColor="green.200">
              <Heading size="md" color="green.700" mb={3}>Post a Job</Heading>
              <Text color="gray.600" mb={4}>Find the perfect talent for your startup.</Text>
              <Link to="/jobs/new">
                <Button colorScheme="green">Create Job Post</Button>
              </Link>
            </Box>
            <Box bg="purple.50" p={6} rounded="lg" shadow="sm" border="1px" borderColor="purple.200">
              <Heading size="md" color="purple.700" mb={3}>Share an Achievement</Heading>
              <Text color="gray.600" mb={4}>Celebrate your startup's milestones with the community!</Text>
              <Link to="/achievements/new">
                <Button colorScheme="purple">Post Achievement</Button>
              </Link>
            </Box>
          </>
        ) : (
          <Box bg="indigo.50" p={6} rounded="lg" shadow="sm" border="1px" borderColor="indigo.200">
            <Heading size="md" color="indigo.700" mb={3}>Find Startup Jobs</Heading>
            <Text color="gray.600" mb={4}>Explore exciting opportunities from innovative startups.</Text>
            <Link to="/jobs">
              <Button colorScheme="indigo">Browse Jobs</Button>
            </Link>
          </Box>
        )}
        <Box bg="yellow.50" p={6} rounded="lg" shadow="sm" border="1px" borderColor="yellow.200">
          <Heading size="md" color="yellow.700" mb={3}>Community Updates</Heading>
          <Text color="gray.600" mb={4}>See latest achievements and meetups.</Text>
          <Link to="/community/feed">
            <Button colorScheme="yellow">View Community Feed</Button>
          </Link>
        </Box>
      </SimpleGrid>

      {/* --- Entrepreneur's Job Postings Tracking Section --- */}
      {userProfile.role === 'entrepreneur' && (
        <Box mt={10}>
          <Heading as="h2" size="lg" mb={4}>My Job Postings</Heading>
          {myJobPostings.length === 0 ? (
            <Text color="gray.600">You haven't posted any jobs yet. <Link to="/jobs/new" style={{ color: 'blue.500', textDecoration: 'underline' }}>Post your first job!</Link></Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {myJobPostings.map((job) => (
                <Card key={job.id} bg="white" shadow="md" border="1px" borderColor="gray.200">
                  <CardHeader pb={2}>
                    <Heading size="md">{job.jobTitle}</Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <Text noOfLines={2} fontSize="sm" color="gray.600" mb={2}>{job.description}</Text>
                    <HStack spacing={2} mb={4}>
                      <Tag size="sm" colorScheme="blue">
                        <Text as="span" fontWeight="bold">Interested: </Text> {job.interestedUsers?.length || 0}
                      </Tag>
                      {job.status && <Tag size="sm" colorScheme={job.status === 'open' ? 'green' : 'red'}>{job.status}</Tag>}
                    </HStack>
                    <Flex justify="space-between" align="center">
                      <Link to={`/jobs/${job.id}`}>
                        <Button size="sm" variant="outline" colorScheme="blue">View Details</Button>
                      </Link>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        onClick={() => handleViewInterested(job)}
                        isLoading={selectedJobForModal?.id === job.id && isFetchingInterestedDetails}
                        isDisabled={job.interestedUsers?.length === 0}
                      >
                        {job.interestedUsers?.length === 0 ? 'No Interests Yet' : 'View Interested Talent'}
                      </Button>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>
      )}

      {/* Modal for Interested Talent */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Interested Talent for "{selectedJobForModal?.jobTitle}"</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isFetchingInterestedDetails ? (
              <LoadingSpinner />
            ) : interestedTalentDetails.length === 0 ? (
              <Text textAlign="center" py={4} color="gray.600">No talent has expressed interest in this job yet.</Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {interestedTalentDetails.map((talent) => (
                  <Flex key={talent.id} p={3} borderWidth="1px" borderColor="gray.200" borderRadius="md" align="center" justify="space-between">
                    <HStack spacing={3}>
                      <Avatar name={talent.name} size="md" />
                      <VStack align="flex-start" spacing={0}>
                        <Text fontWeight="bold">{talent.name}</Text>
                        <Text fontSize="sm" color="gray.600">{talent.email}</Text>
                        {talent.skills && talent.skills.length > 0 && (
                          <HStack flexWrap="wrap" mt={1}>
                            {talent.skills.map((skill, i) => (
                              <Tag key={i} size="sm" colorScheme="cyan">{skill}</Tag>
                            ))}
                          </HStack>
                        )}
                      </VStack>
                    </HStack>
                    <ChakraLink as={Link} to={`/profile/${talent.id}`} _hover={{ textDecoration: 'none' }}>
                      <Button size="sm" colorScheme="blue" variant="outline">View Profile</Button>
                    </ChakraLink>
                  </Flex>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default DashboardPage;