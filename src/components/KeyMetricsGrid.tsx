import React from 'react';
import MetricCard from './MetricCard';
import { FaUsers, FaChartLine, FaClock, FaDollarSign } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KeyMetricsGridProps {
  validatorsOnline: number;
  totalValidators: number;
  validatorPercentage: string;
  stakingAPR: number;
  avgBlockTime: number;
  totalValueLocked: string;
  getStatusColor: (value: number, type: 'validators' | 'health' | 'apr') => string;
  formatNumber: (num: number) => string;
}

const KeyMetricsGrid: React.FC<KeyMetricsGridProps> = ({
  validatorsOnline,
  totalValidators,
  validatorPercentage,
  stakingAPR,
  avgBlockTime,
  totalValueLocked,
  getStatusColor,
  formatNumber,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <MetricCard
      title="Validators Online"
      icon={<FaUsers className="h-4 w-4 text-primary" />}
      value={`${validatorsOnline}/${totalValidators}`}
      badge={
        <Badge className={cn('mt-2', getStatusColor(validatorsOnline, 'validators'))}>
          {validatorPercentage}% Active
        </Badge>
      }
    />
    <MetricCard
      title="Staking APR"
      icon={<FaChartLine className="h-4 w-4 text-primary" />}
      value={`${stakingAPR}%`}
      badge={
        <Badge className={cn('mt-2', getStatusColor(stakingAPR, 'apr'))}>
          Current Rate
        </Badge>
      }
    />
    <MetricCard
      title="Block Time"
      icon={<FaClock className="h-4 w-4 text-primary" />}
      value={`${avgBlockTime.toFixed(1)}s`}
      description="Average Block Time"
    />
    <MetricCard
      title="Total Value Locked"
      icon={<FaDollarSign className="h-4 w-4 text-primary" />}
      value={formatNumber(parseFloat(totalValueLocked) || 0)}
      description="TVL in XOR"
    />
  </div>
);

export default KeyMetricsGrid; 