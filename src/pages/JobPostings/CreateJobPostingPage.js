import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Heading,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  Text,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  useToast
} from '@chakra-ui/react';

function CreateJobPostingPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState(''); // Comma-separated
  const [payRange, setPayRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || userProfile.role !== 'entrepreneur') {
      setError('You must be an entrepreneur to post jobs.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'job_posts'), {
        jobTitle,
        description,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        payRange,
        postedBy: currentUser.uid,
        postedByName: userProfile.name,
        postedAt: serverTimestamp(),
        status: 'open',
        interestedUsers: []
      });
      toast({
        title: "Job posting created!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate('/jobs');
    } catch (err) {
      setError('Failed to create job posting: ' + err.message);
      console.error(err);
      toast({
        title: "Creation failed.",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={6}>Create New Job Posting</Heading>
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}
      <VStack as="form" spacing={6} onSubmit={handleSubmit} align="stretch">
        <FormControl id="jobTitle" isRequired>
          <FormLabel>Job Title</FormLabel>
          <Input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </FormControl>

        <FormControl id="description" isRequired>
          <FormLabel>Description / Responsibilities</FormLabel>
          <Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormControl>

        <FormControl id="requiredSkills">
          <FormLabel>Required Skills (comma separated)</FormLabel>
          <Input type="text" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} />
          <Text fontSize="sm" color="gray.500" mt={1}>e.g., React, Node.js, Firebase, UI/UX</Text>
        </FormControl>

        <FormControl id="payRange">
          <FormLabel>Pay Range (Optional)</FormLabel>
          <Input type="text" value={payRange} onChange={(e) => setPayRange(e.target.value)} placeholder="e.g., $60k - $80k, Equity-based" />
        </FormControl>

        <HStack justify="flex-end" spacing={4} mt={6}>
          <Button
            onClick={() => navigate('/jobs')}
            colorScheme="gray"
            variant="ghost"
            borderRadius="full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Posting..."
            borderRadius="full"
          >
            Create Job Post
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default CreateJobPostingPage;
