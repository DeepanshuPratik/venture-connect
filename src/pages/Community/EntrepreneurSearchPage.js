import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Box,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  VStack,
  HStack,
  Tag,
  Divider,
  Icon,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  Button
} from '@chakra-ui/react';
import { FaSearch, FaUserTie } from 'react-icons/fa'; // Import icons

function EntrepreneurSearchPage() {
  const [allEntrepreneurs, setAllEntrepreneurs] = useState([]);
  const [filteredEntrepreneurs, setFilteredEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSkills, setFilterSkills] = useState(''); // New filter for skills

  const startupStageNames = [
    '', // All stages
    'Ideation / Discovery',
    'MVP / Early Traction',
    'Seed Stage / Fundraising',
    'Growth / Scaling'
  ];

  const startupTypeOptions = [
    '', // All types
    'SaaS', 'E-commerce', 'Fintech', 'AI / Machine Learning', 'Healthcare / Biotech',
    'EdTech', 'Deep Tech', 'Consumer Goods', 'Logistics / Supply Chain',
    'Media / Entertainment', 'Hardware', 'Biotech', 'CleanTech / Greentech',
    'Social Impact', 'Other'
  ];

  useEffect(() => {
    // Fetch all users, then filter locally for 'entrepreneur' role
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const entrepreneurs = users.filter(user => user.role === 'entrepreneur');
      setAllEntrepreneurs(entrepreneurs);
      setFilteredEntrepreneurs(entrepreneurs); // Initialize filtered with all entrepreneurs
      setLoading(false);
    }, (err) => {
      console.error("Error fetching users:", err);
      setError("Failed to load entrepreneurs.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let currentFiltered = allEntrepreneurs;

    // Filter by search term (name)
    if (searchTerm) {
      currentFiltered = currentFiltered.filter(entrepreneur =>
        entrepreneur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entrepreneur.startupVision?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by startup stage
    if (filterStage) {
      currentFiltered = currentFiltered.filter(entrepreneur =>
        entrepreneur.startupStage === filterStage
      );
    }

    // Filter by startup type
    if (filterType) {
      currentFiltered = currentFiltered.filter(entrepreneur =>
        entrepreneur.startupType === filterType
      );
    }

    // Filter by skills (entrepreneurs might list some skills too, or could be used for talent search later)
    if (filterSkills) {
        const searchSkillsArray = filterSkills.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
        currentFiltered = currentFiltered.filter(entrepreneur =>
            entrepreneur.skills && searchSkillsArray.some(skill =>
                entrepreneur.skills.map(s => s.toLowerCase()).includes(skill)
            )
        );
    }

    setFilteredEntrepreneurs(currentFiltered);
  }, [searchTerm, filterStage, filterType, filterSkills, allEntrepreneurs]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Text color="red.600" textAlign="center" fontSize="lg" mt={8}>{error}</Text>;
  }

  return (
    <Box maxW="container.xl" mx="auto" p={6} bg="white" rounded="lg" shadow="md">
      <Heading as="h1" size="xl" color="gray.800" mb={6} textAlign="center">
        Discover Entrepreneurs & Startups
      </Heading>

      <VStack spacing={4} mb={8} align="stretch">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search by name, startup vision, or skills"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <HStack spacing={4} wrap="wrap">
          <FormControl flex="1" minW="150px">
            <FormLabel htmlFor="filterStage">Startup Stage</FormLabel>
            <Select id="filterStage" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
              {startupStageNames.map((stage, index) => (
                <option key={index} value={stage}>{stage || "All Stages"}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl flex="1" minW="150px">
            <FormLabel htmlFor="filterType">Startup Type</FormLabel>
            <Select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              {startupTypeOptions.map((type, index) => (
                <option key={index} value={type}>{type || "All Types"}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl flex="1" minW="150px">
            <FormLabel htmlFor="filterSkills">Skills (comma-separated)</FormLabel>
            <Input
              id="filterSkills"
              placeholder="e.g., AI, SaaS, React"
              value={filterSkills}
              onChange={(e) => setFilterSkills(e.target.value)}
            />
          </FormControl>
        </HStack>
      </VStack>

      {filteredEntrepreneurs.length === 0 ? (
        <Text color="gray.600" fontSize="lg" textAlign="center" mt={8}>No entrepreneurs found matching your criteria.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredEntrepreneurs.map((entrepreneur) => (
            <Card key={entrepreneur.id} bg="gray.50" shadow="sm" border="1px" borderColor="gray.200" display="flex" flexDirection="column" justifyContent="space-between">
              <CardHeader pb={2}>
                <HStack align="center" spacing={3}>
                    <Icon as={FaUserTie} color="blue.600" w={6} h={6}/>
                    <Heading size="md" color="gray.800">{entrepreneur.name}</Heading>
                </HStack>
                <Text fontSize="sm" color="gray.600" mt={1}>Role: <Tag size="sm" colorScheme="purple">Entrepreneur</Tag></Text>
              </CardHeader>
              <CardBody pt={0}>
                {entrepreneur.startupVision && (
                    <Box mb={3}>
                        <Text fontWeight="semibold" color="gray.800" mb={1}>Startup Vision:</Text>
                        <Text noOfLines={2} fontSize="sm" color="gray.700">{entrepreneur.startupVision}</Text>
                    </Box>
                )}
                {entrepreneur.startupStage && (
                    <Box mb={3}>
                        <Text fontWeight="semibold" color="gray.800" mb={1}>Stage:</Text>
                        <Tag size="sm" colorScheme="teal">{entrepreneur.startupStage}</Tag>
                    </Box>
                )}
                {entrepreneur.startupType && (
                    <Box mb={3}>
                        <Text fontWeight="semibold" color="gray.800" mb={1}>Type:</Text>
                        <Tag size="sm" colorScheme="orange">{entrepreneur.startupType}</Tag>
                    </Box>
                )}
                {entrepreneur.skills && entrepreneur.skills.length > 0 && (
                    <Box mb={3}>
                        <Text fontWeight="semibold" color="gray.800" mb={1}>Skills:</Text>
                        <HStack flexWrap="wrap">
                            {entrepreneur.skills.map((skill, i) => (
                                <Tag key={i} colorScheme="cyan" size="sm">{skill}</Tag>
                            ))}
                        </HStack>
                    </Box>
                )}
              </CardBody>
              <Button size="sm" colorScheme="blue" variant="outline" mx={4} mb={4} borderRadius="full">
                View Profile (Future Feature)
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default EntrepreneurSearchPage;