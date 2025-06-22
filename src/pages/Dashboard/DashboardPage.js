import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  orderBy,
} from "firebase/firestore";

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  VStack,
  HStack,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Avatar,
  Link as ChakraLink,
  useToast,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  FaUserGraduate,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

function DashboardPage() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const [myJobPostings, setMyJobPostings] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [myAchievements, setMyAchievements] = useState([]);
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [interestedTalentDetails, setInterestedTalentDetails] = useState([]);
  const [isFetchingInterestedDetails, setIsFetchingInterestedDetails] =
    useState(false);

  const [jobsLoading, setJobsLoading] = useState(true);
  const [achievementsLoading, setAchievementsLoading] = useState(true);

  // Effect to fetch all entrepreneur-specific data
  useEffect(() => {
    if (authLoading || !currentUser || userProfile?.role !== "entrepreneur") {
      setJobsLoading(false);
      setAchievementsLoading(false);
      return;
    }

    const jobsQuery = query(
      collection(db, "job_posts"),
      where("postedBy", "==", currentUser.uid),
      orderBy("postedAt", "desc")
    );
    const unsubscribeJobs = onSnapshot(
      jobsQuery,
      (snapshot) => {
        setMyJobPostings(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setJobsLoading(false);
      },
      (error) => {
        console.error("Error fetching job postings:", error);
        toast({
          title: "Error",
          description: "Could not load job postings.",
          status: "error",
        });
        setJobsLoading(false);
      }
    );

    const achievementsQuery = query(
      collection(db, "achievements"),
      where("postedBy", "==", currentUser.uid),
      orderBy("postedAt", "desc")
    );
    const unsubscribeAchievements = onSnapshot(
      achievementsQuery,
      (snapshot) => {
        setMyAchievements(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setAchievementsLoading(false);
      },
      (error) => {
        console.error("Error fetching achievements:", error);
        toast({
          title: "Error",
          description: "Could not load achievements.",
          status: "error",
        });
        setAchievementsLoading(false);
      }
    );

    return () => {
      unsubscribeJobs();
      unsubscribeAchievements();
    };
  }, [authLoading, currentUser, userProfile, toast]);

  const handleViewInterested = async (jobPost) => {
    setSelectedJobForModal(jobPost);
    setIsFetchingInterestedDetails(true);
    setInterestedTalentDetails([]);
    onOpen();

    try {
      if (jobPost.interestedUsers && jobPost.interestedUsers.length > 0) {
        const talentPromises = jobPost.interestedUsers.map((uid) =>
          getDoc(doc(db, "users", uid))
        );
        const userDocs = await Promise.all(talentPromises);
        const fetchedTalent = userDocs
          .filter((docSnap) => docSnap.exists())
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        setInterestedTalentDetails(fetchedTalent);
      }
    } catch (err) {
      console.error("Error fetching interested talent details:", err);
      toast({
        title: "Error",
        description: "Could not fetch talent details.",
        status: "error",
      });
    } finally {
      setIsFetchingInterestedDetails(false);
    }
  };

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    try {
      const docRef = doc(db, "job_posts", jobId);
      await updateDoc(docRef, { status: newStatus });
      toast({
        title: `Job ${newStatus}`,
        description: `The job post has been successfully ${newStatus}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Toggling job status failed:`, error);
      toast({
        title: "Error",
        description: `Could not update the job status.`,
        status: "error",
      });
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    if (
      window.confirm("Are you sure you want to delete this achievement post?")
    ) {
      try {
        await deleteDoc(doc(db, "achievements", achievementId));
        toast({ title: "Post Deleted", status: "success" });
      } catch (error) {
        console.error("Error deleting achievement: ", error);
        toast({
          title: "Error",
          description: "Failed to delete the post.",
          status: "error",
        });
      }
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box
      maxW="container.xl"
      mx="auto"
      px={6}
      py={8}
      bg="white"
      rounded="lg"
      shadow="md"
    >
      <Heading as="h1" size="2xl" mb={6}>
        Welcome, {userProfile?.name}!
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={10}>
        <Card bg="blue.50" variant="outline" borderColor="blue.200">
          <CardHeader>
            <Heading size="md" color="blue.700">
              Your Profile
            </Heading>
          </CardHeader>
          <CardBody>
            <Text color="gray.600">
              Keep your profile updated for better connections.
            </Text>
            <Button
              mt={4}
              colorScheme="blue"
              onClick={() => navigate("/profile")}
            >
              View My Profile
            </Button>
          </CardBody>
        </Card>
        {userProfile?.role === "entrepreneur" ? (
          <>
            <Card bg="green.50" variant="outline" borderColor="green.200">
              <CardHeader>
                <Heading size="md" color="green.700">
                  Post a Job
                </Heading>
              </CardHeader>
              <CardBody>
                <Text color="gray.600">
                  Find the perfect talent for your startup.
                </Text>
                <Button
                  mt={4}
                  colorScheme="green"
                  onClick={() => navigate("/jobs/new")}
                >
                  Create Job Post
                </Button>
              </CardBody>
            </Card>
            <Card bg="purple.50" variant="outline" borderColor="purple.200">
              <CardHeader>
                <Heading size="md" color="purple.700">
                  Share an Achievement
                </Heading>
              </CardHeader>
              <CardBody>
                <Text color="gray.600">
                  Celebrate your startup's milestones.
                </Text>
                <Button
                  mt={4}
                  colorScheme="purple"
                  onClick={() => navigate("/achievements/new")}
                >
                  Post Achievement
                </Button>
              </CardBody>
            </Card>
          </>
        ) : (
          <Card bg="indigo.50" variant="outline" borderColor="indigo.200">
            <CardHeader>
              <Heading size="md" color="indigo.700">
                Find Startup Jobs
              </Heading>
            </CardHeader>
            <CardBody>
              <Text color="gray.600">
                Explore exciting opportunities from innovative startups.
              </Text>
              <Button
                mt={4}
                colorScheme="indigo"
                onClick={() => navigate("/jobs")}
              >
                Browse Jobs
              </Button>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>

      {userProfile?.role === "entrepreneur" && (
        <VStack spacing={10} align="stretch">
          {jobsLoading || achievementsLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* --- ENHANCED "My Job Postings" Section --- */}
              <Box>
                <Heading as="h2" size="lg" mb={4}>
                  My Job Postings
                </Heading>
                {myJobPostings.length === 0 ? (
                  <Text color="gray.600">You haven't posted any jobs yet.</Text>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                    {myJobPostings.map((job) => (
                      <Card
                        key={job.id}
                        variant="outline"
                        bg="white"
                        shadow="lg"
                        borderRadius="xl"
                        transition="all 0.3s ease-in-out"
                        _hover={{
                          transform: "translateY(-5px)",
                          shadow: "2xl",
                        }}
                        display="flex"
                        flexDirection="column"
                        // --- Z-INDEX FIX ---
                        // Give the card a relative position and a higher z-index when its menu is active
                        position="relative"
                        zIndex={activeMenuId === job.id ? 20 : "auto"}
                      >
                        <CardHeader
                          pb={2}
                          borderBottom="1px"
                          borderColor="gray.100"
                        >
                          <Flex justify="space-between" align="start">
                            <Heading
                              size="md"
                              noOfLines={2}
                              color="gray.700"
                              fontWeight="bold"
                            >
                              {job.jobTitle}
                            </Heading>
                            <Menu
                              // --- Z-INDEX FIX ---
                              // Update the activeMenuId state when this menu opens or closes
                              onOpen={() => setActiveMenuId(job.id)}
                              onClose={() => setActiveMenuId(null)}
                            >
                              <MenuButton
                                as={IconButton}
                                aria-label="Options"
                                icon={<BsThreeDotsVertical />}
                                variant="ghost"
                                size="sm"
                                color="gray.500"
                              />
                              <MenuList>
                                <MenuItem
                                  onClick={() => handleViewInterested(job)}
                                  isDisabled={!job.interestedUsers?.length}
                                >
                                  View Interested
                                </MenuItem>
                                <MenuItem
                                  onClick={() =>
                                    navigate(`/jobs/edit/${job.id}`)
                                  }
                                >
                                  Edit Posting
                                </MenuItem>
                                <MenuItem
                                  onClick={() =>
                                    handleToggleJobStatus(job.id, job.status)
                                  }
                                >
                                  {job.status === "open"
                                    ? "Close Posting"
                                    : "Re-open Posting"}
                                </MenuItem>
                                <MenuItem as={Link} to={`/jobs/${job.id}`}>
                                  View Public Page
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Flex>
                        </CardHeader>

                        <CardBody
                          display="flex"
                          flexDirection="column"
                          flexGrow="1"
                          p={4}
                        >
                          <VStack spacing={4} align="stretch" flexGrow="1">
                            <HStack>
                              <Tag
                                size="lg"
                                colorScheme="blue"
                                borderRadius="full"
                                px={3}
                              >
                                <Icon as={FaUsers} mr={2} />
                                <Text fontWeight="bold">
                                  {job.interestedUsers?.length || 0}
                                </Text>
                                <Text ml={1}>Interested</Text>
                              </Tag>
                            </HStack>

                            <Text
                              fontSize="sm"
                              color="gray.500"
                              fontStyle="italic"
                            >
                              Created:{" "}
                              {job.postedAt?.toDate().toLocaleDateString()}
                            </Text>
                          </VStack>

                          <Flex
                            mt={4}
                            pt={4}
                            borderTop="1px"
                            borderColor="gray.100"
                            justify="space-between"
                            align="center"
                          >
                            <Tag
                              size="md"
                              colorScheme={
                                job.status === "open" ? "green" : "red"
                              }
                              variant="subtle"
                              borderRadius="full"
                            >
                              <Icon
                                as={
                                  job.status === "open"
                                    ? FaCheckCircle
                                    : FaTimesCircle
                                }
                                mr={2}
                              />
                              {job.status === "open" ? "Active" : "Closed"}
                            </Tag>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="solid"
                              onClick={() => handleViewInterested(job)}
                              isDisabled={!job.interestedUsers?.length}
                            >
                              View Applicants
                            </Button>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </Box>

              <Divider />

              {/* My Achievements Section */}
              <Box>
                <Heading as="h2" size="lg" mb={4}>
                  My Achievements
                </Heading>
                {myAchievements.length === 0 ? (
                  <Text color="gray.600">
                    You haven't posted any achievements yet.
                  </Text>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {myAchievements.map((achievement) => (
                      <Card
                        key={achievement.id}
                        variant="outline"
                        shadow="lg"
                        borderRadius="xl"
                        transition="all 0.3s ease-in-out"
                        _hover={{
                          transform: "translateY(-5px)",
                          shadow: "2xl",
                        }}
                      >
                        <CardHeader pb={2}>
                          <Heading size="md" noOfLines={1}>
                            {achievement.title}
                          </Heading>
                        </CardHeader>
                        <CardBody pt={0}>
                          <Text
                            noOfLines={3}
                            fontSize="sm"
                            color="gray.600"
                            mb={4}
                            minH="60px"
                          >
                            {achievement.description}
                          </Text>
                          <HStack justify="flex-end" spacing={2}>
                            <Button
                              onClick={() =>
                                handleDeleteAchievement(achievement.id)
                              }
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                            >
                              Delete
                            </Button>
                            <ChakraLink
                              as={Link}
                              to={`/achievements/edit/${achievement.id}`}
                            >
                              <Button size="sm" colorScheme="blue">
                                Edit
                              </Button>
                            </ChakraLink>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            </>
          )}
        </VStack>
      )}

      {/* --- ENHANCED MODAL --- */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent>
          <ModalHeader pb={2}>
            <Heading size="lg">Interested Talent</Heading>
            <Text fontSize="md" color="gray.500" fontWeight="normal">
              For "{selectedJobForModal?.jobTitle}"
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            minH={
              isFetchingInterestedDetails ||
              interestedTalentDetails.length === 0
                ? "200px"
                : "auto"
            }
            maxH="70vh"
            overflowY="auto"
            px={0}
          >
            {isFetchingInterestedDetails ? (
              <Flex justify="center" align="center" h="200px">
                <LoadingSpinner />
              </Flex>
            ) : interestedTalentDetails.length === 0 ? (
              <Flex
                justify="center"
                align="center"
                h="200px"
                flexDirection="column"
                gap={4}
              >
                <Icon as={FaUserGraduate} boxSize={12} color="gray.400" />
                <Text textAlign="center" color="gray.600">
                  No one has expressed interest yet.
                </Text>
              </Flex>
            ) : (
              <VStack spacing={0} align="stretch" divider={<Divider />}>
                {interestedTalentDetails.map((talent) => (
                  <Flex
                    key={talent.id}
                    p={4}
                    align="center"
                    justify="space-between"
                    transition="background 0.2s ease-in-out"
                    _hover={{ bg: "gray.50" }}
                  >
                    <HStack spacing={4} align="start">
                      <Avatar name={talent.name} size="lg" />
                      <VStack align="flex-start" spacing={1}>
                        <HStack align="center">
                          <Text fontSize="lg" fontWeight="bold">
                            {talent.name}
                          </Text>
                          <Tag size="sm" colorScheme="blue" variant="subtle">
                            <Icon as={FaUserGraduate} mr={1} />
                            Talent
                          </Tag>
                        </HStack>

                        {talent.bio && (
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {talent.bio}
                          </Text>
                        )}

                        {talent.skills && talent.skills.length > 0 && (
                          <HStack flexWrap="wrap" mt={2}>
                            {talent.skills.slice(0, 4).map((skill, i) => (
                              <Tag
                                key={i}
                                size="sm"
                                colorScheme="cyan"
                                variant="solid"
                              >
                                {skill}
                              </Tag>
                            ))}
                          </HStack>
                        )}
                      </VStack>
                    </HStack>
                    <ChakraLink
                      as={Link}
                      to={`/profile/${talent.id}`}
                      _hover={{ textDecoration: "none" }}
                    >
                      <Button size="sm" colorScheme="blue">
                        View Full Profile
                      </Button>
                    </ChakraLink>
                  </Flex>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button onClick={onClose} colorScheme="gray">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default DashboardPage;
