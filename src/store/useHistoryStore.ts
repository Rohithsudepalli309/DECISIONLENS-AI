import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/api-config'
import { useAuthStore } from './useAuthStore'

export interface AuditItem {
  id: number
  timestamp: string
  goal: string
  domain: string
  project_name?: string
  recommended_option: string
  score: number
  constraints?: {
    max_cost: number;
    min_availability: number;
  }
  preferences?: string[]
  strategy?: string
  simulation_results?: Array<{ 
    option: string; 
    score: number;
    metrics: {
      cost: number;
      availability: number;
      risk: number;
    };
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
  }>
  options?: Array<{ name: string; parameters: { base_cost: number; risk: number; availability: number } }>
  weights?: number[]
  sensitivity?: {
    stability_index: number;
    margin: number;
    is_robust: boolean;
    critical_vectors: string[];
  }
  realized_outcomes?: {
    cost: number;
    availability: number;
    risk: number;
  }
  backtest_report?: {
    metrics: Record<string, {
      projected: number;
      realized: number;
      drift_pct: number;
      status: string;
    }>;
    foresight_score: number;
    judgment: "STRATEGIC_MATCH" | "PROJECTION_FAILURE";
  }
}

interface HistoryState {
  audits: AuditItem[]
  lastUpdated: number
  isLoading: boolean
  hasHydrated: boolean
  
  setAudits: (audits: AuditItem[]) => void
  setHasHydrated: (state: boolean) => void
  fetchHistory: () => Promise<void>
  recordRealizedData: (id: number, data: { cost: number; availability: number; risk: number }) => Promise<AuditItem['backtest_report']>
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      audits: [],
      lastUpdated: 0,
      isLoading: false,
      hasHydrated: false,

      setAudits: (audits) => set({ audits, lastUpdated: Date.now() }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
      
      clearHistory: () => set({ audits: [], lastUpdated: 0 }),

      fetchHistory: async () => {
        set({ isLoading: true })
        try {
            const token = useAuthStore.getState().token
            if (!token) return

            const res = await axios.get(`${API_BASE_URL}/decision/history`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            set({ audits: res.data, lastUpdated: Date.now(), isLoading: false })
        } catch (err) {
            console.error("Failed to fetch history", err)
            set({ isLoading: false })
        }
      },
      
      recordRealizedData: async (id, data) => {
        try {
          const token = useAuthStore.getState().token
          const res = await axios.post(`${API_BASE_URL}/decision/backtest/submit/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          const report = res.data.report
          
          set(state => ({
            audits: state.audits.map(a => a.id === id ? { 
              ...a, 
              realized_outcomes: data,
              backtest_report: report 
            } : a)
          }))
          
          return report
        } catch (err) {
          console.error("Failed to record realized data", err)
          throw err
        }
      }
    }),
    {
      name: 'decision-lens-history',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true)
      },
      partialize: (state) => ({ audits: state.audits, lastUpdated: state.lastUpdated }), // Don't persist loading state
    }
  )
)
