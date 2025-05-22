
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ValidationPlanSummaryCardProps {
  validationPlan: string;
}

const ValidationPlanSummaryCard: React.FC<ValidationPlanSummaryCardProps> = ({ validationPlan }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{validationPlan}</p>
      </CardContent>
    </Card>
  );
};

export default ValidationPlanSummaryCard;
