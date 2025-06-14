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
  Icon,
  Radio,
  RadioGroup,
  Stack
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('talent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
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
    } catch (err) {
      setError('Failed to create an account. ' + err.message);
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
    <Flex align="center" justify="center" minH="calc(100vh - 64px - 60px)" py={6}>
      <Box bg="white" p={8} rounded="lg" shadow="md" w="full" maxW="md">
        <Text as="h2" fontSize="3xl" fontWeight="bold" textAlign="center" color="gray.800" mb={6}>
          Create Account
        </Text>
        {error && (
          <Box bg="red.100" border="1px" borderColor="red.400" color="red.700" px={4} py={3} rounded="md" mb={4}>
            <Text>{error}</Text>
          </Box>
        )}
        <form onSubmit={handleSubmit}>
          <FormControl id="name-signup" mb={4}>
            <FormLabel>Full Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </FormControl>
          <FormControl id="email-signup" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormControl>
          <FormControl id="password-signup" mb={4}>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </FormControl>
          <FormControl id="confirmPassword-signup" mb={6}>
            <FormLabel>Confirm Password</FormLabel>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </FormControl>
          <FormControl as="fieldset" mb={6}>
            <FormLabel as="legend">I am a:</FormLabel>
            <RadioGroup onChange={setRole} value={role}>
              <Stack direction="row" spacing={6}>
                <Radio value="entrepreneur">Entrepreneur</Radio>
                <Radio value="talent">Talent</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          <Button type="submit" colorScheme="blue" w="full" isLoading={loading}>
            Sign Up
          </Button>
        </form>
        <Flex align="center" my={6}>
          <Divider />
          <Text px={4} color="gray.500" whiteSpace="nowrap">OR</Text>
          <Divider />
        </Flex>
        <Button w="full" variant="outline" leftIcon={<Icon as={FaGoogle} />} onClick={handleGoogleSignIn}>
          Sign up with Google
        </Button>
        <Text textAlign="center" color="gray.600" fontSize="sm" mt={4}>
          Already have an account? <Link to="/login" style={{ color: 'blue', textDecoration: 'underline' }}>Login</Link>
        </Text>
      </Box>
    </Flex>
  );
}

export default SignupPage;