import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Tag,
  Flex,
  Card,
  CardHeader,
  CardBody,
  HStack,
  useToast
} from '@chakra-ui/react';

function JobPostingsListPage() {
  const [jobPosts, setJobPosts] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, userProfile } = useAuth();
  const toast = useToast();

  useEffect(() => {
    // This listener fetches all job postings in real-time
    const q = query(collection(db, 'job_posts'), orderBy('postedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobPosts(posts);
      setLoadingJobs(false);
    }, (err) => {
      console.error("Error fetching job posts:", err);
      setError("Failed to load job postings.");
      setLoadingJobs(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []); // Run only once on component mount

  // Main loading state for the page
  if (loadingJobs) {
    return <LoadingSpinner />;
  }

  // Error state for the page
  if (error) {
    return <Text color="red.600" textAlign="center" fontSize="lg" mt={8}>{error}</Text>;
  }

  const handleInterestAction = async (jobPost, action) => {
    // Guard clause: Must be logged in
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "You must be logged in to interact with job postings.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    // Guard clause: Must be a 'talent' user
    if (userProfile.role !== 'talent') {
      toast({
        title: "Action Not Allowed",
        description: "Only 'Talent' users can express interest in jobs.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const jobRef = doc(db, 'job_posts', jobPost.id);
    const newStatus = action === 'express' ? 'interested' : 'withdrawn';
    
    // Using dot notation for the field path is safer with variables
    const fieldPath = `interestStatus.${currentUser.uid}`;

    const dataToUpdate = {
      [fieldPath]: {
        status: newStatus,
        timestamp: serverTimestamp(),
        userName: userProfile.name,
        userEmail: currentUser.email,
      }
    };

    // --- START DEBUGGING LOGS ---
    console.log("--- ATTEMPTING FIRESTORE UPDATE ---");
    console.log("Action:", action);
    console.log("Job ID:", jobPost.id);
    console.log("User ID:", currentUser.uid);
    console.log("Firestore Field Path:", fieldPath);
    console.log("Data to be sent:", dataToUpdate);
    // --- END DEBUGGING LOGS ---

    try {
      await updateDoc(jobRef, dataToUpdate);

      // This log will ONLY appear if the request to Firebase succeeds
      console.log("--- FIRESTORE UPDATE SUCCEEDED ---");

      toast({
        title: `Action Successful!`,
        description: `You have successfully ${newStatus === 'interested' ? 'expressed interest' : 'withdrawn'}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      // This block will run if Firebase returns a permissions error.
      // It will NOT run for a client-side block like ERR_BLOCKED_BY_CLIENT.
      console.error('--- FIRESTORE UPDATE FAILED ---');
      console.error('Error object:', err);
      toast({
        title: "Action Failed",
        description: err.message, // This will show the actual Firebase error message
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl" color="gray.800">Job Postings</Heading>
        {userProfile && userProfile.role === 'entrepreneur' && (
          <Link to="/jobs/new">
            <Button colorScheme="blue">Post a New Job</Button>
          </Link>
        )}
      </Flex>

      {jobPosts.length === 0 ? (
        <Text color="gray.600" fontSize="lg" textAlign="center" mt={8}>No job postings available yet.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {jobPosts.map((post) => {
            // Determine the current logged-in user's interest status for this specific post
            const userInterest = post.interestStatus?.[currentUser?.uid];
            // Check if the user's status is 'interested'
            const isInterestExpressed = userInterest?.status === 'interested';

            // Calculate the total number of 'interested' users for the public count
            const interestCount = post.interestStatus
              ? Object.values(post.interestStatus).filter(s => s.status === 'interested').length
              : 0;

            return (
              <Card key={post.id} bg="gray.50" shadow="sm" border="1px" borderColor="gray.200" display="flex" flexDirection="column" justifyContent="space-between">
                <CardHeader pb={2}>
                  <Heading size="md" color="gray.800" noOfLines={2}>{post.jobTitle}</Heading>
                  <Text fontSize="sm" color="gray.600">Posted by: {post.postedByName || 'Anonymous Entrepreneur'}</Text>
                  <Text fontSize="xs" color="gray.500">{post.postedAt?.toDate().toLocaleDateString()}</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <Text noOfLines={3} color="gray.700" mb={3}>{post.description}</Text>
                  {post.requiredSkills && post.requiredSkills.length > 0 && (
                    <Box mb={3}>
                      <Text fontWeight="semibold" color="gray.800" fontSize="sm" mb={1}>Skills:</Text>
                      <HStack flexWrap="wrap">
                        {post.requiredSkills.map((skill, i) => (
                          <Tag key={i} colorScheme="blue" size="sm">{skill}</Tag>
                        ))}
                      </HStack>
                    </Box>
                  )}
                  {post.payRange && (
                    <Text fontSize="sm" color="gray.700" mb={3}><Text as="span" fontWeight="semibold">Pay Range:</Text> {post.payRange}</Text>
                  )}
                  <HStack spacing={2} mb={4}>
                      <Tag size="sm" colorScheme="blue">
                          <Text as="span" fontWeight="bold">Interested: </Text> {interestCount}
                      </Tag>
                      {post.status && <Tag size="sm" colorScheme={post.status === 'open' ? 'green' : 'red'}>{post.status}</Tag>}
                  </HStack>
                </CardBody>
                <Flex p={4} pt={0} gap={2} mt="auto">
                  <Link to={`/jobs/${post.id}`} style={{ flexGrow: 1 }}>
                    <Button size="sm" variant="outline" colorScheme="blue" width="full">View Details</Button>
                  </Link>
                  {userProfile?.role === 'talent' && (
                    <>
                      {isInterestExpressed ? (
                        <Button
                          onClick={() => handleInterestAction(post, 'withdraw')}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          width="full"
                        >
                          Withdraw Interest
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleInterestAction(post, 'express')}
                          colorScheme="green"
                          size="sm"
                          width="full"
                        >
                          Express Interest
                        </Button>
                      )}
                    </>
                  )}
                </Flex>
              </Card>
            )
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default JobPostingsListPage;