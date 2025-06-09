import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';
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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  useToast,
  Select // Import Select for dropdown
} from '@chakra-ui/react';

function EditProfilePage() {
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [previousTrack, setPreviousTrack] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [startupVision, setStartupVision] = useState('');
  const [startupStageIndex, setStartupStageIndex] = useState(0);
  const [startupType, setStartupType] = useState(''); // New state for startupType
  const [showTooltip, setShowTooltip] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const startupStageNames = [
    'Ideation / Discovery',
    'MVP / Early Traction',
    'Seed Stage / Fundraising',
    'Growth / Scaling'
  ];

  const startupTypeOptions = [ // Predefined options for startup type
    'SaaS',
    'E-commerce',
    'Fintech',
    'AI / Machine Learning',
    'Healthcare / Biotech',
    'EdTech',
    'Deep Tech',
    'Consumer Goods',
    'Logistics / Supply Chain',
    'Media / Entertainment',
    'Hardware',
    'Biotech',
    'CleanTech / Greentech',
    'Social Impact',
    'Other'
  ];

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setBio(userProfile.bio || '');
      setPreviousTrack(userProfile.previousTrack?.join(', ') || '');
      setSkills(userProfile.skills?.join(', ') || '');
      setPortfolioLink(userProfile.portfolioLink || '');
      setResumeLink(userProfile.resumeLink || '');
      setStartupVision(userProfile.startupVision || '');
      const currentStageIndex = startupStageNames.indexOf(userProfile.startupStage || 'Ideation / Discovery');
      setStartupStageIndex(currentStageIndex !== -1 ? currentStageIndex : 0);
      setStartupType(userProfile.startupType || ''); // Set startupType from profile
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');

    try {
      if (!currentUser) {
        throw new Error("User not authenticated.");
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      const updates = {
        name,
        bio,
        previousTrack: previousTrack.split(',').map(s => s.trim()).filter(s => s),
      };

      if (userProfile.role === 'entrepreneur') {
        updates.startupVision = startupVision;
        updates.startupStage = startupStageNames[startupStageIndex];
        updates.startupType = startupType; // Save startupType
      } else if (userProfile.role === 'talent') {
        updates.skills = skills.split(',').map(s => s.trim()).filter(s => s);
        updates.portfolioLink = portfolioLink;
        updates.resumeLink = resumeLink;
      }

      await updateDoc(userDocRef, updates);

      toast({
        title: "Profile updated!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      setTimeout(() => navigate('/profile'), 1500);

    } catch (err) {
      setError('Failed to update profile: ' + err.message);
      console.error("Error updating profile:", err);
      toast({
        title: "Update failed.",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !userProfile) {
    return <LoadingSpinner />;
  }

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={6}>Edit Profile</Heading>

      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}

      <VStack as="form" spacing={6} onSubmit={handleSubmit} align="stretch">
        <FormControl id="name">
          <FormLabel>Name</FormLabel>
          <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </FormControl>

        <FormControl id="bio">
          <FormLabel>Bio</FormLabel>
          <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
        </FormControl>

        <FormControl id="previousTrack">
          <FormLabel>Previous Jobs / Startups (comma separated)</FormLabel>
          <Input type="text" value={previousTrack} onChange={(e) => setPreviousTrack(e.target.value)} />
          <Text fontSize="sm" color="gray.500" mt={1}>e.g., Software Engineer at Google, Founder of Old Startup</Text>
        </FormControl>

        {/* Entrepreneur-specific fields */}
        {userProfile.role === 'entrepreneur' && (
          <>
            <FormControl id="startupVision">
              <FormLabel>Startup Vision</FormLabel>
              <Textarea rows={5} value={startupVision} onChange={(e) => setStartupVision(e.target.value)} />
            </FormControl>

            <FormControl id="startupType"> {/* New form control for startup type */}
              <FormLabel>Startup Type</FormLabel>
              <Select placeholder="Select type" value={startupType} onChange={(e) => setStartupType(e.target.value)}>
                {startupTypeOptions.map((option, index) => (
                  <option key={index} value={option}>{option || "Select type"}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl id="startupStage">
              <FormLabel>
                Startup Stage:{' '}
                <Text as="span" fontWeight="semibold" color="blue.600">
                  {startupStageNames[startupStageIndex]}
                </Text>
              </FormLabel>
              <Slider
                aria-label="startup-stage-slider"
                min={0}
                max={startupStageNames.length - 1}
                step={1}
                value={startupStageIndex}
                onChange={(val) => setStartupStageIndex(val)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <SliderTrack bg="gray.200">
                  <SliderFilledTrack bg="blue.500" />
                </SliderTrack>
                <Tooltip
                  hasArrow
                  bg="blue.500"
                  color="white"
                  placement="top"
                  isOpen={showTooltip}
                  label={startupStageNames[startupStageIndex]}
                >
                  <SliderThumb boxSize={6} />
                </Tooltip>
              </Slider>
              <HStack justify="space-between" mt={2} fontSize="xs" color="gray.500">
                {startupStageNames.map((stage, index) => (
                  <Text key={index} textAlign="center" flex="1">{stage.split(' / ')[0]}</Text>
                ))}
              </HStack>
            </FormControl>
          </>
        )}

        {/* Talent-specific fields */}
        {userProfile.role === 'talent' && (
          <>
            <FormControl id="skills">
              <FormLabel>Skills (comma separated)</FormLabel>
              <Input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} />
              <Text fontSize="sm" color="gray.500" mt={1}>e.g., React, Node.js, UI/UX</Text>
            </FormControl>
            <FormControl id="portfolioLink">
              <FormLabel>Portfolio Link</FormLabel>
              <Input type="url" value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} />
            </FormControl>
            <FormControl id="resumeLink">
              <FormLabel>Resume Link (e.g., Google Drive, Dropbox)</FormLabel>
              <Input type="url" value={resumeLink} onChange={(e) => setResumeLink(e.target.value)} />
            </FormControl>
          </>
        )}

        <HStack justify="flex-end" spacing={4} mt={6}>
          <Button
            onClick={() => navigate('/profile')}
            colorScheme="gray"
            variant="ghost"
            borderRadius="full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isUpdating}
            loadingText="Saving..."
            borderRadius="full"
          >
            Save Changes
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default EditProfilePage;