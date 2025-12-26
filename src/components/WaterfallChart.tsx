"use client"

import React from "react"
import { motion } from "framer-motion"

interface WaterfallProps {
  data: {
    label: string
    value: number
    type: 'positive' | 'negative' | 'total'
  }[]
}

export function WaterfallChart({ data }: WaterfallProps) {
  const max = Math.max(...data.map(d => Math.abs(d.value))) * 1.5
  
  // Pre-calculate positions to avoid mutation during render
  const bars = data.reduce((acc, item, i) => {
    const prevSum = i === 0 ? 0 : acc[i-1].currentSum
    const nextSum = item.type === 'total' ? item.value : prevSum + item.value
    
    acc.push({
      ...item,
      start: prevSum,
      end: nextSum,
      currentSum: nextSum
    })
    return acc
  }, [] as Array<{ label: string; value: number; type: string; start: number; end: number; currentSum: number }>)

  return (
    <div className="space-y-3 md:space-y-4">
      {bars.map((item, i) => {
        const height = (Math.abs(item.value) / max) * 100
        
        return (
          <div key={item.label} className="relative min-h-[40px] md:h-12 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <div className="w-full md:w-24 shrink-0 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40 truncate">
              {item.label}
            </div>
            
            <div className="flex-grow h-4 md:h-6 bg-white/5 rounded-full relative overflow-hidden">
               <motion.div
                 initial={{ width: 0, x: 0 }}
                 animate={{ 
                   width: `${height}%`,
                   x: `${(i * 10)}%` // Reduced stagger for better mobile alignment
                 }}
                 className={`h-full rounded-full ${
                    item.type === 'positive' ? 'bg-green-500/60' : 
                    item.type === 'negative' ? 'bg-red-500/60' : 'bg-blue-500'
                 }`}
               />
               <div className="absolute inset-0 flex items-center justify-end px-3">
                  <span className="text-[8px] md:text-[10px] font-mono font-bold">
                    {item.value > 0 ? '+' : ''}{item.value.toFixed(2)}
                  </span>
               </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
