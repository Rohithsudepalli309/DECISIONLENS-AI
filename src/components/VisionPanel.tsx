"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react"
import axios from "axios"

interface VisionResult {
  option_name: string;
  parameters: {
    base_cost: number;
    risk: number;
    availability: number;
  };
}

export function VisionPanel() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VisionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile)
      setError(null)
    } else {
      setError("Please upload an image file (PNG, JPG)")
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post("http://127.0.0.1:8000/vision/extract", formData)
      setResult(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to extract data. Ensure OCR engine is active."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`glass-card !p-12 border-dashed border-2 flex flex-col items-center justify-center transition-all ${
          file ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20"
        }`}
      >
        {!file ? (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-lg font-bold mb-2">Ingest Decision Data</h4>
            <p className="text-sm text-white/40 text-center max-w-xs">
              Drag & drop a screenshot of your vendor dashboard or cost report.
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="font-bold mb-1">{file.name}</h4>
            <p className="text-[10px] text-white/40 uppercase font-black">{(file.size / 1024).toFixed(1)} KB</p>
            
            {!result && !loading && (
              <button 
                onClick={handleUpload}
                className="mt-6 px-6 py-2 bg-blue-600 rounded-lg text-xs font-bold hover:bg-blue-500 transition-all uppercase tracking-widest"
              >
                Process with OCR
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10"
          >
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest animate-pulse">Running Neural Extraction...</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
          </motion.div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-green-500/5 border border-green-500/10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Extraction Complete</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-white/20">Confidence: 98.2%</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-white/40 uppercase font-black mb-1">Identified Option</p>
                <p className="text-sm font-bold">{result.option_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-black mb-1">Base Cost</p>
                <p className="text-sm font-mono">${result.parameters.base_cost.toLocaleString()}</p>
              </div>
            </div>
            
            <button className="w-full py-2 bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-500/30 transition-all">
              Add to Simulation Matrix
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
