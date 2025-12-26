import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DecisionData } from '@/components/DecisionStepper'

export interface DecisionResults {
  id?: number;
  strategy: string;
  domain: string;
  ranked_options: {
    option: string;
    topsis_score: number;
    metrics: {
      cost: number;
      availability: number;
      risk: number;
    };
  }[];
  simulations: {
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
  disclaimer: string;
  sensitivity?: {
    stability_index: number;
    margin: number;
    is_robust: boolean;
    critical_vectors: string[];
  };
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
  
  setFormData: (data: DecisionData) => void
  setStep: (step: number) => void
  setResults: (results: DecisionResults | null) => void
  setView: (view: 'hero' | 'stepper' | 'results' | 'settings') => void
  setHasHydrated: (state: boolean) => void
  setGuardrails: (guardrails: Guardrails) => void
  resetDecision: () => void
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
  weights: [0.4, 0.4, 0.2]
}

const defaultGuardrails: Guardrails = {
  iterations: 1000,
  confidenceLevel: 0.95,
  volatilityThreshold: 0.1
}

export const useDecisionStore = create<DecisionState>()(
  persist(
    (set) => ({
      formData: initialFormData,
      currentStep: 1,
      results: null,
      activeView: 'hero',
      hasHydrated: false,
      guardrails: defaultGuardrails,

      setFormData: (data) => set({ formData: data }),
      setStep: (step) => set({ currentStep: step }),
      setResults: (results) => set({ results }),
      setView: (view) => set({ activeView: view }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setGuardrails: (guardrails) => set({ guardrails }),
      resetDecision: () => set({ 
        formData: initialFormData, 
        currentStep: 1, 
        results: null, 
        activeView: 'hero',
        guardrails: defaultGuardrails
      }),
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
