import React from 'react';
import MetricCard from './MetricCard';
import { FaBolt, FaShieldAlt, FaWallet } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdditionalMetricsGridProps {
  totalTransactions: number;
  networkHealth: number;
  activeAddresses: number;
  getStatusColor: (value: number, type: 'validators' | 'health' | 'apr') => string;
  formatNumber: (num: number) => string;
}

const AdditionalMetricsGrid: React.FC<AdditionalMetricsGridProps> = ({
  totalTransactions,
  networkHealth,
  activeAddresses,
  getStatusColor,
  formatNumber,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <MetricCard
      title="Total Transactions"
      icon={<FaBolt className="h-4 w-4 text-primary" />}
      value={formatNumber(totalTransactions)}
      description="Last 5 blocks"
    />
    <MetricCard
      title="Network Health"
      icon={<FaShieldAlt className="h-4 w-4 text-primary" />}
      value={`${networkHealth.toFixed(1)}%`}
      badge={
        <Badge className={cn('mt-2', getStatusColor(networkHealth, 'health'))}>
          {networkHealth >= 99 ? 'Excellent' : networkHealth >= 95 ? 'Good' : 'Poor'}
        </Badge>
      }
    />
    <MetricCard
      title="Active Addresses"
      icon={<FaWallet className="h-4 w-4 text-primary" />}
      value={formatNumber(activeAddresses)}
      description="Estimated"
    />
  </div>
);

export default AdditionalMetricsGrid; 