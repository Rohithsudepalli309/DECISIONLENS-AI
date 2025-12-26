import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, ShieldCheck, RefreshCw, BarChart3 } from 'lucide-react';

export function BICommandCenter() {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'json' | 'csv'>('json');

  const BI_URL = `https://api.decisionlens.ai/decision/bi/feed?format=${format}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(BI_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
           <Database className="w-6 h-6" />
        </div>
        <div>
           <h3 className="text-lg font-black uppercase italic text-white">Enterprise BI Link</h3>
           <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Direct OData-Style Feed for PowerBI & Tableau</p>
        </div>
      </div>

      <div className="glass-card bg-white/[0.02] border-white/5 space-y-4">
         <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Deployment Settings</h4>
            <div className="flex gap-2">
               {['json', 'csv'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f as 'json' | 'csv')}
                    className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${format === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40'}`}
                  >
                    {f}
                  </button>
               ))}
            </div>
         </div>

         <div className="relative group">
            <div className="w-full bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-[10px] text-blue-400 break-all pr-12">
               {BI_URL}
            </div>
            <button 
              onClick={copyToClipboard}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
               {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
         </div>

         <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5" />
            <p className="text-[10px] text-white/60 leading-relaxed italic">
               This link uses your current session token. For automated server-side ingestion, please generate a permanent &quot;Service Account Key&quot; in the Security settings.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white/80">
               <RefreshCw className="w-4 h-4 text-blue-400" />
               <p className="text-xs font-bold uppercase tracking-tighter italic">Live Sync</p>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed">
               Data is generated in real-time from your simulation archives. No manual export required.
            </p>
         </div>
         <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white/80">
               <BarChart3 className="w-4 h-4 text-blue-400" />
               <p className="text-xs font-bold uppercase tracking-tighter italic">Read Optimized</p>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed">
               Optimized flat schemas ready for PowerBI &quot;Get Data&quot; or Tableau &quot;Web Data Connector&quot;.
            </p>
         </div>
      </div>
      
      <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
         <ExternalLink className="w-4 h-4" />
         View Integration Documentation
      </button>
    </div>
  );
}
