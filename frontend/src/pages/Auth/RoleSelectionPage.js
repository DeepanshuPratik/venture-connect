import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';import { db } from '../../firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Text,
  useToast,
  Flex,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  VStack,
} from '@chakra-ui/react';

function RoleSelectionPage() {
  const [role, setRole] = useState('talent');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to select a role.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        role: role,
        needsRoleSelection: false, // Crucially, set this to false
      });
      toast({
        title: "Role Selected!",
        description: "Welcome to VentureConnect!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Navigate to the dashboard after role is successfully set.
      // The onSnapshot listener in AuthContext will pick up the change,
      // and the app will re-render, allowing access to the dashboard.
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Could not set your role. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Error updating role:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" minH="100vh" bg="gray.50">
      <Box bg="white" p={8} rounded="lg" shadow="xl" w="full" maxW="md">
        <VStack spacing={6}>
          <Heading as="h1" size="lg" textAlign="center">
            One Last Step!
          </Heading>
          <Text textAlign="center" color="gray.600">
            To personalize your experience, please tell us what brings you to VentureConnect.
          </Text>
          <FormControl as="fieldset">
            <FormLabel as="legend" textAlign="center" fontWeight="bold" mb={4}>I am an...</FormLabel>
            <RadioGroup onChange={setRole} value={role}>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                spacing={6}
                justify="center"
              >
                <Box
                  p={4}
                  border="2px solid"
                  borderColor={role === 'entrepreneur' ? 'blue.400' : 'gray.200'}
                  borderRadius="lg"
                  cursor="pointer"
                  onClick={() => setRole('entrepreneur')}
                  transition="all 0.2s"
                >
                  <Radio value="entrepreneur" colorScheme="blue">
                    <Text fontWeight="bold" ml={2}>Entrepreneur</Text>
                    <Text fontSize="sm" color="gray.500" ml={8}>I'm building a startup and looking for talent.</Text>
                  </Radio>
                </Box>
                <Box
                  p={4}
                  border="2px solid"
                  borderColor={role === 'talent' ? 'blue.400' : 'gray.200'}
                  borderRadius="lg"
                  cursor="pointer"
                  onClick={() => setRole('talent')}
                  transition="all 0.2s"
                >
                  <Radio value="talent" colorScheme="blue">
                    <Text fontWeight="bold" ml={2}>Talent</Text>
                    <Text fontSize="sm" color="gray.500" ml={8}>I'm looking for an exciting startup to join.</Text>
                  </Radio>
                </Box>
              </Stack>
            </RadioGroup>
          </FormControl>
          <Button
            colorScheme="blue"
            w="full"
            isLoading={loading}
            onClick={handleSubmit}
            size="lg"
          >
            Continue to VentureConnect
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}

export default RoleSelectionPage;