import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
  Progress,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Spacer,
  Image,
  Icon,
  CloseButton,
} from '@chakra-ui/react';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaCloudUploadAlt } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';


function CreateAchievementPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');

  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const maxTitleLength = 100;
  const maxDescriptionLength = 1000;
  const maxFileSize = 60 * 1024 * 1024; // 60 MB
  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf'];

  // --- File Handler with Validation ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    setUploadError('');

    if (!file) {
      setMediaFile(null);
      setMediaPreview(null);
      return;
    }

    if (file.size > maxFileSize) {
      setUploadError(`File is too large. Maximum size is ${maxFileSize / (1024 * 1024)} MB.`);
      setMediaFile(null);
      setMediaPreview(null);
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload an image, video, or PDF.');
      setMediaFile(null);
      setMediaPreview(null);
      return;
    }

    setMediaFile(file);
    if (file.type.startsWith('image/')) {
        setMediaPreview(URL.createObjectURL(file));
    } else {
        setMediaPreview(file.name);
    }
  };

  // --- Function to remove the selected media file ---
  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --- Step Navigation ---
  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!title.trim()) { setError("Achievement title cannot be empty."); return; }
      if (title.length > maxTitleLength) { setError(`Title cannot exceed ${maxTitleLength} characters.`); return; }
    } else if (currentStep === 2) {
      if (!description.trim()) { setError("Achievement description cannot be empty."); return; }
      if (description.length > maxDescriptionLength) { setError(`Description cannot exceed ${maxDescriptionLength} characters.`); return; }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  // --- Final Submission ---
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    let mediaUrl = '';

    if (mediaFile) {
      const formData = new FormData();
      formData.append('media', mediaFile);

      try {
        const uploadUrl = process.env.REACT_APP_LOCAL_UPLOAD_URL;
        if (!uploadUrl) {
            throw new Error("Upload URL not configured.");
        }
        const response = await axios.post(uploadUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        mediaUrl = response.data.mediaUrl;
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
        setError('Media upload failed. The server might be under maintenance or unreachable. Please try again later or post without media.');
        setLoading(false);
        return;
      }
    }

    try {
      await addDoc(collection(db, 'achievements'), {
        title,
        description,
        mediaUrl: mediaUrl,
        postedBy: currentUser.uid,
        postedAt: serverTimestamp(),
      });

      toast({
        title: "Achievement posted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate('/community/feed');
    } catch (firestoreError) {
      setError('Failed to post achievement: ' + firestoreError.message);
      toast({ title: "Posting failed.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  // --- Render different steps ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // Title step
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" color="blue.700">What's your big win? 🎉</Heading>
            <Text textAlign="center" color="gray.600">Give your achievement a short, impactful title.</Text>
            <FormControl id="title" isRequired>
              <FormLabel>Achievement Title</FormLabel>
              <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Secured Seed Funding Round!" maxLength={maxTitleLength} />
              <Text fontSize="sm" color="gray.500" mt={1}>{title.length} / {maxTitleLength} characters</Text>
            </FormControl>
          </VStack>
        );
      case 2:
        // Description step
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" color="blue.700">Tell us the story! 📖</Heading>
            <Text textAlign="center" color="gray.600">Share the details, challenges, and what makes this achievement special.</Text>
            <FormControl id="description" isRequired>
              <FormLabel>Full Story / Description</FormLabel>
              <Textarea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your achievement in detail..." maxLength={maxDescriptionLength} />
              <Text fontSize="sm" color="gray.500" mt={1}>{description.length} / {maxDescriptionLength} characters</Text>
            </FormControl>
          </VStack>
        );
      case 3:
        // Media Upload Step
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" color="blue.700">Add some flair! 📸</Heading>
            <Text textAlign="center" color="gray.600">A picture, video, or PDF can make your post stand out. This step is optional.</Text>
            {uploadError && <Alert status="error" borderRadius="md"><AlertIcon />{uploadError}</Alert>}
            {!mediaPreview ? (
              <FormControl>
                <FormLabel htmlFor="media-upload" cursor="pointer" p={6} border="2px dashed" borderColor={uploadError ? "red.300" : "gray.300"} borderRadius="md" textAlign="center" _hover={{ borderColor: 'blue.400' }}>
                  <VStack>
                    <Icon as={FaCloudUploadAlt} boxSize={10} color="gray.400" />
                    <Text>Click to upload media</Text>
                    <Text fontSize="sm" color="gray.500">(Image, Video, or PDF - Max 60MB)</Text>
                  </VStack>
                </FormLabel>
                <Input ref={fileInputRef} id="media-upload" type="file" onChange={handleFileChange} accept={allowedFileTypes.join(',')} display="none" />
              </FormControl>
            ) : (
              <Box position="relative" w="fit-content" mx="auto">
                <CloseButton
                  position="absolute"
                  top="-10px"
                  right="-10px"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  size="sm"
                  onClick={handleRemoveMedia}
                  _hover={{ bg: "red.600" }}
                  zIndex="1"
                />
                {typeof mediaPreview === 'string' && mediaPreview.startsWith('blob:') ? (
                  <Image src={mediaPreview} alt="Media Preview" maxH="200px" borderRadius="md" objectFit="cover" />
                ) : (
                  <Text p={4} bg="gray.100" borderRadius="md" fontSize="sm">{mediaPreview}</Text>
                )}
              </Box>
            )}
          </VStack>
        );
      case 4:
        // Review Step
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" color="blue.700">Review and Publish ✨</Heading>
            <Text textAlign="center" color="gray.600">Take a look at your achievement before sharing it with the community.</Text>
            <Box p={4} bg="gray.50" rounded="md" border="1px" borderColor="gray.200">
              <Heading size="md" mb={2}>{title}</Heading>
              <Divider mb={2} />
              <Text fontSize="md" color="gray.700" whiteSpace="pre-wrap" mb={4}>
                {description}
              </Text>
              {mediaPreview && (
                <Box mt={4} pt={4} borderTop="1px" borderColor="gray.200">
                  <Text fontWeight="bold" mb={2} color="gray.600">Attached Media:</Text>
                  {typeof mediaPreview === 'string' && mediaPreview.startsWith('blob:') ? (
                    <Image src={mediaPreview} alt="Preview" maxH="200px" borderRadius="md" objectFit="cover" w="full" />
                  ) : (
                    <Text p={2} bg="gray.100" borderRadius="md" fontSize="sm">
                      {mediaPreview}
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          </VStack>
        );
      default:
        return null;
    }
  };

  if (!userProfile) { return <LoadingSpinner />; }

  if (userProfile.role !== 'entrepreneur') {
    return (
      <VStack spacing={4} align="center" justify="center" minH="calc(100vh - 160px)">
        <Alert status="warning" borderRadius="md" maxWidth="md"><AlertIcon /><Text>Only entrepreneurs can post achievements.</Text></Alert>
        <Button onClick={() => navigate('/dashboard')} colorScheme="blue">Go to Dashboard</Button>
      </VStack>
    );
  }

  const totalSteps = 4;

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={6} textAlign="center">Share Your Achievement</Heading>
      <Progress value={(currentStep / totalSteps) * 100} size="md" colorScheme="blue" hasStripe isAnimated mb={8} borderRadius="full" />
      {error && <Alert status="error" mb={4} borderRadius="md"><AlertIcon /><Text>{error}</Text></Alert>}
      <Card border="1px" borderColor="gray.100" shadow="sm">
        <CardBody>{renderStepContent()}</CardBody>
        <CardFooter>
          <HStack justify="space-between" width="full">
            {currentStep > 1 && <Button leftIcon={<FaArrowLeft />} onClick={handlePrevStep} colorScheme="gray" variant="ghost" borderRadius="full">Back</Button>}
            <Spacer />
            {currentStep < totalSteps && <Button rightIcon={<FaArrowRight />} onClick={handleNextStep} colorScheme="blue" borderRadius="full">Next</Button>}
            {currentStep === totalSteps && <Button leftIcon={<FaCheckCircle />} onClick={handleSubmit} colorScheme="green" isLoading={loading} loadingText="Publishing..." borderRadius="full">Publish Achievement</Button>}
          </HStack>
        </CardFooter>
      </Card>
      <Text fontSize="sm" color="gray.500" mt={4} textAlign="center">Step {currentStep} of {totalSteps}</Text>
    </Box>
  );
}

export default CreateAchievementPage;