"use client";

import React from "react";
import { motion } from "framer-motion";

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
    <motion.div
      key={tabKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
