"use client";

import { motion, useReducedMotion } from "motion/react";

export function GradientMesh() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-sky-50 dark:from-violet-950/40 dark:via-background dark:to-sky-950/40" />

      {/* Animated blobs */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-500/15"
        animate={
          shouldReduce
            ? undefined
            : {
                x: [0, 30, -20, 0],
                y: [0, -20, 10, 0],
              }
        }
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-500/12"
        animate={
          shouldReduce
            ? undefined
            : {
                x: [0, -20, 30, 0],
                y: [0, 20, -10, 0],
              }
        }
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute top-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-100/20 blur-3xl dark:bg-purple-500/10"
        animate={
          shouldReduce
            ? undefined
            : {
                x: [0, 20, -10, 0],
                y: [0, -30, 20, 0],
              }
        }
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </div>
  );
}
