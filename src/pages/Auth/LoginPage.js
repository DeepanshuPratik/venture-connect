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
  Link,
  Flex, // Ensure Flex is imported for the outer container
  useToast // Chakra's toast for better notifications
} from '@chakra-ui/react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Logged in successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Flex align="center" justify="center" minH="calc(100vh - 160px)" bg="gray.100">
      <Box bg="white" p={8} rounded="lg" shadow="md" w="full" maxW="md">
        <Heading as="h2" size="xl" textAlign="center" color="gray.800" mb={6}>
          Login
        </Heading>
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        )}
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            width="full"
            isLoading={loading}
            loadingText="Logging in..."
            borderRadius="full"
            mt={4}
          >
            Login
          </Button>
        </VStack>
        <Text textAlign="center" color="gray.600" fontSize="sm" mt={4}>
          Don't have an account?{' '}
          <Link as={ReactRouterLink} to="/signup" color="blue.600" _hover={{ textDecoration: 'underline' }}>
            Sign Up
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}

export default LoginPage;