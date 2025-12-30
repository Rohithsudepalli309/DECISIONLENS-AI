export interface OptionItem {
  name: string;
  parameters: {
    base_cost: number;
    risk: number;
    availability: number;
  };
}

export interface DecisionData {
  domain: string;
  goal: string;
  constraints: {
    max_cost: number;
    min_availability: number;
  };
  preferences: string[];
  options: OptionItem[];
  weights: number[];
  algorithm?: 'topsis' | 'ahp';
  project_name?: string;
}

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
  options?: OptionItem[];
  simulation_results?: {
    ranked_options: {
      option: string;
      topsis_score: number;
      is_pareto_optimal?: boolean;
      metrics: { cost: number; availability: number; risk: number; };
    }[];
    sensitivity: Record<string, number>;
  };
  weights?: number[];
  sensitivity?: {
    stability_index: number;
    is_robust: boolean;
    critical_vectors?: string[];
    [key: string]: unknown;
  };
  correlations?: {
    pair: [string, string];
    coefficient: number;
    risk: "High" | "Low";
  }[];
  narrative?: string;
  chaos_report?: {
    variance_score: number;
    stability_index: number;
    bottlenecks: string[];
    stressed_top_option?: string;
    fragility_score?: number;
    is_strategic_trap?: boolean;
  };
  consensus_report?: {
    agreement_ratio: number;
    divergence_points: string[];
    consensus_score?: number;
    is_polarized?: boolean;
    persona_evaluations?: Record<string, {
      top_choice: string;
      scores: Record<string, number>;
    }>;
  };
}

export interface ManifoldData {
  option?: string;
  cost: number;
  availability: number;
  risk: number;
  topsis: number;
}
