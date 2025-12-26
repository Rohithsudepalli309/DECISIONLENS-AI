
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MetricData {
  projected: number;
  realized: number;
  drift_pct: number;
  status: string;
}

interface ForesightAuditProps {
  report: {
    metrics: Record<string, MetricData>;
    foresight_score: number;
    judgment: "STRATEGIC_MATCH" | "PROJECTION_FAILURE";
  };
  strategy: string;
}

export function ForesightAudit({ report, strategy }: ForesightAuditProps) {
  if (!report) return null;

  const { metrics, foresight_score, judgment } = report;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-tighter text-white">Foresight Audit: {strategy}</h3>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Projection VS Realized Utility</p>
        </div>
        <div className="flex items-center gap-2">
           <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${judgment === 'STRATEGIC_MATCH' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {judgment}
           </div>
           <div className="text-right">
              <p className="text-[8px] text-white/40 uppercase font-black">Score</p>
              <p className="text-sm font-black text-white">{Math.round(foresight_score * 100)}%</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(metrics).map(([name, data]: [string, MetricData]) => (
          <div key={name} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 relative overflow-hidden">
             <div className="flex justify-between items-center">
                <p className="text-[10px] font-black uppercase text-white/60">{name}</p>
                {data.drift_pct > 0 ? (
                   <TrendingUp className="w-3 h-3 text-red-400" />
                ) : (
                   <TrendingDown className="w-3 h-3 text-green-400" />
                )}
             </div>
             
             <div className="flex items-baseline justify-between">
                <div>
                   <p className="text-[8px] text-white/40 uppercase font-bold">Projected</p>
                   <p className="text-xs font-mono text-white/80">{data.projected}</p>
                </div>
                <div className="text-right">
                   <p className="text-[8px] text-white/40 uppercase font-bold">Realized</p>
                   <p className="text-xs font-mono text-white">{data.realized}</p>
                </div>
             </div>

             <div className="pt-2">
                <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                   <span className="text-white/40">Drift Delta</span>
                   <span className={Math.abs(data.drift_pct) > 10 ? 'text-orange-400' : 'text-blue-400'}>
                      {data.drift_pct}%
                   </span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min(100, Math.abs(data.drift_pct))}%` }}
                     className={`h-full ${Math.abs(data.drift_pct) > 15 ? 'bg-red-500' : 'bg-blue-500'}`}
                   />
                </div>
             </div>
          </div>
        ))}
      </div>

      {judgment === 'STRATEGIC_MATCH' ? (
         <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-[11px] text-green-400 font-bold leading-tight">
               PREDICTION ACCURACY: This decision model demonstrated high fidelity. Recommendations can be scaled with confidence.
            </p>
         </div>
      ) : (
         <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <p className="text-[11px] text-orange-400 font-bold leading-tight">
               MODEL DRIFT DETECTED: Realized outcomes fluctuated beyond 15% tolerance. Consider recalibrating criteria weights for future simulations.
            </p>
         </div>
      )}
    </div>
  );
}
