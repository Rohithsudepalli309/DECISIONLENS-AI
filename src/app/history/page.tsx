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
}

export default function AuditHistory() {
  const [audits, setAudits] = useState<AuditItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterDomain, setFilterDomain] = useState<string | null>(null)

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
        ) : (
          <div className="grid gap-4">
            {filteredAudits.map((item: AuditItem) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card group hover:scale-[1.01] transition-all cursor-pointer border-l-4 border-l-blue-500/40"
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6 w-full md:w-1/2">
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
      </div>
    </main>
  )
}
