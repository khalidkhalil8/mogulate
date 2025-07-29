
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Competitor } from '@/lib/types';

interface CompetitorsSummaryCardProps {
  competitors: Competitor[];
}

const CompetitorsSummaryCard: React.FC<CompetitorsSummaryCardProps> = ({ competitors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitors ({competitors.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {competitors.length > 0 ? (
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={competitor.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{competitor.name}</h3>
                    <a 
                      href={competitor.website.startsWith('http') ? competitor.website : `https://${competitor.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {competitor.website}
                    </a>
                  </div>
                  {competitor.isAiGenerated && (
                    <Badge className="bg-teal-100 text-teal-800 text-xs ml-2">
                      AI Found
                    </Badge>
                  )}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{competitor.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No competitors identified</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CompetitorsSummaryCard;
