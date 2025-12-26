import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import type { DecisionData } from '@/components/DecisionStepper'
export type { DecisionData }

export interface DecisionResults {
  id?: number;
  strategy?: string;
  domain?: string;
  ranked_options?: {
    option: string;
    topsis_score: number;
    is_pareto_optimal?: boolean;
    metrics: {
      cost: number;
      availability: number;
      risk: number;
    };
  }[];
  simulations?: {
    option: string;
    simulation: {
      cost_dist: number[];
      availability_dist: number[];
      risk_dist: number[];
      expected: {
        cost: number;
        availability: number;
        risk: number;
      };
    };
  }[];
  options?: any[];
  simulation_results?: any;
  weights?: number[];
  sensitivity?: any;
  correlations?: any[];
  narrative?: string;
  chaos_report?: any;
  consensus_report?: any;
}

interface Guardrails {
  iterations: number
  confidenceLevel: number
  volatilityThreshold: number
}

interface DecisionState {
  formData: DecisionData
  currentStep: number
  results: DecisionResults | null
  activeView: 'hero' | 'stepper' | 'results' | 'settings'
  hasHydrated: boolean
  guardrails: Guardrails
  offlineQueue: DecisionData[]
  
  setFormData: (data: DecisionData) => void;
  setStep: (step: number) => void;
  setResults: (results: DecisionResults | null) => void;
  setView: (view: 'hero' | 'stepper' | 'results' | 'settings') => void;
  setHasHydrated: (state: boolean) => void;
  setGuardrails: (guardrails: Guardrails) => void;
  resetDecision: () => void;
  initializeWS: (projectName: string) => void;
  syncParam: (data: any) => void;
  queueOfflineSubmission: (data: DecisionData) => void;
  processOfflineQueue: (token: string, API_BASE_URL: string) => Promise<void>;
  applyAIProposal: (proposal: any) => void;
  syncFromExternal: (source: 'cloud' | 'market', API_BASE_URL: string) => Promise<void>;
  runChaosTest: (API_BASE_URL: string) => Promise<void>;
  runConsensusAudit: (API_BASE_URL: string) => Promise<void>;
  updateResults: (results: Partial<DecisionResults>) => void;
}

const initialFormData: DecisionData = {
  domain: "cloud",
  goal: "",
  constraints: {
    max_cost: 10000,
    min_availability: 0.99
  },
  preferences: ["cost", "reliability"],
  options: [
    { name: "Alternative A", parameters: { base_cost: 8000, risk: 0.1, availability: 0.99 } },
    { name: "Alternative B", parameters: { base_cost: 12000, risk: 0.05, availability: 0.999 } }
  ],
  weights: [0.4, 0.4, 0.2],
  algorithm: "topsis",
  project_name: "General"
}

const defaultGuardrails: Guardrails = {
  iterations: 1000,
  confidenceLevel: 0.95,
  volatilityThreshold: 0.1
}

export const useDecisionStore = create<DecisionState>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      currentStep: 1,
      results: null,
      activeView: 'hero',
      hasHydrated: false,
      guardrails: defaultGuardrails,
      offlineQueue: [],

      setFormData: (data: DecisionData) => {
        set({ formData: data });
        const s = get() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (s.activeSocket && s.activeSocket.readyState === WebSocket.OPEN) {
          s.activeSocket.send(JSON.stringify({ type: 'PARAM_SYNC', formData: data }));
        }
      },
      setStep: (step: number) => set({ currentStep: step }),
      setResults: (results: DecisionResults | null) => set({ results }),
      setView: (view: 'hero' | 'stepper' | 'results' | 'settings') => set({ activeView: view }),
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
      setGuardrails: (guardrails: Guardrails) => set({ guardrails }),
      resetDecision: () => set({ 
        formData: initialFormData, 
        currentStep: 1, 
        results: null, 
        activeView: 'hero',
        guardrails: defaultGuardrails
      }),

      initializeWS: (projectName: string) => {
        const s = get() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (s.activeSocket) s.activeSocket.close();
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host.includes('localhost') ? 'localhost:8000' : window.location.host;
        const wsUrl = `${protocol}//${host}/ws/${projectName}`;
        
        const socket = new WebSocket(wsUrl);
        
        socket.onmessage = (event) => {
           const res = JSON.parse(event.data);
           if (res.type === 'PARAM_SYNC') {
              set({ formData: res.formData });
           }
        };

        set({ activeSocket: socket } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      },

      syncParam: (dataValue: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const s = get() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (s.activeSocket && s.activeSocket.readyState === WebSocket.OPEN) {
          s.activeSocket.send(JSON.stringify(dataValue));
        }
      },

      queueOfflineSubmission: (data: DecisionData) => {
        const { offlineQueue } = get();
        set({ offlineQueue: [...offlineQueue, data] });
      },

      processOfflineQueue: async (token: string, API_BASE_URL: string) => {
        const { offlineQueue } = get();
        if (offlineQueue.length === 0) return;

        // Use the top-level axios import
        
        for (const data of offlineQueue) {
          try {
            await axios.post(`${API_BASE_URL}/decision/recommend`, {
              ...data,
              iterations: get().guardrails.iterations,
              seed: 42
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            // If successful, remove from queue
            set((state) => ({
              offlineQueue: state.offlineQueue.filter(q => q !== data)
            }));
          } catch (error) {
            console.error("Failed to process offline item:", error);
            // Stop processing if one fails (maybe server is still flaky or data is bad)
            break;
          }
        }
      },

      applyAIProposal: (proposal: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const { formData } = get();
        if (proposal.action_type === "WEIGHT_SHIFT") {
          set({ formData: { ...formData, weights: proposal.proposal_details.weights } });
        } else if (proposal.action_type === "CONSTRAINT_PIVOT") {
          set({ 
            formData: { 
              ...formData, 
              constraints: { 
                ...formData.constraints, 
                [proposal.proposal_details.field]: proposal.proposal_details.value 
              } 
            } 
          });
        }
      },

      syncFromExternal: async (source: 'cloud' | 'market', API_BASE_URL: string) => {
        try {
          const res = await axios.get(`${API_BASE_URL}/decision/connectors/${source}/sync`);
          if (res.data.constraints) {
            const { formData } = get();
            set({ 
              formData: { 
                ...formData, 
                constraints: { ...formData.constraints, ...res.data.constraints } 
              } 
            });
          }
        } catch (e) {
          console.error("External sync failed:", e);
        }
      },

      runChaosTest: async (API_BASE_URL: string) => {
        try {
          const { formData } = get();
          const res = await axios.post(`${API_BASE_URL}/decision/agent/chaos`, {
            options: formData.options,
            weights: formData.weights
          });
          const { results } = get();
          set({ results: { ...results, chaos_report: res.data } });
        } catch (e) {
          console.error("Chaos test failed:", e);
        }
      },

      runConsensusAudit: async (API_BASE_URL: string) => {
        try {
          const { formData } = get();
          const res = await axios.post(`${API_BASE_URL}/decision/agent/consensus`, {
            options: formData.options
          });
          const { results } = get();
          set({ results: results ? { ...results, consensus_report: res.data } : { consensus_report: res.data } as DecisionResults });
        } catch (e) {
          console.error("Consensus audit failed:", e);
        }
      },

      updateResults: (newResults: Partial<DecisionResults>) => {
        const { results } = get();
        set({ results: results ? { ...results, ...newResults } : (newResults as DecisionResults) });
      }
    }),
    {
      name: 'decision-lens-activity',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true)
      }
    }
  )
)
