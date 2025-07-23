import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FaShieldAlt, FaCoins, FaUsers, FaClock, FaChartLine, FaPercentage } from 'react-icons/fa';

interface StakingOverviewProps {
  userStaking: {
    totalStaked: string;
    totalRewards: string;
    pendingRewards: string;
    delegations: { validator: string; amount: string; rewards: string }[];
  };
  balance?: string;
  validators?: Array<{
    accountId: string;
    commission: number;
    totalStake: string;
    ownStake: string;
    nominatorCount: number;
    isActive: boolean;
  }>;
  networkInfo?: {
    totalIssuance?: string;
    totalStaked?: string;
    avgApr?: number;
    erasPerDay?: number;
  };
}

const StakingOverview = ({ 
  userStaking, 
  balance = "0",
  validators = [],
  networkInfo = {}
}: StakingOverviewProps) => {
  
  // Calculate additional metrics with better parsing
  const metrics = useMemo(() => {
    // Parse staking values - handle both string numbers and formatted strings
    const parseStakingValue = (value: string): number => {
      if (!value || value === "0") return 0;
      // Remove commas and parse
      const cleaned = value.replace(/,/g, '');
      return parseFloat(cleaned) || 0;
    };
    
    const totalStaked = parseStakingValue(userStaking.totalStaked);
    const totalRewards = parseStakingValue(userStaking.totalRewards);
    const pendingRewards = parseStakingValue(userStaking.pendingRewards);
    const totalBalance = parseStakingValue(balance);
    
    console.log('Overview metrics calculation:', {
      userStaking,
      totalStaked,
      totalBalance,
      rawTotalStaked: userStaking.totalStaked
    });
    
    // Calculate portfolio percentage
    const totalAssets = totalStaked + totalBalance;
    const portfolioStaked = totalAssets > 0 ? (totalStaked / totalAssets) * 100 : 0;
    
    // Calculate APY estimate
    const estimatedApy = totalStaked > 0 && totalRewards > 0 
      ? (totalRewards / totalStaked) * 100 * 365 / 30
      : networkInfo.avgApr || 12.5;
    
    // Active validators count
    const activeValidators = userStaking.delegations.length;
    
    // Average commission
    const avgCommission = userStaking.delegations.length > 0
      ? userStaking.delegations.reduce((acc, delegation) => {
          const validator = validators.find(v => v.accountId === delegation.validator);
          return acc + (validator?.commission || 0);
        }, 0) / userStaking.delegations.length
      : 0;
    
    return {
      totalStaked,
      totalRewards,
      pendingRewards,
      portfolioStaked,
      estimatedApy,
      activeValidators,
      avgCommission,
      totalValue: totalStaked + totalRewards,
      claimableRewards: pendingRewards,
      totalBalance
    };
  }, [userStaking, balance, validators, networkInfo]);

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num === 0) return "0";
    if (num < 0.01) return "< 0.01";
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Overview Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <FaShieldAlt className="w-5 h-5 text-pink-400" />
              <span>Staking Overview</span>
            </div>
            {metrics.totalStaked > 0 && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Active Staker
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Staked */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400">
                  <FaShieldAlt className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(metrics.totalStaked, 3)} XOR
              </div>
              <div className="text-sm text-slate-400">Total Staked</div>
              {metrics.portfolioStaked > 0 && (
                <div className="text-xs text-slate-500">
                  {formatNumber(metrics.portfolioStaked)}% of portfolio
                </div>
              )}
            </div>

            {/* Total Value */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 text-purple-400">
                  <FaChartLine className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(metrics.totalValue, 3)} XOR
              </div>
              <div className="text-sm text-slate-400">Total Value</div>
              <div className="text-xs text-slate-500">
                Staked + Rewards
              </div>
            </div>

            {/* Total Rewards */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 text-orange-400">
                  <FaCoins className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(metrics.totalRewards, 3)} XOR
              </div>
              <div className="text-sm text-slate-400">Total Rewards</div>
              {metrics.totalStaked > 0 && (
                <div className="text-xs text-slate-500">
                  {formatNumber((metrics.totalRewards / metrics.totalStaked) * 100)}% return
                </div>
              )}
            </div>

            {/* Pending Rewards */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-400">
                  <FaClock className="w-5 h-5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(metrics.pendingRewards, 3)} XOR
              </div>
              <div className="text-sm text-slate-400">Pending Rewards</div>
              {metrics.pendingRewards > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                  Ready to Claim
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Staking Performance */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center space-x-2">
              <FaPercentage className="w-4 h-4 text-blue-400" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Estimated APY</span>
              <span className="text-white font-semibold">
                {formatNumber(metrics.estimatedApy)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Avg Commission</span>
              <span className="text-white font-semibold">
                {formatNumber(metrics.avgCommission)}%
              </span>
            </div>
            {metrics.portfolioStaked > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Portfolio Staked</span>
                  <span className="text-white">{formatNumber(metrics.portfolioStaked)}%</span>
                </div>
                <Progress 
                  value={metrics.portfolioStaked} 
                  className="h-2 bg-slate-700"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Delegations */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center space-x-2">
              <FaUsers className="w-4 h-4 text-green-400" />
              <span>Delegations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Active Validators</span>
              <span className="text-white font-semibold text-xl">
                {metrics.activeValidators}
              </span>
            </div>
            {userStaking.delegations.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-slate-500">Active Delegations:</span>
                {userStaking.delegations.slice(0, 3).map((delegation, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 truncate">
                      {delegation.validator.slice(0, 8)}...{delegation.validator.slice(-6)}
                    </span>
                    <span className="text-white">
                      {formatNumber(parseFloat(delegation.amount) || 0, 3)} XOR
                    </span>
                  </div>
                ))}
                {userStaking.delegations.length > 3 && (
                  <div className="text-xs text-slate-500 text-center">
                    +{userStaking.delegations.length - 3} more
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center space-x-2">
              <FaCoins className="w-4 h-4 text-yellow-400" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Available Balance</span>
              <span className="text-white font-semibold">
                {formatNumber(metrics.totalBalance, 3)} XOR
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Network Validators</span>
              <span className="text-white font-semibold">
                {validators.length}
              </span>
            </div>
            {metrics.claimableRewards > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                <div className="text-yellow-400 text-xs font-medium">
                  🎉 You have claimable rewards!
                </div>
                <div className="text-white text-sm">
                  {formatNumber(metrics.claimableRewards, 3)} XOR
                </div>
              </div>
            )}
            {metrics.totalStaked === 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                <div className="text-blue-400 text-xs font-medium">
                  💡 Start staking to earn rewards
                </div>
                <div className="text-slate-400 text-xs">
                  Estimated APY: {formatNumber(networkInfo.avgApr || 12.5)}%
                </div>
              </div>
            )}
            {metrics.totalStaked > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                <div className="text-green-400 text-xs font-medium">
                  ✅ Actively Staking
                </div>
                <div className="text-slate-400 text-xs">
                  Earning ~{formatNumber(metrics.estimatedApy)}% APY
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StakingOverview;