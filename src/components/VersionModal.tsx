
"use client";

import React, { useState } from 'react';
import { Info, CheckCircle, ShieldCheck, Smartphone, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

export function VersionModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-start text-gray-400 hover:text-cyan-400 transition-colors p-2 rounded-md hover:bg-white/5"
      >
        <Info className="mr-2 h-4 w-4" />
        <span className="text-sm font-medium">About DecisionLens AI</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6"
            >
                <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2 text-xl font-bold text-white">
                        DecisionLens AI 
                        <span className="bg-cyan-900/50 text-cyan-300 border border-cyan-700/50 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">Enterprise</span>
                     </div>
                     <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                </div>

                <div className="text-sm text-gray-400 mb-6">
                    Strategic Intelligence & Foresight Engine
                </div>
                
                <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-black/40">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="font-medium text-sm text-white">Version</p>
                                <p className="text-xs text-gray-500">v1.3.0 (Golden Master)</p>
                            </div>
                        </div>
                         <div className="text-right">
                            <p className="font-mono text-xs text-gray-600">BUILD: GM-2025-12-30</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div className="p-3 border border-gray-800 rounded-lg bg-black/40 flex flex-col items-center text-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-purple-400" />
                            <span className="text-xs text-gray-400">Security Audited</span>
                         </div>
                         <div className="p-3 border border-gray-800 rounded-lg bg-black/40 flex flex-col items-center text-center gap-2">
                            <Smartphone className="h-6 w-6 text-blue-400" />
                            <span className="text-xs text-gray-400">Universal Native</span>
                         </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-4 text-center border-t border-gray-800 pt-4">
                        <p>© 2025 DecisionLens AI Inc. All rights reserved.</p>
                        <div className="flex justify-center gap-4 mt-2">
                            <a href="/legal/terms" className="hover:text-cyan-400 underline transition-colors" target="_blank">Terms of Service</a>
                            <a href="/legal/privacy" className="hover:text-cyan-400 underline transition-colors" target="_blank">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
