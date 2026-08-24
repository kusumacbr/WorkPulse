"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedTabContentProps {
  tabKey: string;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedTabContent({
  tabKey,
  children,
  className = "",
}: AnimatedTabContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 10, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.995 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
