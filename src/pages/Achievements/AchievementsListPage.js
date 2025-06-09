import React, { useState, useEffect } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Image,
  Flex,
  Link
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
        if (data.postedBy) {
          const userDocRef = doc(db, 'users', data.postedBy);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            postedByName = userDocSnap.data().name || 'Entrepreneur';
          }
        }
        fetchedAchievements.push({
          id: docSnapshot.id,
          ...data,
          postedByName,
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
                <Heading size="md" color="gray.800">{achievement.title}</Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Posted by: {achievement.postedByName} on {achievement.postedAt?.toDate().toLocaleDateString()}
                </Text>
              </CardHeader>
              <CardBody pt={0}>
                {achievement.imageUrl && (
                  <Image src={achievement.imageUrl} alt={achievement.title} objectFit="cover" borderRadius="md" mb={4} />
                )}
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
