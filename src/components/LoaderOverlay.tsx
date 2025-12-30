"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BrainCircuit } from "lucide-react"

interface LoaderOverlayProps {
  isLoading: boolean
  message?: string
}

export function LoaderOverlay({ isLoading, message = "Initializing Neural Link..." }: LoaderOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-8 text-center"
        >
          {/* Background Neural Pulse */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
          </div>

          <div className="relative space-y-8 max-w-sm w-full">
            {/* Logo Animation */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="mx-auto w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center relative group"
            >
              <BrainCircuit className="w-10 h-10 text-blue-400" />
              <div className="absolute inset-0 rounded-3xl border-2 border-blue-500/50 animate-ping opacity-20" />
            </motion.div>

            <div className="space-y-4">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black italic tracking-tighter uppercase text-white"
              >
                Decision<span className="text-blue-500">Lens</span> <span className="text-white/20">AI</span>
              </motion.h1>
              
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.4 }}
                 className="flex flex-col items-center gap-4"
              >
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                   <motion.div 
                     initial={{ x: "-100%" }}
                     animate={{ x: "100%" }}
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                   />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 animate-pulse">
                  {message}
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="pt-12"
            >
              <div className="text-[8px] font-black text-white/10 uppercase tracking-widest leading-relaxed">
                Platform Security Protocol v1.5.0<br/>
                Industrial Grade Decision Analytics<br/>
                © 2025 DeepMind Advanced Agentic Coding
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
