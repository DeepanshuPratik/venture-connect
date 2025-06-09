import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as ReactRouterLink } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Tag,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  Link,
  useToast
} from '@chakra-ui/react';

function JobPostingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const toast = useToast();

  const [jobPost, setJobPost] = useState(null);
  const [interestedTalent, setInterestedTalent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInterestExpressed, setIsInterestExpressed] = useState(false);

  useEffect(() => {
    const fetchJobPost = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'job_posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setJobPost({ id: docSnap.id, ...data });
          if (userProfile?.role === 'talent' && currentUser && data.interestedUsers?.includes(currentUser.uid)) {
            setIsInterestExpressed(true);
          }
        } else {
          setError('Job posting not found.');
        }
      } catch (err) {
        console.error('Error fetching job post:', err);
        setError('Failed to load job posting details.');
      } finally { // Use finally to ensure loading is set to false
        setLoading(false);
      }
    };

    fetchJobPost();
  }, [id, currentUser, userProfile]);

  useEffect(() => {
    const fetchInterestedTalent = async () => {
      if (jobPost && userProfile?.role === 'entrepreneur' && jobPost.postedBy === currentUser?.uid && jobPost.interestedUsers && jobPost.interestedUsers.length > 0) {
        const talentPromises = jobPost.interestedUsers.map(async (uid) => {
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);
          return userDocSnap.exists() ? { id: userDocSnap.id, ...userDocSnap.data() } : null;
        });
        const talentResults = await Promise.all(talentPromises);
        setInterestedTalent(talentResults.filter(Boolean));
      } else {
          setInterestedTalent([]);
      }
    };

    fetchInterestedTalent();
  }, [jobPost, currentUser, userProfile]);

  const handleShowInterest = async () => {
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
      const jobRef = doc(db, 'job_posts', id);
      await updateDoc(jobRef, {
        interestedUsers: arrayUnion(currentUser.uid)
      });

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        interestedJobs: arrayUnion(id)
      });
      setIsInterestExpressed(true);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Text color="red.600" textAlign="center" fontSize="lg" mt={8}>{error}</Text>;
  }

  if (!jobPost) {
    return <Text color="gray.600" textAlign="center" fontSize="lg" mt={8}>Job posting not found.</Text>;
  }

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={2}>{jobPost.jobTitle}</Heading>
      <Text fontSize="lg" color="gray.600">Posted by: {jobPost.postedByName || 'Anonymous Entrepreneur'}</Text>
      {jobPost.postedAt && (
        <Text fontSize="sm" color="gray.500" mb={4}>
          Posted on: {jobPost.postedAt.toDate().toLocaleDateString()}
        </Text>
      )}

      <VStack align="stretch" spacing={6} mb={8}>
        <Box>
          <Heading as="h2" size="md" color="gray.700" mb={2}>Description</Heading>
          <Text color="gray.800" lineHeight="tall">{jobPost.description}</Text>
        </Box>

        {jobPost.requiredSkills && jobPost.requiredSkills.length > 0 && (
          <Box>
            <Heading as="h2" size="md" color="gray.700" mb={2}>Required Skills</Heading>
            <HStack flexWrap="wrap">
              {jobPost.requiredSkills.map((skill, index) => (
                <Tag key={index} colorScheme="blue" size="md">
                  {skill}
                </Tag>
              ))}
            </HStack>
          </Box>
        )}

        {jobPost.payRange && (
          <Box>
            <Heading as="h2" size="md" color="gray.700" mb={2}>Pay Range</Heading>
            <Text color="gray.800">{jobPost.payRange}</Text>
          </Box>
        )}
      </VStack>

      <HStack justify="flex-end">
        {userProfile?.role === 'talent' && (
          <Button
            onClick={handleShowInterest}
            isDisabled={isInterestExpressed}
            colorScheme={isInterestExpressed ? 'gray' : 'green'}
            size="lg"
            borderRadius="full"
          >
            {isInterestExpressed ? 'Interest Expressed' : 'Express Interest'}
          </Button>
        )}
      </HStack>

      {/* Display interested talent for the entrepreneur who posted the job */}
      {userProfile?.role === 'entrepreneur' && jobPost.postedBy === currentUser?.uid && (
        <Box mt={10} pt={8} borderTop="1px" borderColor="gray.200">
          <Heading as="h2" size="lg" color="gray.800" mb={4}>Talent Expressing Interest ({interestedTalent.length})</Heading>
          {interestedTalent.length === 0 ? (
            <Text color="gray.600">No one has expressed interest in this job yet.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {interestedTalent.map((talent) => (
                <Card key={talent.id} bg="blue.50" shadow="sm" border="1px" borderColor="blue.200">
                  <CardBody>
                    <Heading size="sm" color="blue.700" mb={1}>{talent.name}</Heading>
                    <Text fontSize="sm" color="gray.700" mb={2}>{talent.email}</Text>
                    <Text fontSize="sm" color="gray.600">Skills: {talent.skills?.join(', ') || 'N/A'}</Text>
                    <Text fontSize="sm" color="gray.600" noOfLines={1}>Bio: {talent.bio || 'N/A'}</Text>
                    {/* UPDATED LINK: Point to the new PublicProfilePage */}
                    <Link as={ReactRouterLink} to={`/profile/${talent.id}`} color="blue.500" fontSize="sm" mt={2} display="block" _hover={{ textDecoration: 'underline' }}>
                      View Full Profile
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>
      )}
    </Box>
  );
}

export default JobPostingDetailPage;