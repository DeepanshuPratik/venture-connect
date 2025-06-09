import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

function Footer() {
  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const textColor = useColorModeValue('white', 'gray.300');

  return (
    <Box bg={bgColor} p={4} textAlign="center" mt={8} color={textColor}>
      <Text fontSize="sm">© {new Date().getFullYear()} VentureConnect. All rights reserved.</Text>
      <Text fontSize="xs" mt={2}>
        Made with ❤️ for the entrepreneurial community.
      </Text>
    </Box>
  );
}

export default Footer;
