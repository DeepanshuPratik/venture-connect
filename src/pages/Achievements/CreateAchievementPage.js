import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { useAuth } from '../../contexts/AuthContext';import {
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
  Progress, // For step progress indication
  Card,
  CardBody,
  CardFooter,
  Divider,
  Spacer
} from '@chakra-ui/react';
import { FaArrowLeft, FaArrowRight, FaCheckCircle } from 'react-icons/fa'; // Import icons
import LoadingSpinner from '../../components/LoadingSpinner';


function CreateAchievementPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false); // For final submission
  const [error, setError] = useState(''); // For step-specific or overall errors

  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const maxTitleLength = 100;
  const maxDescriptionLength = 1000;

  // --- Step Navigation Functions ---
  const handleNextStep = () => {
    setError(''); // Clear previous errors on step change
    if (currentStep === 1) {
      if (!title.trim()) {
        setError("Achievement title cannot be empty.");
        return;
      }
      if (title.length > maxTitleLength) {
        setError(`Title cannot exceed ${maxTitleLength} characters.`);
        return;
      }
    } else if (currentStep === 2) {
      if (!description.trim()) {
        setError("Achievement description cannot be empty.");
        return;
      }
      if (description.length > maxDescriptionLength) {
        setError(`Description cannot exceed ${maxDescriptionLength} characters.`);
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  // --- Final Submission Function ---
  const handleSubmit = async () => {
    if (!currentUser || userProfile.role !== 'entrepreneur') {
      setError('You must be an entrepreneur to post achievements.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'achievements'), {
        title,
        description,
        imageUrl: null, // No image support in this version
        postedBy: currentUser.uid,
        postedAt: serverTimestamp(),
      });

      toast({
        title: "Achievement posted successfully!",
        description: "Your big win is now live!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
        icon: <FaCheckCircle /> // Custom icon for success
      });

      navigate('/achievements');
    } catch (err) {
      setError('Failed to post achievement: ' + err.message);
      console.error("Error posting achievement:", err);
      toast({
        title: "Posting failed.",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Render different steps ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" color="blue.700">
              What's your big win? 🎉
            </Heading>
            <Text textAlign="center" color="gray.600">
              Give your achievement a short, impactful title.
            </Text>
            <FormControl id="title" isRequired>
              <FormLabel>Achievement Title</FormLabel>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Secured Seed Funding Round, Launched MVP!"
                maxLength={maxTitleLength}
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                {title.length} / {maxTitleLength} characters
              </Text>
            </FormControl>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" color="blue.700">
              Tell us the story! 📖
            </Heading>
            <Text textAlign="center" color="gray.600">
              Share the details, challenges, and what makes this achievement special.
            </Text>
            <FormControl id="description" isRequired>
              <FormLabel>Full Story / Description</FormLabel>
              <Textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your achievement in detail..."
                maxLength={maxDescriptionLength}
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                {description.length} / {maxDescriptionLength} characters
              </Text>
            </FormControl>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" color="blue.700">
              Review and Publish ✨
            </Heading>
            <Text textAlign="center" color="gray.600">
              Take a look at your achievement before sharing it with the community.
            </Text>

            <Box p={4} bg="gray.50" rounded="md" border="1px" borderColor="gray.200">
              <Heading size="md" mb={2}>{title}</Heading>
              <Divider mb={2} />
              <Text fontSize="md" color="gray.700">{description}</Text>
            </Box>
          </VStack>
        );
      default:
        return null;
    }
  };

  if (!userProfile) { // Add a check for userProfile loading
    return <LoadingSpinner />;
  }

  // Restrict access to entrepreneurs
  if (userProfile.role !== 'entrepreneur') {
    return (
      <VStack spacing={4} align="center" justify="center" minH="calc(100vh - 160px)">
        <Alert status="warning" borderRadius="md" maxWidth="md">
          <AlertIcon />
          <Text>Only entrepreneurs can post achievements.</Text>
        </Alert>
        <Button onClick={() => navigate('/dashboard')} colorScheme="blue">
          Go to Dashboard
        </Button>
      </VStack>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={6} textAlign="center">
        Share Your Achievement
      </Heading>

      {/* Progress Bar */}
      <Progress
        value={(currentStep / 3) * 100}
        size="md"
        colorScheme="blue"
        hasStripe
        isAnimated
        mb={8}
        borderRadius="full"
      />

      {/* Error Display */}
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}

      {/* Step Content Card */}
      <Card border="1px" borderColor="gray.100" shadow="sm">
        <CardBody>{renderStepContent()}</CardBody>
        <CardFooter>
          <HStack justify="space-between" width="full">
            {currentStep > 1 && (
              <Button
                leftIcon={<FaArrowLeft />}
                onClick={handlePrevStep}
                colorScheme="gray"
                variant="ghost"
                borderRadius="full"
              >
                Back
              </Button>
            )}
            <Spacer />
            {currentStep < 3 && (
              <Button
                rightIcon={<FaArrowRight />}
                onClick={handleNextStep}
                colorScheme="blue"
                borderRadius="full"
              >
                Next
              </Button>
            )}
            {currentStep === 3 && (
              <Button
                leftIcon={<FaCheckCircle />}
                onClick={handleSubmit}
                colorScheme="green"
                isLoading={loading}
                loadingText="Publishing..."
                borderRadius="full"
              >
                Publish Achievement
              </Button>
            )}
          </HStack>
        </CardFooter>
      </Card>

      <Text fontSize="sm" color="gray.500" mt={4} textAlign="center">
        Step {currentStep} of 3
      </Text>
    </Box>
  );
}

export default CreateAchievementPage;