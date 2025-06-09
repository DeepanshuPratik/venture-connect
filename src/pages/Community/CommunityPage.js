import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Box, Heading, Text, SimpleGrid, Card, CardHeader, CardBody, Link, Icon } from '@chakra-ui/react';
import { FaUserTie, FaClipboardList } from 'react-icons/fa'; // Import icons for community cards

function CommunityPage() {
  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={6} textAlign="center">
        Welcome to the VentureConnect Community!
      </Heading>
      <Text fontSize="lg" color="gray.700" mb={8} textAlign="center">
        Explore and connect with fellow entrepreneurs and talented individuals.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <Link as={ReactRouterLink} to="/community/entrepreneurs" _hover={{ textDecoration: 'none' }}>
          <Card
            height="100%"
            bg="blue.50"
            border="1px"
            borderColor="blue.200"
            shadow="md"
            transition="all 0.2s"
            _hover={{ shadow: "lg", transform: "translateY(-5px)" }}
            cursor="pointer"
          >
            <CardHeader display="flex" alignItems="center" gap={3}>
              <Icon as={FaUserTie} w={8} h={8} color="blue.600" />
              <Heading size="md" color="blue.700">Find Entrepreneurs & Startups</Heading>
            </CardHeader>
            <CardBody>
              <Text color="gray.600">
                Discover innovative founders and their ventures. Search by industry, stage, or skills to connect.
              </Text>
            </CardBody>
          </Card>
        </Link>

        <Link as={ReactRouterLink} to="/community/feed" _hover={{ textDecoration: 'none' }}>
          <Card
            height="100%"
            bg="green.50"
            border="1px"
            borderColor="green.200"
            shadow="md"
            transition="all 0.2s"
            _hover={{ shadow: "lg", transform: "translateY(-5px)" }}
            cursor="pointer"
          >
            <CardHeader display="flex" alignItems="center" gap={3}>
              <Icon as={FaClipboardList} w={8} h={8} color="green.600" />
              <Heading size="md" color="green.700">Browse Community Posts</Heading>
            </CardHeader>
            <CardBody>
              <Text color="gray.600">
                See the latest achievements, milestones, and journey updates shared by entrepreneurs.
              </Text>
            </CardBody>
          </Card>
        </Link>
      </SimpleGrid>

      {/* Placeholder for future sections like Meetups, Journey Articles etc. */}
      <Box mt={10} p={6} bg="gray.50" rounded="lg" border="1px" borderColor="gray.200">
        <Heading size="md" mb={2} color="gray.700">More to Come!</Heading>
        <Text color="gray.600">
          We're constantly expanding VentureConnect. Look out for new features like community meetups, entrepreneurial journey articles, and more!
        </Text>
      </Box>
    </Box>
  );
}

export default CommunityPage;