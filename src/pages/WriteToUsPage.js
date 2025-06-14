import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  useToast,
  Flex,
  Icon,
  Spinner, // Import Spinner for loading state
} from '@chakra-ui/react';
import { FaPaperPlane, FaLightbulb, FaRocket, FaBug, FaCommentDots } from 'react-icons/fa'; // Icons for categories

function WriteToUsPage() {
  const { currentUser, userProfile } = useAuth();
  const toast = useToast();

  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionSuccess(false); // Reset on new submission

    if (!category || !subject || !message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields (Category, Subject, Message).',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'feedback'), {
        category,
        subject,
        message,
        userId: currentUser?.uid || null, // Record user ID if logged in
        userName: userProfile?.name || 'Anonymous', // Record user name
        userEmail: currentUser?.email || 'N/A', // Record user email
        createdAt: serverTimestamp(),
      });

      setSubmissionSuccess(true); // Indicate success for UI changes
      toast({
        title: 'Feedback Sent!',
        description: 'Thank you for your valuable input. We appreciate your insights!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Clear form fields
      setCategory('');
      setSubject('');
      setMessage('');

      // Auto-hide success animation after a short delay
      setTimeout(() => setSubmissionSuccess(false), 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission Failed',
        description: `There was an error sending your feedback: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Framer Motion variants for subtle page entry animation
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  // Framer Motion variants for the submission success animation
  const submissionSuccessVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { scale: 1.2, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{
        flexGrow: 1, // Ensure page takes up available space in main content area
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
        background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)', // Dark gradient background
        padding: '2rem 0', // Some vertical padding
      }}
    >
      <Box
        maxW="3xl" // Increased max-width for more content space
        mx="auto"
        px={8} // Horizontal padding
        py={10} // Vertical padding
        bg="gray.800" // Dark background
        rounded="2xl" // More rounded corners
        shadow="dark-lg" // Darker, more diffused shadow (custom shadow, check Chakra theme or add to global CSS if not defined)
        border="1px solid"
        borderColor="gray.700" // Subtle border for definition
        color="white" // White text for contrast
        position="relative" // For absolute positioning of success animation
        overflow="hidden" // Hide overflow during animations
        zIndex="1" // Ensure form is above any background animations
      >
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" textAlign="center" color="cyan.300">
            <Icon as={FaPaperPlane} mr={3} />
            Share Your Vision With Us
          </Heading>
          <Text textAlign="center" fontSize="lg" color="gray.300">
            Your insights are crucial for VentureConnect's evolution. Tell us how we can improve,
            what features you'd love, or any advice for our journey!
          </Text>

          <Box
            bg="gray.700" // Slightly lighter background for the form area
            p={6}
            rounded="xl"
            border="1px solid"
            borderColor="gray.600"
          >
            <VStack as="form" spacing={5} onSubmit={handleSubmit}>
              <FormControl id="category" isRequired>
                <FormLabel color="cyan.200">Category</FormLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Select category"
                  bg="gray.600" // Darker background for select
                  color="white" // Ensure text is visible
                  borderColor="gray.500"
                  _hover={{ borderColor: 'cyan.400' }}
                  _focus={{ borderColor: 'cyan.400', boxShadow: '0 0 0 1px var(--chakra-colors-cyan-400)' }}
                  // Style for options dropdown to ensure they are visible on dark background
                  sx={{
                    '& > option': {
                      background: '#2D3748', // Dark background for options
                      color: 'white',        // White text for options
                    },
                  }}
                >
                  <option value="feature_request">
                    Feature Request
                  </option>
                  <option value="expansion_advice">
                    Expansion Advice
                  </option>
                  <option value="general_feedback">General Feedback</option>
                  <option value="bug_report">
                    Bug Report
                  </option>
                </Select>
              </FormControl>

              <FormControl id="subject" isRequired>
                <FormLabel color="cyan.200">Subject</FormLabel>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="A concise summary of your feedback"
                  bg="gray.600"
                  color="white"
                  borderColor="gray.500"
                  _placeholder={{ color: 'gray.400' }}
                  _hover={{ borderColor: 'cyan.400' }}
                  _focus={{ borderColor: 'cyan.400', boxShadow: '0 0 0 1px var(--chakra-colors-cyan-400)' }}
                />
              </FormControl>

              <FormControl id="message" isRequired>
                <FormLabel color="cyan.200">Your Message</FormLabel>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Elaborate on your ideas, suggestions, or advice here..."
                  rows={6}
                  bg="gray.600"
                  color="white"
                  borderColor="gray.500"
                  _placeholder={{ color: 'gray.400' }}
                  _hover={{ borderColor: 'cyan.400' }}
                  _focus={{ borderColor: 'cyan.400', boxShadow: '0 0 0 1px var(--chakra-colors-cyan-400)' }}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="cyan" // Changed to cyan for a more futuristic look
                size="lg"
                width="full"
                isLoading={isSubmitting}
                rightIcon={!isSubmitting && <Icon as={FaPaperPlane} />}
                mt={4}
                py={7} // Larger button for more presence
                _hover={{ bg: 'cyan.600'}} // Glowing hover
                _active={{ bg: 'cyan.700' }}
              >
                Submit Feedback
              </Button>
            </VStack>
          </Box>
        </VStack>

        {/* Submission Success Animation (overlay) */}
        <AnimatePresence>
          {submissionSuccess && (
            <motion.div
              variants={submissionSuccessVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.8)', // Semi-transparent black overlay
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                zIndex: 2,
                borderRadius: 'inherit', // Match parent's border radius
                backdropFilter: 'blur(5px)', // Subtle blur for the overlay
              }}
            >
              <VStack spacing={4}>
                <Icon as={FaPaperPlane} boxSize={24} color="green.400" />
                <Heading size="xl" color="green.300">Feedback Sent!</Heading>
                <Text fontSize="lg" color="gray.300">Your vision is now in orbit.</Text>
              </VStack>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
}

export default WriteToUsPage;