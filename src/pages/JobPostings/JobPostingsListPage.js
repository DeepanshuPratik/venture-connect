import React, { useState, useEffect } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  VStack,
  HStack,
  Tag,
  Link,
  Flex,
  Spacer,
  useToast
} from '@chakra-ui/react';

function JobPostingsListPage() {
  const [jobPosts, setJobPosts] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, userProfile } = useAuth();
  const [interestedJobIds, setInterestedJobIds] = useState(new Set());
  const toast = useToast();

  useEffect(() => {
    if (!currentUser) {
      setLoadingJobs(false);
      return;
    }

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

    // Fetch user's expressed interests
    const fetchUserInterests = async () => {
        if (currentUser && userProfile?.role === 'talent') {
            const userInterestsRef = doc(db, 'users', currentUser.uid);
            const userInterestsSnap = await getDoc(userInterestsRef);
            if (userInterestsSnap.exists() && userInterestsSnap.data().interestedJobs) {
                setInterestedJobIds(new Set(userInterestsSnap.data().interestedJobs));
            }
        }
    };
    fetchUserInterests();

    return () => unsubscribe();
  }, [currentUser, userProfile]);

  if (loadingJobs) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Text color="red.600" textAlign="center" fontSize="lg" mt={8}>{error}</Text>;
  }

  const handleShowInterest = async (jobId) => {
    if (!currentUser || userProfile.role !== 'talent') {
      toast({
        title: "Action Restricted",
        description: "You must be logged in as Talent to show interest.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      // Add user's UID to job post's interestedUsers array
      const jobRef = doc(db, 'job_posts', jobId);
      await updateDoc(jobRef, {
        interestedUsers: arrayUnion(currentUser.uid)
      });

      // Add job ID to user's interestedJobs array (optional, for talent's own tracking)
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        interestedJobs: arrayUnion(jobId)
      });
      setInterestedJobIds(prev => new Set(prev).add(jobId)); // Update local state

      toast({
        title: "Interest Expressed!",
        description: "The entrepreneur has been notified of your interest.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error showing interest:', err);
      toast({
        title: "Failed to Express Interest.",
        description: "Please try again later.",
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
          <Link as={ReactRouterLink} to="/jobs/new" _hover={{ textDecoration: 'none' }}>
            <Button colorScheme="blue" size="md" borderRadius="full">
              Post a New Job
            </Button>
          </Link>
        )}
      </Flex>

      {jobPosts.length === 0 ? (
        <Text color="gray.600" fontSize="lg" textAlign="center" mt={8}>No job postings available yet.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {jobPosts.map((post) => (
            <Card key={post.id} bg="gray.50" shadow="sm" border="1px" borderColor="gray.200" display="flex" flexDirection="column" justifyContent="space-between">
              <CardHeader pb={2}>
                <Heading size="md" color="gray.800">{post.jobTitle}</Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>Posted by: {post.postedByName || 'Anonymous Entrepreneur'}</Text>
              </CardHeader>
              <CardBody pt={0}>
                <Text noOfLines={3} color="gray.700" mb={3}>{post.description}</Text>
                {post.requiredSkills && post.requiredSkills.length > 0 && (
                  <Box mb={3}>
                    <Text fontWeight="semibold" color="gray.800" mb={1}>Skills:</Text>
                    <HStack flexWrap="wrap">
                      {post.requiredSkills.map((skill, i) => (
                        <Tag key={i} colorScheme="blue" size="sm">{skill}</Tag>
                      ))}
                    </HStack>
                  </Box>
                )}
                {post.payRange && (
                  <Text color="gray.700"><Text as="strong" color="gray.800">Pay Range:</Text> {post.payRange}</Text>
                )}
              </CardBody>
              <CardFooter pt={0}>
                <Flex width="full" direction={{ base: 'column', sm: 'row' }} gap={2}>
                  <Link as={ReactRouterLink} to={`/jobs/${post.id}`} flexGrow={1} _hover={{ textDecoration: 'none' }}>
                    <Button colorScheme="indigo" width="full" borderRadius="full">
                      View Details
                    </Button>
                  </Link>
                  {userProfile.role === 'talent' && (
                    <Button
                      onClick={() => handleShowInterest(post.id)}
                      isDisabled={interestedJobIds.has(post.id)}
                      colorScheme={interestedJobIds.has(post.id) ? 'gray' : 'green'}
                      width="full"
                      borderRadius="full"
                    >
                      {interestedJobIds.has(post.id) ? 'Interest Expressed' : 'Express Interest'}
                    </Button>
                  )}
                </Flex>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default JobPostingsListPage;
