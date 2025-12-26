"use client"

import React, { useState } from "react"
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { Trash2, Copy } from "lucide-react"
import { useHaptics } from "@/hooks/useHaptics"

interface Props {
  onDelete: () => void
  onFork: () => void
  children: React.ReactNode
}

export const SwipeableAuditCard = ({ onDelete, onFork, children }: Props) => {
  const x = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)
  const { light, medium, success } = useHaptics()
  
  // Background color interpolation based on drag direction
  const background = useTransform(
    x,
    [-150, 0, 150],
    ["rgba(239, 68, 68, 0.2)", "rgba(255, 255, 255, 0)", "rgba(59, 130, 246, 0.2)"]
  )

  // Icon opacity / scale
  const deleteOpacity = useTransform(x, [-50, -100], [0, 1])
  const deleteScale = useTransform(x, [-50, -100], [0.8, 1.2])
  
  const actionOpacity = useTransform(x, [50, 100], [0, 1])
  const actionScale = useTransform(x, [50, 100], [0.8, 1.2])

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    if (info.offset.x < -100) {
      // Trigger Delete
       medium()
       onDelete()
    } else if (info.offset.x > 100) {
      // Trigger Fork
       success()
       onFork()
    }
  }

  return (
    <motion.div 
      style={{ background }} 
      className="relative mb-4 rounded-2xl overflow-hidden touch-pan-x"
    >
      {/* Underlying Actions Layer */}
      <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
        <motion.div 
          style={{ opacity: actionOpacity, scale: actionScale }} 
          className="flex flex-col items-center text-blue-400"
        >
          <Copy className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-black uppercase tracking-widest">Fork</span>
        </motion.div>

        <motion.div 
          style={{ opacity: deleteOpacity, scale: deleteScale }} 
          className="flex flex-col items-center text-red-500"
        >
          <Trash2 className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-black uppercase tracking-widest">Purge</span>
        </motion.div>
      </div>

      {/* Foreground Content Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragStart={() => {
          setIsDragging(true)
          light()
        }}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10 bg-[#050505] active:cursor-grabbing"
      >
        <div className={`transition-opacity ${isDragging ? 'opacity-90' : 'opacity-100'}`}>
           {children}
        </div>
      </motion.div>
    </motion.div>
  )
}
