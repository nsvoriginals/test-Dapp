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
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <FaShieldAlt className="w-5 h-5 text-primary" />
        <span>Staking Overview</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {formatBalance(userStaking.totalStaked, { decimals: 10 })} XOR
          </div>
          <div className="text-sm text-muted-foreground">Total Staked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {formatBalance(userStaking.totalRewards, { decimals: 10 })} XOR
          </div>
          <div className="text-sm text-muted-foreground">Total Rewards</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {formatBalance(userStaking.pendingRewards, { decimals: 10 })} XOR
          </div>
          <div className="text-sm text-muted-foreground">Pending Rewards</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {userStaking.delegations.length}
          </div>
          <div className="text-sm text-muted-foreground">Active Delegations</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StakingOverview; 