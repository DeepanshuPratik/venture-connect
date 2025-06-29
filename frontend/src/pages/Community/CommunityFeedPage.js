import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Image,
  Flex,
  Tag,
  VStack,
  HStack,
  Avatar,
  Divider, // Import Divider
} from '@chakra-ui/react';

function CommunityFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'achievements'), orderBy('postedAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedPosts = [];
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        let authorName = 'Unknown User';
        let authorRole = '';
        if (data.postedBy) {
          const userDocRef = doc(db, 'users', data.postedBy);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            authorName = userData.name || 'Anonymous Entrepreneur';
            authorRole = userData.role || '';
          }
        }
        fetchedPosts.push({
          id: docSnapshot.id,
          ...data,
          authorName,
          authorRole,
          postedAt: data.postedAt?.toDate().toLocaleDateString(),
        });
      }
      setPosts(fetchedPosts);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching community posts:", err);
      setError("Failed to load community posts.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Text color="red.600" textAlign="center" fontSize="lg" mt={8}>{error}</Text>;
  }

  const isVideo = (url) => {
    return url && url.match(/\.(mp4|webm|ogg)$/i);
  };

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={6} textAlign="center">
        Community Posts & Achievements
      </Heading>
      <Text fontSize="lg" color="gray.700" mb={8} textAlign="center">
        See the latest milestones and updates from entrepreneurs.
      </Text>

      {posts.length === 0 ? (
        <Text color="gray.600" fontSize="lg" textAlign="center" mt={8}>No posts available yet. Be the first to share an achievement!</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {posts.map((post) => (
            <Card key={post.id} bg="gray.50" shadow="sm" border="1px" borderColor="gray.200">
              <CardHeader pb={2}>
                <Flex align="center" gap={3}>
                  <Avatar name={post.authorName} size="md" />
                  <VStack align="flex-start" spacing={0}>
                    <Heading size="md" color="gray.800">{post.title}</Heading>
                    <Text fontSize="sm" color="gray.600">
                      By {post.authorName} {post.authorRole && <Tag size="sm" colorScheme={post.authorRole === 'entrepreneur' ? 'purple' : 'blue'} ml={1}>{post.authorRole}</Tag>}
                    </Text>
                    <Text fontSize="xs" color="gray.500">{post.postedAt}</Text>
                  </VStack>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <Text noOfLines={4} color="gray.700" lineHeight="tall">{post.description}</Text>
                
                {/* --- MEDIA MOVED TO THE BOTTOM OF THE CARD BODY --- */}
                {post.mediaUrl && (
                  <Box mt={4} pt={4} borderTop="1px" borderColor="gray.200">
                    {isVideo(post.mediaUrl) ? (
                      <video
                        src={post.mediaUrl}
                        controls
                        style={{
                          width: '100%',
                          maxHeight: '300px', // Allow more height for videos
                          borderRadius: 'var(--chakra-radii-md)',
                        }}
                      />
                    ) : (
                      <Image
                        src={post.mediaUrl}
                        alt={post.title}
                        objectFit="cover"
                        borderRadius="md"
                        h="200px"
                        w="full"
                      />
                    )}
                  </Box>
                )}
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default CommunityFeedPage;