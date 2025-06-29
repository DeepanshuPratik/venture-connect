import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';import { db } from '../../firebase/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';

// Import Chakra UI components
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Text,
  useToast,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Checkbox,
  Stack,
  Heading,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
} from '@chakra-ui/react';

// Helper to format dates for display and calculation (no change)
const formatDate = (dateValue) => {
  if (!dateValue) return 'Present';
  const date = dateValue instanceof Timestamp ? dateValue.toDate() : new Date(dateValue);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

const calculateDuration = (startDateValue, endDateValue, isCurrent) => {
  if (!startDateValue) return '';

  const start = startDateValue instanceof Timestamp ? startDateValue.toDate() : new Date(startDateValue);
  const end = isCurrent ? new Date() : (endDateValue instanceof Timestamp ? endDateValue.toDate() : new Date(endDateValue));

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return ''; // Invalid date
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0 || (months === 0 && end.getDate() < start.getDate())) {
    years--;
    months += 12;
  }

  if (years > 0 && months > 0) {
    return `(${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''})`;
  } else if (years > 0) {
    return `(${years} year${years > 1 ? 's' : ''})`;
  } else if (months > 0) {
    return `(${months} month${months > 1 ? 's' : ''})`;
  } else {
    return '(Less than a month)';
  }
};


