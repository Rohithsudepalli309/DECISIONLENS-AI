
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, ShieldCheck } from 'lucide-react';

interface BacktestStats {
  global_forecasting_accuracy: number;
  audit_count: number;
  domain_summary: Record<string, number>;
  status: string;
}

export function BacktestingDashboard() {
  const [stats, setStats] = useState<BacktestStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from /decision/stats or a new global backtest endpoint
    // For now, we simulate the data structure
    setTimeout(() => {
      setStats({
        global_forecasting_accuracy: 0.88,
        audit_count: 12,
        domain_summary: {
           "Cloud Infrastructure": 0.92,
           "Supply Chain": 0.74,
           "Strategic M&A": 0.95
        },
        status: "ELITE"
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse text-white/40 uppercase font-black tracking-widest text-[10px]">Initializing Foresight Engine...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
           <Target className="w-6 h-6" />
        </div>
        <div>
           <h3 className="text-lg font-black uppercase italic text-white">Strategic Foresight Dashboard</h3>
           <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Recursive Back-Testing & Accuracy Audits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="glass-card bg-white/[0.02] border-white/5 p-4 space-y-2">
            <p className="text-[8px] text-white/40 uppercase font-black">Global Accuracy</p>
            <div className="flex items-baseline gap-2">
               <h4 className="text-2xl font-black text-white">{(stats?.global_forecasting_accuracy || 0) * 100}%</h4>
               <span className="text-[10px] text-green-400 font-bold uppercase">+{stats?.status}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(stats?.global_forecasting_accuracy || 0) * 100}%` }}
                 className="h-full bg-purple-500"
               />
            </div>
         </div>

         <div className="glass-card bg-white/[0.02] border-white/5 p-4 space-y-2">
            <p className="text-[8px] text-white/40 uppercase font-black">Feedback Loops</p>
            <div className="flex items-baseline gap-2">
               <h4 className="text-2xl font-black text-white">{stats?.audit_count}</h4>
               <span className="text-[10px] text-white/40 font-bold uppercase">Audits Closed</span>
            </div>
            <p className="text-[9px] text-white/30 italic">Target: 25 for High Confidence</p>
         </div>

         <div className="glass-card bg-white/[0.02] border-white/5 p-4 space-y-2">
            <p className="text-[8px] text-white/40 uppercase font-black">Drift Status</p>
            <div className="flex items-center gap-2 text-green-400">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-sm font-black uppercase">Auto-Recalibrated</span>
            </div>
            <p className="text-[9px] text-white/30">Predictions are now -8% de-biased for Cost.</p>
         </div>
      </div>

      <div className="glass-card bg-white/[0.02] border-white/5 p-6">
         <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-4">Domain Forecasting Fidelity</h4>
         <div className="space-y-4">
            {Object.entries(stats?.domain_summary || {}).map(([domain, accuracy]: [string, number]) => (
               <div key={domain} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                     <span className="text-white/80">{domain}</span>
                     <span className={accuracy > 0.8 ? 'text-green-400' : 'text-orange-400'}>{accuracy * 100}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${accuracy * 100}%` }}
                        className={`h-full ${accuracy > 0.8 ? 'bg-green-500' : 'bg-orange-500'}`}
                     />
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
         <Activity className="w-4 h-4 text-blue-400 mt-0.5" />
         <div className="space-y-1">
            <p className="text-[10px] text-white font-bold uppercase">Active De-biasing</p>
            <p className="text-[10px] text-white/40 leading-relaxed italic">
               The engine has detected a consistent &quot;Optimism Bias&quot; in Cloud Infrastructure projects. 
               New simulations in this domain automatically include a 12% contingency buffer based on historical drift.
            </p>
         </div>
      </div>
    </div>
  );
}
