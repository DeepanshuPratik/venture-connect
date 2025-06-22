import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { db } from '../../firebase/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';

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
  useDisclosure,
  Avatar,
  Link as ChakraLink,
  useToast,
  Divider,
} from '@chakra-ui/react';

function DashboardPage() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const [myJobPostings, setMyJobPostings] = useState([]);
  const [myAchievements, setMyAchievements] = useState([]);
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [interestedTalentDetails, setInterestedTalentDetails] = useState([]);
  const [isFetchingInterestedDetails, setIsFetchingInterestedDetails] = useState(false);
  
  // Use separate loading states for each data type for robust UI
  const [jobsLoading, setJobsLoading] = useState(true);
  const [achievementsLoading, setAchievementsLoading] = useState(true);

  // Effect to fetch all entrepreneur-specific data in real-time
  useEffect(() => {
    // Guard clause: Only run if auth is done and user is a logged-in entrepreneur
    if (authLoading || !currentUser || userProfile?.role !== 'entrepreneur') {
      setJobsLoading(false);
      setAchievementsLoading(false);
      return;
    }

    // --- Set up listener for Job Postings ---
    const jobsQuery = query(
      collection(db, 'job_posts'),
      where('postedBy', '==', currentUser.uid),
      orderBy('postedAt', 'desc')
    );
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      setMyJobPostings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setJobsLoading(false);
    }, (error) => {
      console.error("Error fetching job postings:", error);
      toast({ title: "Error", description: "Could not load job postings. Ensure Firestore index is created.", status: "error" });
      setJobsLoading(false);
    });

    // --- Set up listener for Achievement Posts ---
    const achievementsQuery = query(
      collection(db, 'achievements'),
      where('postedBy', '==', currentUser.uid),
      orderBy('postedAt', 'desc')
    );
    const unsubscribeAchievements = onSnapshot(achievementsQuery, (snapshot) => {
      setMyAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAchievementsLoading(false);
    }, (error) => {
      console.error("Error fetching achievements:", error);
      toast({ title: "Error", description: "Could not load achievements. Ensure Firestore index is created.", status: "error" });
      setAchievementsLoading(false);
    });

    // Return a cleanup function to unsubscribe from both listeners when the component unmounts
    return () => {
      unsubscribeJobs();
      unsubscribeAchievements();
    };
  }, [authLoading, currentUser, userProfile, toast]);

  // Function to view interested talent in a modal
  const handleViewInterested = async (jobPost) => {
    setSelectedJobForModal(jobPost);
    setIsFetchingInterestedDetails(true);
    setInterestedTalentDetails([]);
    onOpen();

    try {
      if (jobPost.interestedUsers && jobPost.interestedUsers.length > 0) {
        const talentPromises = jobPost.interestedUsers.map(uid => getDoc(doc(db, 'users', uid)));
        const userDocs = await Promise.all(talentPromises);
        const fetchedTalent = userDocs
          .filter(docSnap => docSnap.exists())
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setInterestedTalentDetails(fetchedTalent);
      }
    } catch (err) {
      console.error("Error fetching interested talent details:", err);
      toast({ title: "Error", description: "Could not fetch talent details.", status: "error" });
    } finally {
      setIsFetchingInterestedDetails(false);
    }
  };

  // Function to delete an achievement post
  const handleDeleteAchievement = async (achievementId) => {
    if (window.confirm("Are you sure you want to delete this achievement post? This action cannot be undone.")) {
        try {
            await deleteDoc(doc(db, "achievements", achievementId));
            toast({
                title: "Post Deleted",
                description: "Your achievement post has been successfully deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error deleting achievement: ", error);
            toast({
                title: "Error",
                description: "Failed to delete the post. Please try again.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
    }
  };

  // Main loading spinner for initial auth check
  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box maxW="container.xl" mx="auto" px={6} py={8} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="2xl" mb={6}>Welcome, {userProfile?.name}!</Heading>

      {/* --- Quick Links Section --- */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={10}>
        <Card bg="blue.50" variant="outline" borderColor="blue.200">
          <CardHeader><Heading size="md" color="blue.700">Your Profile</Heading></CardHeader>
          <CardBody>
            <Text color="gray.600">Keep your profile updated for better connections.</Text>
            <Button mt={4} colorScheme="blue" onClick={() => navigate('/profile')}>View My Profile</Button>
          </CardBody>
        </Card>

        {userProfile?.role === 'entrepreneur' ? (
          <>
            <Card bg="green.50" variant="outline" borderColor="green.200">
              <CardHeader><Heading size="md" color="green.700">Post a Job</Heading></CardHeader>
              <CardBody>
                <Text color="gray.600">Find the perfect talent for your startup.</Text>
                <Button mt={4} colorScheme="green" onClick={() => navigate('/jobs/new')}>Create Job Post</Button>
              </CardBody>
            </Card>
            <Card bg="purple.50" variant="outline" borderColor="purple.200">
              <CardHeader><Heading size="md" color="purple.700">Share an Achievement</Heading></CardHeader>
              <CardBody>
                <Text color="gray.600">Celebrate your startup's milestones.</Text>
                <Button mt={4} colorScheme="purple" onClick={() => navigate('/achievements/new')}>Post Achievement</Button>
              </CardBody>
            </Card>
          </>
        ) : (
          <Card bg="indigo.50" variant="outline" borderColor="indigo.200">
            <CardHeader><Heading size="md" color="indigo.700">Find Startup Jobs</Heading></CardHeader>
            <CardBody>
              <Text color="gray.600">Explore exciting opportunities from innovative startups.</Text>
              <Button mt={4} colorScheme="indigo" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>

      {/* --- Entrepreneur's Actionable Dashboard Section --- */}
      {userProfile?.role === 'entrepreneur' && (
        <VStack spacing={10} align="stretch">
          {/* My Job Postings Section */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>My Job Postings</Heading>
            {jobsLoading ? <LoadingSpinner /> : myJobPostings.length === 0 ? (
              <Text color="gray.600">You haven't posted any jobs yet.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {myJobPostings.map((job) => (
                  <Card key={job.id} variant="outline" shadow="sm">
                    <CardHeader pb={2}><Heading size="md" noOfLines={1}>{job.jobTitle}</Heading></CardHeader>
                    <CardBody pt={0}>
                      <HStack spacing={2} mb={4}>
                        <Tag size="sm" colorScheme="blue">Interested: {job.interestedUsers?.length || 0}</Tag>
                        {job.status && <Tag size="sm" colorScheme={job.status === 'open' ? 'green' : 'red'}>{job.status}</Tag>}
                      </HStack>
                      <Flex justify="space-between" align="center">
                        <Button size="sm" colorScheme="teal" onClick={() => handleViewInterested(job)} isDisabled={!job.interestedUsers?.length}>View Interested</Button>
                        <ChakraLink as={Link} to={`/jobs/${job.id}`}><Button size="sm" variant="ghost" colorScheme="gray">View Post</Button></ChakraLink>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Box>

          <Divider />

          {/* My Achievements Section */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>My Achievements</Heading>
            {achievementsLoading ? <LoadingSpinner /> : myAchievements.length === 0 ? (
              <Text color="gray.600">You haven't posted any achievements yet.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {myAchievements.map((achievement) => (
                  <Card key={achievement.id} variant="outline" shadow="sm">
                    <CardHeader pb={2}><Heading size="md" noOfLines={1}>{achievement.title}</Heading></CardHeader>
                    <CardBody pt={0}>
                      <Text noOfLines={3} fontSize="sm" color="gray.600" mb={4} minH="60px">{achievement.description}</Text>
                      <HStack justify="flex-end" spacing={2}>
                        <Button onClick={() => handleDeleteAchievement(achievement.id)} size="sm" colorScheme="red" variant="ghost">Delete</Button>
                        <ChakraLink as={Link} to={`/achievements/edit/${achievement.id}`}><Button size="sm" colorScheme="blue">Edit</Button></ChakraLink>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Box>
        </VStack>
      )}

      {/* Modal for Interested Talent */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Interested Talent for "{selectedJobForModal?.jobTitle}"</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isFetchingInterestedDetails ? (
              <Flex justify="center" py={10}><LoadingSpinner /></Flex>
            ) : interestedTalentDetails.length === 0 ? (
              <Text textAlign="center" py={4} color="gray.600">No one has expressed interest yet.</Text>
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
                            {talent.skills.slice(0, 3).map((skill, i) => (
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