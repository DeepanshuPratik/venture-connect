import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  useToast,
  HStack,
  Select
} from '@chakra-ui/react';
import LoadingSpinner from '../../components/LoadingSpinner';

function EditJobPostingPage() {
  const { id: jobId } = useParams(); // Get job ID from URL
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [payRange, setPayRange] = useState('');
  const [status, setStatus] = useState('open'); // Add status state
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch the existing job data
  useEffect(() => {
    const fetchJobPost = async () => {
      try {
        const docRef = doc(db, 'job_posts', jobId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Security check
          if (data.postedBy !== currentUser.uid) {
            toast({ title: "Unauthorized", description: "You cannot edit this job post.", status: "error" });
            navigate('/dashboard');
            return;
          }
          setJobTitle(data.jobTitle);
          setDescription(data.description);
          setRequiredSkills(data.requiredSkills?.join(', ') || '');
          setPayRange(data.payRange || '');
          setStatus(data.status || 'open');
        } else {
          toast({ title: "Not Found", description: "This job post does not exist.", status: "error" });
          navigate('/jobs');
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load job data.", status: "error" });
      } finally {
        setPageLoading(false);
      }
    };
    if (currentUser) fetchJobPost();
  }, [jobId, currentUser, navigate, toast]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, 'job_posts', jobId);
      await updateDoc(docRef, {
        jobTitle,
        description,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        payRange,
        status, // Update the status
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Job post updated successfully!", status: "success" });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: "Update failed", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box maxW="xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="lg" mb={6}>Edit Job Posting</Heading>
      <VStack as="form" spacing={6} onSubmit={handleUpdate}>
        <FormControl id="jobTitle" isRequired>
          <FormLabel>Job Title</FormLabel>
          <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </FormControl>
        <FormControl id="description" isRequired>
          <FormLabel>Description / Responsibilities</FormLabel>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
        </FormControl>
        <FormControl id="requiredSkills">
          <FormLabel>Required Skills (comma separated)</FormLabel>
          <Input value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} />
        </FormControl>
        <FormControl id="payRange">
          <FormLabel>Pay Range (Optional)</FormLabel>
          <Input value={payRange} onChange={(e) => setPayRange(e.target.value)} />
        </FormControl>
        <FormControl id="status">
            <FormLabel>Job Status</FormLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
            </Select>
        </FormControl>
        <HStack w="full" justify="flex-end" spacing={4}>
          <Button onClick={() => navigate('/dashboard')} variant="ghost">Cancel</Button>
          <Button type="submit" colorScheme="blue" isLoading={loading}>Save Changes</Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default EditJobPostingPage;