function EditProfilePage() {
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [workExperiences, setWorkExperiences] = useState([]);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [isEditingExistingExperience, setIsEditingExistingExperience] = useState(false);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [resumeLink, setResumeLink] = useState('');

  const [startupName, setStartupName] = useState('');
  const [startupTagline, setStartupTagline] = useState('');
  const [startupIndustry, setStartupIndustry] = useState('');
  const [otherIndustryValue, setOtherIndustryValue] = useState(''); // New state for 'Other' industry
  const [startupWebsite, setStartupWebsite] = useState('');
  const [startupVision, setStartupVision] = useState('');
  const [startupStage, setStartupStage] = useState('Ideation / Discovery');

  const [isUpdating, setIsUpdating] = useState(false);

  // Define predefined startup industries/niches for the dropdown
  const startupIndustries = [
    'Not selected',
    'AI/ML', 'SaaS', 'FinTech', 'EdTech', 'HealthTech', 'E-commerce',
    'Food & Beverage', 'Fashion', 'Biotechnology', 'CleanTech', 'Gaming',
    'Media & Entertainment', 'Real Estate', 'Transportation', 'Cybersecurity',
    'Robotics', 'SpaceTech', 'DeepTech', 'Social Impact', 'Consumer Goods',
    'Other' // Added 'Other'
  ];

  const startupStageNames = [
    'Ideation / Discovery',
    'MVP / Early Traction',
    'Seed Stage / Fundraising',
    'Growth / Scaling'
  ];

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setBio(userProfile.bio || '');
      setWorkExperiences(userProfile.workExperiences || []);

      setSkills(userProfile.skills || []);
      setPortfolioLink(userProfile.portfolioLink || '');
      setResumeLink(userProfile.resumeLink || '');

      setStartupName(userProfile.startupName || '');
      setStartupTagline(userProfile.startupTagline || '');

      // Correctly initialize startupIndustry and otherIndustryValue
      if (startupIndustries.includes(userProfile.startupIndustry)) {
        setStartupIndustry(userProfile.startupIndustry);
        setOtherIndustryValue(''); // Clear other field if it's a predefined industry
      } else if (userProfile.startupIndustry) {
        // If it's not a predefined industry, assume it's a custom 'Other' value
        setStartupIndustry('Other');
        setOtherIndustryValue(userProfile.startupIndustry);
      } else {
        setStartupIndustry('Not selected');
        setOtherIndustryValue('');
      }

      setStartupWebsite(userProfile.startupWebsite || '');
      setStartupVision(userProfile.startupVision || '');
      setStartupStage(userProfile.startupStage || 'Ideation / Discovery');
    }
  }, [userProfile]);

  // --- Handlers for Skills Chips ---
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault();
      const skill = newSkill.trim();
      if (skill && !skills.includes(skill)) {
        setSkills([...skills, skill]);
        setNewSkill('');
      } else if (skill && skills.includes(skill)) {
        toast({
          title: "Duplicate skill",
          description: "This skill is already added.",
          status: "warning",
          duration: 2000,
          isClosable: true,
        });
        setNewSkill('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // --- Handlers for Work Experiences ---
  const handleOpenAddExperienceModal = () => {
    setIsEditingExistingExperience(false);
    setCurrentExperience({
      id: Date.now().toString(),
      companyName: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      isCurrent: true,
      description: ''
    });
    onOpen();
  };

  const handleOpenEditExperienceModal = (experience) => {
    setIsEditingExistingExperience(true);
    setCurrentExperience({
      ...experience,
      startDate: experience.startDate ? new Date(experience.startDate.toDate()).toISOString().split('T')[0] : '',
      endDate: experience.endDate ? new Date(experience.endDate.toDate()).toISOString().split('T')[0] : '',
    });
    onOpen();
  };

  const handleSaveExperience = () => {
    if (!currentExperience.companyName || !currentExperience.jobTitle || !currentExperience.startDate) {
      toast({
        title: "Missing fields",
        description: "Company Name, Job Title, and Start Date are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formattedExperience = {
      ...currentExperience,
      startDate: currentExperience.startDate ? Timestamp.fromDate(new Date(currentExperience.startDate)) : null,
      endDate: currentExperience.isCurrent ? null : (currentExperience.endDate ? Timestamp.fromDate(new Date(currentExperience.endDate)) : null),
    };

    if (isEditingExistingExperience) {
      setWorkExperiences(workExperiences.map(exp =>
        exp.id === formattedExperience.id ? formattedExperience : exp
      ));
    } else {
      setWorkExperiences([...workExperiences, formattedExperience]);
    }
    onClose();
    setCurrentExperience(null);
  };

  const handleDeleteExperience = (idToRemove) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      setWorkExperiences(workExperiences.filter(exp => exp.id !== idToRemove));
      toast({
        title: "Experience deleted.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async () => {
    setIsUpdating(true);
    toast.closeAll();

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);

      // Determine the final industry value to save
      let finalIndustryToSave = '';
      if (startupIndustry === 'Other') {
        finalIndustryToSave = otherIndustryValue.trim(); // Save the custom value
      } else if (startupIndustry !== 'Not selected') {
        finalIndustryToSave = startupIndustry; // Save the selected predefined value
      }
      // If 'Not selected' or 'Other' with empty value, it remains ''

      const updates = {
        name,
        bio,
        workExperiences: workExperiences,
      };

      if (userProfile.role === 'entrepreneur') {
        updates.startupName = startupName;
        updates.startupTagline = startupTagline;
        updates.startupIndustry = finalIndustryToSave; // Use the determined final value
        updates.startupWebsite = startupWebsite;
        updates.startupVision = startupVision;
        updates.startupStage = startupStage;
      } else if (userProfile.role === 'talent') {
        updates.skills = skills;
        updates.portfolioLink = portfolioLink;
        updates.resumeLink = resumeLink;
      }

      await updateDoc(userDocRef, updates);
      toast({
        title: "Profile updated.",
        description: "Your profile has been successfully saved.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      toast({
        title: "Error updating profile.",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error(err);
    }
    setIsUpdating(false);
  };

  if (loading || !userProfile) {
    return <LoadingSpinner />;
  }

  const sortedWorkExperiences = [...workExperiences].sort((a, b) => {
    const dateA = a.startDate ? (a.startDate.toDate ? a.startDate.toDate() : new Date(a.startDate)) : new Date(0);
    const dateB = b.startDate ? (b.startDate.toDate ? b.startDate.toDate() : new Date(b.startDate)) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });


  return (
    <Box maxW="3xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Text fontSize="4xl" fontWeight="bold" color="gray.800" mb={6}>Edit Profile</Text>

      <VStack as="form" spacing={6} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <FormControl id="name">
          <FormLabel>Name</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </FormControl>

        <FormControl id="bio">
          <FormLabel>Bio</FormLabel>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
        </FormControl>

        {/* --- Dynamic Content for Entrepreneurs/Talent --- */}
        {userProfile.role === 'entrepreneur' ? (
          <Tabs isFitted variant="enclosed" w="full">
            <TabList mb="1em">
              <Tab _selected={{ color: 'white', bg: 'blue.500' }}>My Running Startup</Tab>
              <Tab _selected={{ color: 'white', bg: 'blue.500' }}>Work History</Tab>
            </TabList>

            <TabPanels>
              {/* --- Running Startup Tab Panel --- */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                    <FormControl id="startupName">
                        <FormLabel>Startup Name</FormLabel>
                        <Input value={startupName} onChange={(e) => setStartupName(e.target.value)} placeholder="e.g., VentureConnect" />
                    </FormControl>
                    <FormControl id="startupTagline">
                        <FormLabel>Tagline</FormLabel>
                        <Input value={startupTagline} onChange={(e) => setStartupTagline(e.target.value)} placeholder="e.g., Empowering entrepreneurial journeys" />
                    </FormControl>
                    {/* Industry/Niche Dropdown with 'Other' */}
                    <FormControl id="startupIndustry">
                        <FormLabel>Industry / Niche</FormLabel>
                        <Select
                            value={startupIndustry}
                            onChange={(e) => {
                                setStartupIndustry(e.target.value);
                                // Clear otherIndustryValue if a predefined option is selected
                                if (e.target.value !== 'Other') {
                                    setOtherIndustryValue('');
                                }
                            }}
                            placeholder="Select an industry"
                        >
                            {startupIndustries.map((industry) => (
                                <option key={industry} value={industry === 'Not selected' ? '' : industry}>
                                    {industry}
                                </option>
                            ))}
                        </Select>
                        <Text fontSize="sm" color="gray.500" mt={1}>Choose the primary industry for your startup.</Text>
                    </FormControl>
                    {/* Conditional Input for 'Other' Industry */}
                    {startupIndustry === 'Other' && (
                        <FormControl id="otherIndustryValue">
                            <FormLabel>Specify Industry</FormLabel>
                            <Input
                                value={otherIndustryValue}
                                onChange={(e) => setOtherIndustryValue(e.target.value)}
                                placeholder="e.g., Quantum Computing, Bio-robotics"
                            />
                        </FormControl>
                    )}
                    <FormControl id="startupWebsite">
                        <FormLabel>Startup Website / Link</FormLabel>
                        <Input type="url" value={startupWebsite} onChange={(e) => setStartupWebsite(e.target.value)} placeholder="https://www.yourstartup.com" />
                    </FormControl>
                    <FormControl id="startupVision">
                      <FormLabel>Startup Vision (Detailed)</FormLabel>
                      <Textarea value={startupVision} onChange={(e) => setStartupVision(e.target.value)} rows={5} />
                    </FormControl>

                    <FormControl id="startupStage">
                      <FormLabel>Startup Stage: <Text as="span" fontWeight="semibold" color="blue.600">{startupStage}</Text></FormLabel>
                      <Slider
                        min={0}
                        max={startupStageNames.length - 1}
                        step={1}
                        value={startupStageNames.indexOf(startupStage)}
                        onChange={(val) => setStartupStage(startupStageNames[val])}
                        colorScheme="blue"
                        mt={4}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb boxSize={6} />
                        {startupStageNames.map((stage, index) => (
                          <SliderMark
                            key={index}
                            value={index}
                            mt="4"
                            ml="-2.5"
                            fontSize="sm"
                            color="gray.600"
                          >
                            <Text textAlign="center" fontSize="xs">
                              {stage.split(' / ')[0]}
                            </Text>
                          </SliderMark>
                        ))}
                      </Slider>
                    </FormControl>
                </VStack>
              </TabPanel>

              {/* --- Work History Tab Panel (No Change) --- */}
              <TabPanel>
                <Box w="full">
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md">Your Previous Work Experiences</Heading>
                    <Button onClick={handleOpenAddExperienceModal} colorScheme="green" size="sm">
                      Add New Experience
                    </Button>
                  </Flex>
                  <VStack spacing={4} align="stretch">
                    {sortedWorkExperiences.length === 0 ? (
                      <Text color="gray.500">No previous work experiences added yet.</Text>
                    ) : (
                      sortedWorkExperiences.map((exp) => (
                        <Card key={exp.id} variant="outline" p={4} rounded="md" shadow="sm">
                          <CardHeader p={0} pb={2}>
                            <Flex justify="space-between" align="center">
                              <Box>
                                <Text fontSize="lg" fontWeight="semibold">{exp.jobTitle}</Text>
                                <Text fontSize="md" color="gray.600">{exp.companyName}</Text>
                              </Box>
                              <Flex gap={2}>
                                <Button size="sm" onClick={() => handleOpenEditExperienceModal(exp)}>Edit</Button>
                                <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDeleteExperience(exp.id)}>Delete</Button>
                              </Flex>
                            </Flex>
                          </CardHeader>
                          <CardBody p={0} pb={2}>
                            <Text fontSize="sm" color="gray.500">
                              {formatDate(exp.startDate)} - {formatDate(exp.endDate) || (exp.isCurrent ? 'Present' : '')} {calculateDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                            </Text>
                            {exp.description && (
                              <Text mt={2} fontSize="sm">{exp.description}</Text>
                            )}
                          </CardBody>
                        </Card>
                      ))
                    )}
                  </VStack>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          // --- Talent Role Section (Existing structure) ---
          <VStack spacing={6} align="stretch" w="full">
            <Box w="full">
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Work History / Startup Experience</Heading>
                <Button onClick={handleOpenAddExperienceModal} colorScheme="green" size="sm">
                  Add New Experience
                </Button>
              </Flex>
              <VStack spacing={4} align="stretch">
                {sortedWorkExperiences.length === 0 ? (
                  <Text color="gray.500">No work experiences added yet.</Text>
                ) : (
                  sortedWorkExperiences.map((exp) => (
                    <Card key={exp.id} variant="outline" p={4} rounded="md" shadow="sm">
                      <CardHeader p={0} pb={2}>
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontSize="lg" fontWeight="semibold">{exp.jobTitle}</Text>
                            <Text fontSize="md" color="gray.600">{exp.companyName}</Text>
                          </Box>
                          <Flex gap={2}>
                            <Button size="sm" onClick={() => handleOpenEditExperienceModal(exp)}>Edit</Button>
                            <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDeleteExperience(exp.id)}>Delete</Button>
                          </Flex>
                        </Flex>
                      </CardHeader>
                      <CardBody p={0} pb={2}>
                        <Text fontSize="sm" color="gray.500">
                          {formatDate(exp.startDate)} - {formatDate(exp.endDate) || (exp.isCurrent ? 'Present' : '')} {calculateDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                        </Text>
                        {exp.description && (
                          <Text mt={2} fontSize="sm">{exp.description}</Text>
                        )}
                      </CardBody>
                    </Card>
                  ))
                )}
              </VStack>
            </Box>
            <Divider />

            <FormControl id="skills">
              <FormLabel>Skills</FormLabel>
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type a skill (e.g., React, UI/UX) and press Enter"
              />
              <Flex wrap="wrap" mt={3} gap={2}>
                {skills.map((skill, index) => (
                  <Tag
                    key={index}
                    size="lg"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="green"
                  >
                    <TagLabel>{skill}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveSkill(skill)} />
                  </Tag>
                ))}
              </Flex>
              <Text fontSize="sm" color="gray.500" mt={1}>List your key skills. Type one and press Enter.</Text>
            </FormControl>

            <FormControl id="portfolioLink">
              <FormLabel>Portfolio Link</FormLabel>
              <Input type="url" value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} />
            </FormControl>
            <FormControl id="resumeLink">
              <FormLabel>Resume Link (e.g., Google Drive, Dropbox)</FormLabel>
              <Input type="url" value={resumeLink} onChange={(e) => setResumeLink(e.target.value)} />
            </FormControl>
          </VStack>
        )}

        <Flex justify="flex-end" w="full" mt={6} gap={4}>
          <Button onClick={() => navigate('/profile')} variant="outline" colorScheme="gray">
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={isUpdating}>
            Save Changes
          </Button>
        </Flex>
      </VStack>

      {/* Add/Edit Experience Modal (remains same) */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditingExistingExperience ? 'Edit Experience' : 'Add New Experience'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Company Name</FormLabel>
                <Input
                  value={currentExperience?.companyName || ''}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, companyName: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Job Title</FormLabel>
                <Input
                  value={currentExperience?.jobTitle || ''}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, jobTitle: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={currentExperience?.startDate || ''}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, startDate: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <Stack direction={['column', 'row']} spacing={4} align="center">
                  <FormLabel mb="0">End Date</FormLabel>
                  <Input
                    type="date"
                    value={currentExperience?.endDate || ''}
                    onChange={(e) => setCurrentExperience({ ...currentExperience, endDate: e.target.value })}
                    disabled={currentExperience?.isCurrent}
                  />
                  <Checkbox
                    isChecked={currentExperience?.isCurrent || false}
                    onChange={(e) => setCurrentExperience({ ...currentExperience, isCurrent: e.target.checked, endDate: e.target.checked ? '' : currentExperience?.endDate })}
                  >
                    Present
                  </Checkbox>
                </Stack>
              </FormControl>
              <FormControl>
                <FormLabel>Work Proud To List (Description)</FormLabel>
                <Textarea
                  value={currentExperience?.description || ''}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveExperience}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default EditProfilePage;