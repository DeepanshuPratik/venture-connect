import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // No need for useNavigate here

import { useAuth } from '../../contexts/AuthContext';import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  Flex,
  Divider,
  Icon
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast({
        title: "Google Sign-In Failed",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex align="center" justify="center" minH="calc(100vh - 64px - 60px)">
      <Box bg="white" p={8} rounded="lg" shadow="md" w="full" maxW="md">
        <Text as="h2" fontSize="3xl" fontWeight="bold" textAlign="center" color="gray.800" mb={6}>
          Login
        </Text>
        {error && (
          <Box bg="red.100" border="1px" borderColor="red.400" color="red.700" px={4} py={3} rounded="md" mb={4}>
            <Text>{error}</Text>
          </Box>
        )}
        <form onSubmit={handleSubmit}>
          <FormControl id="email-login" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormControl>
          <FormControl id="password-login" mb={6}>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </FormControl>
          <Button type="submit" colorScheme="blue" w="full" isLoading={loading}>
            Login
          </Button>
        </form>
        <Flex align="center" my={6}>
          <Divider />
          <Text px={4} color="gray.500" whiteSpace="nowrap">OR</Text>
          <Divider />
        </Flex>
        <Button w="full" variant="outline" leftIcon={<Icon as={FaGoogle} />} onClick={handleGoogleSignIn}>
          Sign in with Google
        </Button>
        <Text textAlign="center" color="gray.600" fontSize="sm" mt={4}>
          Don't have an account? <Link to="/signup" style={{ color: 'blue', textDecoration: 'underline' }}>Sign Up</Link>
        </Text>
      </Box>
    </Flex>
  );
}

export default LoginPage;