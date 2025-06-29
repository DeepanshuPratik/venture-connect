export const pageTransitionVariants = {
    initial: {
      opacity: 0,
      // Add a slight scale to make it feel more dynamic
      scale: 0.98,
      // Or a slight slide from bottom if you prefer:
      // y: 20,
    },
    animate: {
      opacity: 1,
      scale: 1,
      // y: 0,
      transition: {
        duration: 0.8, // Duration of the entrance animation
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 1.02, // A slight scale out on exit
      // y: -20, // Or slide out to top
      transition: {
        duration: 0.5, // Duration of the exit animation
        ease: "easeIn",
      },
    },
  };