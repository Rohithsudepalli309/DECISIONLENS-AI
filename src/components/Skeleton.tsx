"use client"

import { motion } from "framer-motion"

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  borderRadius?: string | number
}

export function Skeleton({ className = "", width, height, borderRadius }: SkeletonProps) {
  return (
    <div 
      className={`relative overflow-hidden bg-white/5 ${className}`}
      style={{ 
        width, 
        height, 
        borderRadius: borderRadius ?? "0.75rem" 
      }}
    >
      <motion.div
        animate={{
          x: ["-100%", "100%"]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  )
}
