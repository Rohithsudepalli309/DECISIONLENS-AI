
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Key, Lock, Zap, CheckCircle2 } from 'lucide-react';

interface Proposal {
  action_type: string;
  confidence: number;
  proposal_details: Record<string, unknown>;
}

interface SecurityBunkerProps {
  onExecute: (signatures: string[]) => void;
  onCancel: () => void;
  proposal: Proposal;
}

export function SecurityBunker({ onExecute, onCancel, proposal }: SecurityBunkerProps) {
  const [signatures, setSignatures] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const ADMIN_KEYS = [
    { id: "KEY-CFO-99", role: "CFO", label: "Financial Authorization" },
    { id: "KEY-CTO-88", role: "CTO", label: "Infrastructure Waiver" },
    { id: "KEY-CEO-77", role: "CEO", label: "Executive Decree" }
  ];

  const toggleSignature = (id: string) => {
    if (signatures.includes(id)) {
      setSignatures(signatures.filter(s => s !== id));
    } else {
      setSignatures([...signatures, id]);
    }
  };

  const handleFinalExecute = async () => {
    setIsExecuting(true);
    // Simulate cryptographic verification
    await new Promise(r => setTimeout(r, 2000));
    setIsExecuting(false);
    setIsDone(true);
    setTimeout(() => onExecute(signatures), 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg glass-card border-red-500/20 bg-red-500/5 relative overflow-hidden">
        {/* Scanned Grid Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ff0000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
             </div>
             <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white italic">The Bunker</h2>
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em]">Zero-Knowledge Governance Protocol</p>
             </div>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
             <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/40">
                <span>Strategic Delta</span>
                <span className="text-red-400">Restricted Action</span>
             </div>
             <p className="text-sm font-bold text-white leading-relaxed">
                Confirming pivot to <span className="text-blue-400">{proposal.action_type.replace('_', ' ')}</span> with {Math.round(proposal.confidence * 100)}% match. 
                This action requires 2/3 administrative signatures.
             </p>
          </div>

          <div className="space-y-3">
             <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Digital Quorum</h3>
             {ADMIN_KEYS.map((key) => (
                <button
                  key={key.id}
                  onClick={() => toggleSignature(key.id)}
                  disabled={isExecuting || isDone}
                  className={`w-full group relative p-3 rounded-xl border transition-all flex items-center justify-between ${
                    signatures.includes(key.id) 
                      ? 'bg-red-500/20 border-red-500/50 text-white' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                   <div className="flex items-center gap-3">
                      <Key className={`w-4 h-4 ${signatures.includes(key.id) ? 'text-red-400' : 'text-white/20'}`} />
                      <div className="text-left">
                         <p className="text-xs font-black uppercase">{key.role}</p>
                         <p className="text-[8px] opacity-60 tracking-widest">{key.label}</p>
                      </div>
                   </div>
                   {signatures.includes(key.id) ? <CheckCircle2 className="w-4 h-4 text-red-400" /> : <Lock className="w-4 h-4 opacity-20" />}
                </button>
             ))}
          </div>

          <div className="flex gap-4 pt-4">
             <button 
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
             >
                Abnormal Termination
             </button>
             <button 
              disabled={signatures.length < 2 || isExecuting || isDone}
              onClick={handleFinalExecute}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                signatures.length >= 2 
                  ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
             >
                {isExecuting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Enact Pivot
                  </>
                )}
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
