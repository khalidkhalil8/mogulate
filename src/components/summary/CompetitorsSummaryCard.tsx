
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
          competitors.map((competitor) => (
            <div key={competitor.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{competitor.name}</h3>
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    AI Found
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{competitor.description}</p>
              <Separator className="my-2" />
            </div>
          ))
        ) : (
          <p className="text-gray-500">No competitors identified</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CompetitorsSummaryCard;
