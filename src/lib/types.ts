export interface Competitor {
  id: string;
  name: string;
  website: string;
  description: string;
  isAiGenerated?: boolean;
  [key: string]: any; // Add index signature to make it Json-compatible
}

export interface MarketGapAnalysis {
  marketGaps: string[];
  positioningSuggestions: string[];
}

export interface MarketGapWithScore {
  gap: string;
  positioningSuggestion: string;
  score: number;
  rationale: string;
}

export interface MarketGapScoringAnalysis {
  marketGaps: MarketGapWithScore[];
}

export interface IdeaData {
  idea: string;
  competitors: Competitor[];
  marketGaps: string;
  features: Feature[];
  validationPlan: string;
  marketGapAnalysis?: MarketGapAnalysis;
  marketGapScoringAnalysis?: MarketGapScoringAnalysis;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'Planned' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
}

// API response types
export interface CompetitorDiscoveryResponse {
  competitors: Competitor[];
  success: boolean;
  error?: string;
  tier?: string;
  remainingUsage?: number;
  nextReset?: string;
}

export interface MarketGapAnalysisResponse {
  analysis: MarketGapAnalysis;
  success: boolean;
  error?: string;
  tier?: string;
  remainingUsage?: number;
  nextReset?: string;
}
