"use client";

import { motion } from "framer-motion";

export const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export { motion };
