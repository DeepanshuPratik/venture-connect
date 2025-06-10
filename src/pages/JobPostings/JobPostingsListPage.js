import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
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
  useToast // For showing interest success/error
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

    // We no longer need to manually fetch interestedJobs for the user as AuthContext
    // provides real-time userProfile, which should include interestedJobs if you added it.
    // If userProfile doesn't update this, you'd need a separate listener for user's interestedJobs.
    // For now, assuming userProfile updates interestedJobs or it's handled by arrayUnion directly.

    return () => unsubscribe();
  }, [currentUser, userProfile]); // userProfile included for re-running if its structure changes

  // Update interestedJobIds from userProfile if available
  useEffect(() => {
    if (userProfile && userProfile.role === 'talent') {
      // Assuming userProfile.interestedJobs is correctly maintained in Firestore for the talent user
      setInterestedJobIds(new Set(userProfile.interestedJobs || []));
    }
  }, [userProfile]);


  if (loadingJobs) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Text color="red.600" textAlign="center" fontSize="lg" mt={8}>{error}</Text>;
  }

  const handleShowInterest = async (jobId) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to express interest.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (userProfile.role !== 'talent') {
      toast({
        title: "Role Mismatch",
        description: "Only 'Talent' users can express interest in jobs.",
        status: "warning",
        duration: 3000,
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
      // The onSnapshot listener in AuthContext will update userProfile and thus interestedJobIds

      toast({
        title: "Interest expressed!",
        description: "The entrepreneur has been notified of your interest.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      console.error('Error showing interest:', err);
      toast({
        title: "Failed to express interest.",
        description: err.message,
        status: "error",
        duration: 4000,
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
          {jobPosts.map((post) => (
            <Card key={post.id} bg="gray.50" shadow="sm" border="1px" borderColor="gray.200" display="flex" flexDirection="column" justifyContent="space-between">
              <CardHeader pb={2}>
                <Heading size="md" color="gray.800">{post.jobTitle}</Heading>
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
                {/* NEW: Display interested count */}
                <HStack spacing={2} mb={4}>
                    <Tag size="sm" colorScheme="blue">
                        <Text as="span" fontWeight="bold">Interested: </Text> {post.interestedUsers?.length || 0}
                    </Tag>
                    {post.status && <Tag size="sm" colorScheme={post.status === 'open' ? 'green' : 'red'}>{post.status}</Tag>}
                </HStack>
              </CardBody>
              <Flex p={4} pt={0} gap={2} mt="auto"> {/* Use mt="auto" to push buttons to bottom */}
                <Link to={`/jobs/${post.id}`} style={{ flexGrow: 1 }}>
                  <Button size="sm" variant="outline" colorScheme="blue" width="full">View Details</Button>
                </Link>
                {userProfile?.role === 'talent' && (
                  <Button
                    onClick={() => handleShowInterest(post.id)}
                    disabled={interestedJobIds.has(post.id)}
                    colorScheme={interestedJobIds.has(post.id) ? 'gray' : 'green'}
                    size="sm"
                    width="full"
                  >
                    {interestedJobIds.has(post.id) ? 'Interest Expressed' : 'Express Interest'}
                  </Button>
                )}
              </Flex>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default JobPostingsListPage;