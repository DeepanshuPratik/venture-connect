import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Flex, Text, Image, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import MyCustomLogo from '../assets/logo_vc2.png'; // Make sure this path is correct

// Variants for the landing page elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Delay children animations
      delayChildren: 0.5,   // Delay start of children animations
    },
  },
  // Exit variant for the entire landing page
  exit: {
    opacity: 0,
    transition: {
      duration: 1.2, // Landing page fades out over 1.2 seconds
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

function LandingIntroPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // After initial intro animation (e.g., 2 seconds), start fading out and navigate
    const timer = setTimeout(() => {
      navigate('/login'); // Navigate to login/signup after intro finishes
    }, 2000); // Wait 2 seconds for intro elements to appear and settle

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      <motion.div
        key="landingPage" // Key for AnimatePresence to track this component
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit" // Apply exit animation when this component unmounts
        style={{
          position: 'fixed', // Make it fixed to cover the entire screen during transition
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #2A4365, #5A67D8)', // Dark blue to indigo gradient
          color: 'white',
          textAlign: 'center',
          zIndex: 1000, // Ensure it's on top during transition
          overflow: 'hidden',
        }}
      >
        <VStack spacing={6}>
          <motion.div variants={itemVariants}>
            <Box bg="white" p="2" borderRadius="lg" lineHeight="0" shadow="xl">
              <Image src={MyCustomLogo} alt="VentureConnect Logo" boxSize="100px" objectFit="contain" />
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Text fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }} fontWeight="extrabold">
              VentureConnect
            </Text>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Text fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} fontStyle="italic" opacity="0.8">
              Empowering Entrepreneurial Journeys & Opportunities
            </Text>
          </motion.div>
        </VStack>
      </motion.div>
    </AnimatePresence>
  );
}

export default LandingIntroPage;