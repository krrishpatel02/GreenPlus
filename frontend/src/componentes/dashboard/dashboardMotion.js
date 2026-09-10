export const dashboardStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export const dashboardRipple = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};
