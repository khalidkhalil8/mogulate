
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IdeaSummaryCardProps {
  idea: string;
}

const IdeaSummaryCard: React.FC<IdeaSummaryCardProps> = ({ idea }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Idea</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{idea}</p>
      </CardContent>
    </Card>
  );
};

export default IdeaSummaryCard;
