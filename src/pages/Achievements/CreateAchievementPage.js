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
// import { storage } from '../../firebase/firebase'; // Uncomment if you implement image uploads
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function CreateAchievementPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // const [imageFile, setImageFile] = useState(null); // Uncomment for image upload
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || userProfile.role !== 'entrepreneur') {
      setError('You must be an entrepreneur to post achievements.');
      return;
    }

    setLoading(true);
    setError('');
    let imageUrl = '';

    // Uncomment and implement if you want image uploads
    /*
    if (imageFile) {
      try {
        const imageRef = ref(storage, `achievement_images/${currentUser.uid}/${imageFile.name}_${Date.now()}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      } catch (uploadError) {
        setError('Failed to upload image: ' + uploadError.message);
        setLoading(false);
        toast({
          title: "Image upload failed.",
          description: uploadError.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }
    */

    try {
      await addDoc(collection(db, 'achievements'), {
        title,
        description,
        // imageUrl, // Uncomment if you implement image uploads
        postedBy: currentUser.uid,
        postedAt: serverTimestamp(),
      });
      toast({
        title: "Achievement posted!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate('/achievements');
    } catch (err) {
      setError('Failed to post achievement: ' + err.message);
      console.error(err);
      toast({
        title: "Posting failed.",
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
      <Heading as="h1" size="xl" color="gray.800" mb={6}>Post a New Achievement</Heading>
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}
      <VStack as="form" spacing={6} onSubmit={handleSubmit} align="stretch">
        <FormControl id="title" isRequired>
          <FormLabel>Achievement Title</FormLabel>
          <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormControl>

        <FormControl id="description" isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormControl>

        {/* Uncomment this section for image upload (and firebase/firebase.js storage export) */}
        {/*
        <FormControl id="image">
          <FormLabel>Image (Optional)</FormLabel>
          <Input
            type="file"
            pt={1} // Adjust padding for file input
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <FormHelperText>Upload an image to visually represent your achievement.</FormHelperText>
        </FormControl>
        */}

        <HStack justify="flex-end" spacing={4} mt={6}>
          <Button
            onClick={() => navigate('/achievements')}
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
            Post Achievement
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default CreateAchievementPage;
