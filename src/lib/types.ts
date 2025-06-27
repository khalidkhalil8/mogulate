
export interface Competitor {
  id: string;
  name: string;
  website: string;
  description: string;
  isAiGenerated?: boolean;
}

export interface MarketGapAnalysis {
  marketGaps: string[];
  positioningSuggestions: string[];
}

export interface IdeaData {
  idea: string;
  competitors: Competitor[];
  marketGaps: string;
  marketGapAnalysis?: MarketGapAnalysis;
  features: Feature[];
  validationPlan: string;
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
