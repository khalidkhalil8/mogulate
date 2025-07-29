
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
              <Card key={competitor.id} className="bg-teal-50 border-teal-100">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-teal-900">AI-Found Competitor</h3>
                      {competitor.isAiGenerated && (
                        <Badge className="bg-teal-600 text-white text-xs">
                          AI Found
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-teal-800 mb-1">Name</h4>
                      <p className="text-teal-900 font-medium">{competitor.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-teal-800 mb-1">Website</h4>
                      <a 
                        href={competitor.website.startsWith('http') ? competitor.website : `https://${competitor.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {competitor.website}
                      </a>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-teal-800 mb-1">Description</h4>
                      <p className="text-teal-900 text-sm leading-relaxed">{competitor.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
