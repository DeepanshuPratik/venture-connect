import React from 'react';
import { Flex, Spinner } from '@chakra-ui/react';

function LoadingSpinner() {
  return (
    <Flex justify="center" align="center" height="full" minH="calc(100vh - 160px)">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Flex>
  );
}

export default LoadingSpinner;
