import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FaShieldAlt } from 'react-icons/fa';
import { formatBalance } from '@polkadot/util';

interface StakingOverviewProps {
  userStaking: {
    totalStaked: string;
    totalRewards: string;
    pendingRewards: string;
    delegations: { validator: string; amount: string; rewards: string }[];
  };
}

const StakingOverview = ({ userStaking }: StakingOverviewProps) => (
  <Card className="glass-card">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <FaShieldAlt className="w-5 h-5 text-pink-400" />
        <span>Staking Overview</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 text-pink-400"><FaShieldAlt className="w-5 h-5" /></span>
            {formatBalance(userStaking.totalStaked, { decimals: 10 })} XOR
          </div>
          <div className="text-sm text-muted-foreground">Total Staked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/20 text-orange-400"><FaShieldAlt className="w-5 h-5" /></span>
            {formatBalance(userStaking.totalRewards, { decimals: 10 })} XOR
          </div>
          <div className="text-sm text-muted-foreground">Total Rewards</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400"><FaShieldAlt className="w-5 h-5" /></span>
            {formatBalance(userStaking.pendingRewards, { decimals: 10 })} XOR
          </div>
          <div className="text-sm text-muted-foreground">Pending Rewards</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400/20 text-yellow-500"><FaShieldAlt className="w-5 h-5" /></span>
            {userStaking.delegations.length}
          </div>
          <div className="text-sm text-muted-foreground">Active Delegations</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StakingOverview; 