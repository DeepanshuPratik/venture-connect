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
  FaUserSlash
} from "react-icons/fa";

function DashboardPage() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const [myJobPostings, setMyJobPostings] = useState([]);
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

  const handleViewInterested = (jobPost) => {
    setSelectedJobForModal(jobPost);
    setInterestedTalentDetails([]); // Clear previous state

    // The logic is now much simpler: if the interestStatus map exists, process it.
    if (
      jobPost.interestStatus &&
      Object.keys(jobPost.interestStatus).length > 0
    ) {
      // Convert the map of users into an array of objects for easy rendering.
      // This will include users with 'interested' and 'withdrawn' statuses.
      const talentArray = Object.entries(jobPost.interestStatus).map(
        ([uid, data]) => ({
          id: uid,
          ...data, // This includes { status, timestamp, userName, userEmail }
        })
      );
      setInterestedTalentDetails(talentArray);
    }
    onOpen(); // Open the modal
  };

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    try {
      const docRef = doc(db, "job_posts", jobId);
      await updateDoc(docRef, { status: newStatus });
      toast({
        title: `Job ${newStatus}`,
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
              <Box>
                <Heading as="h2" size="lg" mb={4}>
                  My Job Postings
                </Heading>
                {myJobPostings.length === 0 ? (
                  <Text color="gray.600">You haven't posted any jobs yet.</Text>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                    {myJobPostings.map((job) => {
                      const interestStatusMap = job.interestStatus || {};
                      const interestCount = Object.values(interestStatusMap).filter(s => s.status === 'interested').length;
                      const withdrawnCount = Object.values(interestStatusMap).filter(s => s.status === 'withdrawn').length;
                      const totalApplicants = Object.keys(interestStatusMap).length;
                      return (
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
                              <Menu>
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
                                    isDisabled={!interestCount}
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
                                  <Text fontWeight="bold">{interestCount}</Text>
                                  <Text ml={1}>Interested</Text>
                                </Tag>
                                {/* NEW: Display withdrawn count */}
                                {withdrawnCount > 0 && (
                                  <Tag
                                    size="lg"
                                    colorScheme="red"
                                    borderRadius="full"
                                    px={3}
                                  >
                                    <Icon as={FaUserSlash} mr={2} />
                                    <Text fontWeight="bold">
                                      {withdrawnCount}
                                    </Text>
                                    <Text ml={1}>Withdrawn</Text>
                                  </Tag>
                                )}
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
                                isDisabled={!interestCount && !withdrawnCount}
                              >
                                View Applicants
                              </Button>
                            </Flex>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                )}
              </Box>

              <Divider />

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
                      <Card key={achievement.id} variant="outline" shadow="sm">
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
            <Heading size="lg">
              Applicants for "{selectedJobForModal?.jobTitle}"
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            minH={interestedTalentDetails.length === 0 ? "200px" : "auto"}
            maxH="70vh"
            overflowY="auto"
            px={0}
          >
            {interestedTalentDetails.length === 0 ? (
              <Flex
                justify="center"
                align="center"
                h="200px"
                flexDirection="column"
                gap={4}
              >
                <Icon as={FaUserGraduate} boxSize={12} color="gray.400" />
                <Text textAlign="center" color="gray.600">
                  No one has expressed or withdrawn interest yet.
                </Text>
              </Flex>
            ) : (
              <VStack spacing={0} align="stretch" divider={<Divider />}>
                {interestedTalentDetails
                  .sort((a, b) => (a.status === "interested" ? -1 : 1)) // Sorts to show 'interested' first
                  .map((talent) => (
                    <Flex
                      key={talent.id}
                      p={4}
                      align="center"
                      justify="space-between"
                      transition="background 0.2s ease-in-out"
                      _hover={{ bg: "gray.50" }}
                      opacity={talent.status === "withdrawn" ? 0.6 : 1}
                      bg={
                        talent.status === "withdrawn" ? "red.50" : "transparent"
                      }
                    >
                      <HStack spacing={4} align="start">
                        <Avatar name={talent.userName} size="lg" />
                        <VStack align="flex-start" spacing={1}>
                          <HStack align="center">
                            <Text fontSize="lg" fontWeight="bold">
                              {talent.userName}
                            </Text>
                            <Tag
                              size="sm"
                              colorScheme={
                                talent.status === "interested" ? "green" : "red"
                              }
                              variant="subtle"
                            >
                              {talent.status}
                            </Tag>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {talent.userEmail}
                          </Text>
                        </VStack>
                      </HStack>
                      <ChakraLink
                        as={Link}
                        to={`/profile/${talent.id}`}
                        _hover={{ textDecoration: "none" }}
                      >
                        <Button size="sm" colorScheme="blue">
                          View Profile
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
