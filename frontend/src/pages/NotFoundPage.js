import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Box, Heading, Text, Button, Link, VStack } from '@chakra-ui/react';

function NotFoundPage() {
  return (
    <VStack
      minH="calc(100vh - 160px)"
      justify="center"
      align="center"
      bg="gray.50"
      p={6}
    >
      <Heading as="h1" fontSize="6xl" color="gray.800" mb={4}>
        404
      </Heading>
      <Text fontSize="xl" color="gray.600" mb={8}>
        Page Not Found
      </Text>
      <Link as={ReactRouterLink} to="/dashboard" _hover={{ textDecoration: 'none' }}>
        <Button
          colorScheme="blue"
          size="lg"
          borderRadius="full"
        >
          Go to Dashboard
        </Button>
      </Link>
    </VStack>
  );
}

export default NotFoundPage;
