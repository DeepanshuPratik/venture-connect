import React, { useState, useEffect } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';

import { useAuth } from '../../contexts/AuthContext';import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  // Removed: Image
  Flex,
  Link,
  VStack,
  HStack,
  Avatar,
  Tag,
} from '@chakra-ui/react';

function AchievementsListPage() {
  const [achievements, setAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [error, setError] = useState('');
  const { userProfile } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'achievements'), orderBy('postedAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedAchievements = [];
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        let postedByName = 'Unknown';
        let authorRole = ''; // Also fetch author role
        if (data.postedBy) {
          const userDocRef = doc(db, 'users', data.postedBy);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            postedByName = userData.name || 'Entrepreneur';
            authorRole = userData.role || '';
          }
        }
        fetchedAchievements.push({
          id: docSnapshot.id,
          ...data,
          postedByName,
          authorRole, // Add author role to achievement data
          postedAt: data.postedAt?.toDate().toLocaleDateString(),
        });
      }
      setAchievements(fetchedAchievements);
      setLoadingAchievements(false);
    }, (err) => {
      console.error("Error fetching achievements:", err);
      setError("Failed to load achievements.");
      setLoadingAchievements(false);
    });

    return () => unsubscribe();
  }, []);

  if (loadingAchievements) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Text color="red.600" textAlign="center" fontSize="lg" mt={8}>{error}</Text>;
  }

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl" color="gray.800">Community Achievements</Heading>
        {userProfile && userProfile.role === 'entrepreneur' && (
          <Link as={ReactRouterLink} to="/achievements/new" _hover={{ textDecoration: 'none' }}>
            <Button colorScheme="blue" size="md" borderRadius="full">
              Post Your Achievement
            </Button>
          </Link>
        )}
      </Flex>

      {achievements.length === 0 ? (
        <Text color="gray.600" fontSize="lg" textAlign="center" mt={8}>No achievements posted yet. Be the first!</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {achievements.map((achievement) => (
            <Card key={achievement.id} bg="gray.50" shadow="sm" border="1px" borderColor="gray.200">
              <CardHeader pb={2}>
                <Flex align="center" gap={3}>
                  {/* Display Avatar if you like, even without image upload capability */}
                  <Avatar name={achievement.postedByName} size="md" />
                  <VStack align="flex-start" spacing={0}>
                    <Heading size="md" color="gray.800">{achievement.title}</Heading>
                    <Text fontSize="sm" color="gray.600">
                      By {achievement.postedByName}{' '}
                      {achievement.authorRole && (
                        <Tag size="sm" colorScheme={achievement.authorRole === 'entrepreneur' ? 'purple' : 'blue'} ml={1}>
                          {achievement.authorRole}
                        </Tag>
                      )}
                    </Text>
                    <Text fontSize="xs" color="gray.500">{achievement.postedAt}</Text>
                  </VStack>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                {/* Removed: Image component */}
                {/* {achievement.imageUrl && (
                  <Image src={achievement.imageUrl} alt={achievement.title} objectFit="cover" borderRadius="md" mb={4} />
                )} */}
                <Text noOfLines={4} color="gray.700" lineHeight="tall">{achievement.description}</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default AchievementsListPage;