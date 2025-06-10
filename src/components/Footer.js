import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Box, Text, Link } from '@chakra-ui/react';

function Footer() {
  return (
    <Box bg="gray.800" color="white" p="4" textAlign="center" mt="auto">
      <Box maxW="container.xl" mx="auto">
        <Text>© {new Date().getFullYear()} VentureConnect. All rights reserved.</Text>
        <Text fontSize="sm" mt={2}>
          Made with ❤️ for the entrepreneurial community.
        </Text>
        <Link as={ReactRouterLink} to="/write-to-us" color="blue.300" fontSize="sm" mt={1} display="block" _hover={{ textDecoration: 'underline' }}>
          Write to Us / Feature Request
        </Link>
      </Box>
    </Box>
  );
}

export default Footer;