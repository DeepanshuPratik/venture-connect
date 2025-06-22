import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
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
  useToast,
  Image,
  Icon,
  CloseButton,
} from '@chakra-ui/react';
import { FaSave, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';

function EditAchievementPage() {
  const { id: achievementId } = useParams(); // Get the achievement ID from the URL
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState(null); // For a new file upload
  const [mediaPreview, setMediaPreview] = useState(null); // For the preview
  const [existingMediaUrl, setExistingMediaUrl] = useState(''); // To track the original URL
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the existing achievement data on mount
  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const docRef = doc(db, 'achievements', achievementId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Security check: ensure the current user is the owner of the post
          if (data.postedBy !== currentUser.uid) {
            toast({ title: "Unauthorized", description: "You cannot edit this post.", status: "error" });
            navigate('/dashboard');
            return;
          }
          setTitle(data.title);
          setDescription(data.description);
          setMediaPreview(data.mediaUrl);
          setExistingMediaUrl(data.mediaUrl);
        } else {
          toast({ title: "Not Found", description: "This achievement post does not exist.", status: "error" });
          navigate('/achievements');
        }
      } catch (err) {
        console.error("Error fetching achievement:", err);
        setError("Failed to load achievement data.");
      } finally {
        setPageLoading(false);
      }
    };

    if (currentUser) {
      fetchAchievement();
    }
  }, [achievementId, currentUser, navigate, toast]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Add validation if you want (size, type)
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    let finalMediaUrl = existingMediaUrl; // Start with the existing URL

    // If a new file was selected, upload it
    if (mediaFile) {
      const formData = new FormData();
      formData.append('media', mediaFile);
      try {
        const response = await axios.post(process.env.REACT_APP_LOCAL_UPLOAD_URL, formData);
        finalMediaUrl = response.data.mediaUrl;
      } catch (uploadError) {
        setError('Media upload failed. Please try again.');
        setLoading(false);
        return;
      }
    } else if (mediaPreview === null) {
      // If the preview is null, it means user removed the media
      finalMediaUrl = '';
    }

    // Update the document in Firestore
    try {
      const docRef = doc(db, 'achievements', achievementId);
      await updateDoc(docRef, {
        title,
        description,
        mediaUrl: finalMediaUrl,
        updatedAt: serverTimestamp(), // Add an 'updatedAt' timestamp
      });
      toast({ title: "Achievement Updated!", status: "success", duration: 3000 });
      navigate('/dashboard');
    } catch (firestoreError) {
      setError('Failed to update your post.');
      console.error("Error updating document: ", firestoreError);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box maxW="container.md" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" mb={6}>Edit Achievement</Heading>
      {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
      <VStack spacing={6} as="form" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
        <FormControl id="title" isRequired>
          <FormLabel>Title</FormLabel>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormControl>
        <FormControl id="description" isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
        </FormControl>
        <FormControl id="media">
          <FormLabel>Media</FormLabel>
          {!mediaPreview ? (
            <FormLabel htmlFor="media-upload" cursor="pointer" p={6} border="2px dashed" borderColor="gray.300" borderRadius="md" textAlign="center" _hover={{ borderColor: 'blue.400' }}>
              <VStack>
                <Icon as={FaCloudUploadAlt} boxSize={10} color="gray.400" />
                <Text>Click to upload new media</Text>
              </VStack>
            </FormLabel>
          ) : (
            <Box position="relative" w="fit-content">
              <CloseButton position="absolute" top="-12px" right="-12px" bg="red.500" color="white" borderRadius="full" size="sm" onClick={handleRemoveMedia} />
              <Image src={mediaPreview} alt="Media preview" maxH="200px" borderRadius="md" />
            </Box>
          )}
          <Input ref={fileInputRef} id="media-upload" type="file" onChange={handleFileChange} accept="image/*,video/*,application/pdf" display="none" />
        </FormControl>
        <HStack w="full" justify="flex-end" spacing={4}>
          <Button leftIcon={<FaTimes />} onClick={() => navigate('/dashboard')} colorScheme="gray" variant="outline">Cancel</Button>
          <Button leftIcon={<FaSave />} type="submit" colorScheme="blue" isLoading={loading}>Save Changes</Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default EditAchievementPage;