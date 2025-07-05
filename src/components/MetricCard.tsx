import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import React from 'react';

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  badge?: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  icon,
  value,
  badge,
  description,
}) => (
  <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {badge && badge}
      {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
    </CardContent>
  </Card>
);

export default MetricCard; 