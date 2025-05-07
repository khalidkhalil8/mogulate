
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
  validationPlan: string;
  marketGapAnalysis?: MarketGapAnalysis;
}

// API response types
export interface CompetitorDiscoveryResponse {
  competitors: Competitor[];
  success: boolean;
  error?: string;
  tier?: string;
  remainingUsage?: number;
}

export interface MarketGapAnalysisResponse {
  analysis: MarketGapAnalysis;
  success: boolean;
  error?: string;
  tier?: string;
  remainingUsage?: number;
}
