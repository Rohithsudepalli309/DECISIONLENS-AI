"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BrainCircuit, X, ChevronRight, Zap, History, Layout } from "lucide-react"

interface TourStep {
  title: string
  content: string
  target?: string
  icon: React.ReactNode
}

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const steps: TourStep[] = [
    {
      title: "Strategic Intelligence Hub",
      content: "Welcome to the DecisionLens AI Mission Control. This platform uses mathematical MCDA and Monte Carlo simulations to hardened your strategic choices.",
      icon: <BrainCircuit className="w-6 h-6 text-blue-400" />
    },
    {
      title: "Tactical Command Palette",
      content: "Press Ctrl+K globally to access the Command Center. Search historical audits, restore sessions, and execute operations at light speed.",
      icon: <Zap className="w-6 h-6 text-orange-400" />
    },
    {
      title: "Intelligence Archive",
      content: "All strategic simulations are archived with mathematical precision in the Audit history. Restore or fork any scenario to explore alternatives.",
      icon: <History className="w-6 h-6 text-purple-400" />
    },
    {
      title: "Multi-Platform Fluidity",
      content: "DecisionLens is fully optimized for Mobile, Tablet, and Desktop. Install as a PWA for native-grade performance on Android and iOS.",
      icon: <Layout className="w-6 h-6 text-green-400" />
    }
  ]

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem("dl_tour_complete")
    if (!hasCompletedTour) {
      const timer = setTimeout(() => setIsOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const completeTour = () => {
    localStorage.setItem("dl_tour_complete", "true")
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md glass shadow-2xl overflow-hidden border border-white/10"
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  {steps[currentStep].icon}
                </div>
                <button 
                  onClick={completeTour}
                  className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">
                  {steps[currentStep].title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed min-h-[4.5rem]">
                  {steps[currentStep].content}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === currentStep ? "w-6 bg-blue-500" : "w-1.5 bg-white/10"
                      }`} 
                    />
                  ))}
                </div>

                <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 pl-6 pr-4 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
                >
                  {currentStep === steps.length - 1 ? "Initialize Ops" : "Proceed"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
              <span>Strategic Onboarding v1.0</span>
              <span>Step {currentStep + 1} of {steps.length}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
