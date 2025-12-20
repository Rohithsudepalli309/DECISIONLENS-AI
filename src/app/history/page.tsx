"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/Navbar"
import { Calendar, Tag, Target, ChevronRight, Search, Filter } from "lucide-react"
import axios from "axios"

interface AuditItem {
  id: number
  timestamp: string
  goal: string
  domain: string
  recommended_option: string
  score: number
  constraints?: Record<string, number | string>
  preferences?: string[]
  strategy?: string
  simulation_results?: Array<{ option: string; score: number }>
}

export default function AuditHistory() {
  const [audits, setAudits] = useState<AuditItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterDomain, setFilterDomain] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isComparing, setIsComparing] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/decision/history")
        setAudits(res.data)
      } catch (err) {
        console.error("Failed to fetch history", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const filteredAudits = audits.filter((item: AuditItem) => {
    const matchesSearch = item.goal.toLowerCase().includes(search.toLowerCase()) || 
                          item.recommended_option.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = !filterDomain || item.domain === filterDomain
    return matchesSearch && matchesFilter
  })

  const domains = Array.from(new Set(audits.map((a: AuditItem) => a.domain)))

  const toggleSelection = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-2)
    )
  }

  const selectedAudits = audits.filter(a => selectedIds.includes(a.id))

  return (
    <main className="min-h-screen pt-24 pb-12 px-8 overflow-hidden">
      <Navbar />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Audit Archive</h1>
            <p className="text-white/40">Traceability and historical performance logs</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-grow md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  className="w-full glass-input pl-10 h-10 text-xs font-bold uppercase tracking-widest" 
                  placeholder="Search goals..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <div className="relative group">
                <button className="glass-card !p-0 h-10 w-10 flex items-center justify-center hover:bg-blue-500/10 border-white/10">
                   <Filter className="w-4 h-4 text-white/40" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 glass-card !p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-20">
                   <button 
                    onClick={() => setFilterDomain(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/5 ${!filterDomain ? 'text-blue-400' : 'text-white/40'}`}
                   >
                     All Domains
                   </button>
                   {domains.map((d: string) => (
                     <button 
                      key={d}
                      onClick={() => setFilterDomain(d)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/5 ${filterDomain === d ? 'text-blue-400' : 'text-white/40'}`}
                     >
                       {d}
                     </button>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 glass-card animate-pulse" />)}
          </div>
        ) : isComparing ? (
          <div className="grid md:grid-cols-2 gap-8">
            <button 
              onClick={() => setIsComparing(false)}
              className="col-span-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 hover:underline"
            >
              ← Back to archive
            </button>
            {selectedAudits.map(audit => (
              <div key={audit.id} className="glass-card !bg-white/5 border-white/10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white/90">{audit.goal}</h3>
                    <p className="text-[10px] text-white/40 uppercase font-black">{audit.domain}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-black mb-3 italic">Optimization Outcome</p>
                    <div className="flex justify-between items-end">
                       <div>
                         <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Top Recommendation</p>
                         <p className="text-xl font-black">{audit.recommended_option}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Score</p>
                         <p className="text-2xl font-black font-mono">{(audit.score * 100).toFixed(1)}%</p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card !bg-white/[0.02] border-white/5 !p-4">
                      <p className="text-[10px] text-white/40 font-black uppercase mb-4">Core Constraints</p>
                      <div className="space-y-2">
                        {Object.entries(audit.constraints || {}).map(([key, val]) => (
                          <div key={key} className="flex justify-between text-[10px]">
                            <span className="text-white/40 opacity-70">{key}</span>
                            <span className="font-mono font-bold">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass-card !bg-white/[0.02] border-white/5 !p-4">
                      <p className="text-[10px] text-white/40 font-black uppercase mb-4">MCDA Strategy</p>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500" />
                         <span className="text-xs font-bold">{audit.strategy || "TOPSIS"}</span>
                      </div>
                      <p className="text-[10px] text-white/20 mt-2 italic leading-tight">Engine: v4.8 Strategic Tier</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAudits.map((item: AuditItem) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id].slice(-2))}
                className={`glass-card group hover:scale-[1.01] transition-all cursor-pointer border-l-4 ${
                  selectedIds.includes(item.id) ? "border-l-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20" : "border-l-blue-500/40"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6 w-full md:w-1/2">
                    <div 
                      onClick={(e) => toggleSelection(e, item.id)}
                      className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                        selectedIds.includes(item.id) ? "bg-blue-600 border-blue-400" : "bg-white/5 border-white/10 group-hover:border-white/20"
                      }`}
                    >
                       {selectedIds.includes(item.id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white/90 line-clamp-1">{item.goal}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {item.domain}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Recommendation</p>
                      <p className="font-bold text-blue-400 uppercase tracking-wider">{item.recommended_option}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Score</p>
                      <p className="font-mono text-xl font-black">{(item.score * 100).toFixed(1)}%</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedIds.length === 2 && !isComparing && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 glass-card bg-blue-600/90 border-blue-400 shadow-2xl flex items-center gap-8 backdrop-blur-xl"
          >
            <div className="flex gap-2">
               <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-black">1</div>
               <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-black">2</div>
            </div>
            <div>
               <p className="text-xs font-black uppercase tracking-widest text-white">Compare Realities</p>
               <p className="text-[10px] text-white/60">Cross-reference strategic outcomes</p>
            </div>
            <button 
              onClick={() => setIsComparing(true)}
              className="bg-white text-blue-900 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
            >
              Analyze Correlation
            </button>
          </motion.div>
        )}
      </div>
    </main>
  )
}
