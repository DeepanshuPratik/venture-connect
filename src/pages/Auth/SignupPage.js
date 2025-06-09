import React, { useState } from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Correct relative path
import {
  Box,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  Text,
  Alert,
  AlertIcon,
  VStack,
  RadioGroup,
  Stack,
  Radio,
  Link,
  Flex, // Ensure Flex is imported for the outer container
  useToast
} from '@chakra-ui/react';

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('talent'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setError('');
    setLoading(true);
    try {
      await signup(email, password, role, name);
      toast({
        title: "Account created successfully!",
        description: "Welcome to VentureConnect!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Flex align="center" justify="center" minH="calc(100vh - 160px)" bg="gray.100">
      <Box bg="white" p={8} rounded="lg" shadow="md" w="full" maxW="md">
        <Heading as="h2" size="xl" textAlign="center" color="gray.800" mb={6}>
          Sign Up
        </Heading>
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        )}
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <FormControl id="name" isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <FormControl id="confirmPassword" isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>
          <FormControl as="fieldset">
            <FormLabel as="legend">I am a:</FormLabel>
            <RadioGroup onChange={setRole} value={role}>
              <Stack direction="row" spacing={6}>
                <Radio value="entrepreneur">Entrepreneur</Radio>
                <Radio value="talent">Talent</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            width="full"
            isLoading={loading}
            loadingText="Signing Up..."
            borderRadius="full"
            mt={4}
          >
            Sign Up
          </Button>
        </VStack>
        <Text textAlign="center" color="gray.600" fontSize="sm" mt={4}>
          Already have an account?{' '}
          <Link as={ReactRouterLink} to="/login" color="blue.600" _hover={{ textDecoration: 'underline' }}>
            Login
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}

export default SignupPage;
