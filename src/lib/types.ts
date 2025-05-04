
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
