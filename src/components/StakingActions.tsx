import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FaArrowUp, FaArrowDown, FaCoins } from 'react-icons/fa';

interface Validator {
  accountId: string;
  commission: number;
  totalStake: string;
  ownStake: string;
  nominatorCount: number;
  isActive: boolean;
}

interface StakingActionsProps {
  validators: Validator[];
  selectedValidator: string;
  setSelectedValidator: (v: string) => void;
  stakeAmount: string;
  setStakeAmount: (v: string) => void;
  redelegateAmount: string;
  setRedelegateAmount: (v: string) => void;
  undelegateAmount: string;
  setUndelegateAmount: (v: string) => void;
  loading: boolean;
  handleStake: () => void;
  handleRedelegate: () => void;
  handleUndelegate: () => void;
  userStaking: {
    pendingRewards: string;
  };
  handleClaimRewards: () => void;
}

const StakingActions = ({
  validators,
  selectedValidator,
  setSelectedValidator,
  stakeAmount,
  setStakeAmount,
  redelegateAmount,
  setRedelegateAmount,
  undelegateAmount,
  setUndelegateAmount,
  loading,
  handleStake,
  handleRedelegate,
  handleUndelegate,
  userStaking,
  handleClaimRewards
}: StakingActionsProps) => (
  <Tabs defaultValue="stake" className="space-y-4">
    <TabsList className="grid w-full grid-cols-4 bg-zinc-300 rounded-lg p-1">
      <TabsTrigger value="stake" className="data-[state=active]:bg-zinc-300 data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm text-zinc-600 font-medium rounded-md transition-colors">Stake</TabsTrigger>
      <TabsTrigger value="redelegate" className="data-[state=active]:bg-zinc-300 data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm text-zinc-600 font-medium rounded-md transition-colors">Redelegate</TabsTrigger>
      <TabsTrigger value="unstake" className="data-[state=active]:bg-zinc-300 data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm text-zinc-600 font-medium rounded-md transition-colors">Unstake</TabsTrigger>
      <TabsTrigger value="rewards" className="data-[state=active]:bg-zinc-300 data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm text-zinc-600 font-medium rounded-md transition-colors">Rewards</TabsTrigger>
    </TabsList>
    <TabsContent value="stake" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaArrowUp className="w-5 h-5 text-white" />
            <span>Delegate XOR</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Select Validator</label>
            <Select value={selectedValidator} onValueChange={setSelectedValidator}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a validator" />
              </SelectTrigger>
              <SelectContent>
                {validators.map((validator) => (
                  <SelectItem key={validator.accountId} value={validator.accountId} title={validator.accountId}>
                    <div className="truncate">
                      {`${validator.accountId.slice(0, 8)}...${validator.accountId.slice(-6)} (${validator.commission}% commission)`}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Amount (XOR)</label>
            <Input
              type="text"
              placeholder="Enter amount to stake"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
          </div>
          <button
            onClick={handleStake}
            disabled={loading || !stakeAmount || !selectedValidator}
            className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-700 to-blue-700 shadow-md transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Staking...' : 'Stake XOR'}
          </button>
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="redelegate" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaArrowUp className="w-5 h-5 text-white" />
            <span>Redelegate XOR</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Select New Validator</label>
            <Select value={selectedValidator} onValueChange={setSelectedValidator}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a validator" />
              </SelectTrigger>
              <SelectContent>
                {validators.map((validator) => (
                  <SelectItem key={validator.accountId} value={validator.accountId} title={validator.accountId}>
                    <div className="truncate">
                      {`${validator.accountId.slice(0, 8)}...${validator.accountId.slice(-6)} (${validator.commission}% commission)`}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Amount (XOR)</label>
            <Input
              type="text"
              placeholder="Enter amount to redelegate"
              value={redelegateAmount}
              onChange={(e) => setRedelegateAmount(e.target.value)}
            />
          </div>
          <button
            onClick={handleRedelegate}
            disabled={loading || !redelegateAmount || !selectedValidator}
            className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-700 to-blue-700 shadow-md transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Redelegating...' : 'Redelegate XOR'}
          </button>
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="unstake" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaArrowDown className="w-5 h-5 text-white" />
            <span>Unstake XOR</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Amount (XOR)</label>
            <Input
              type="text"
              placeholder="Enter amount to unstake"
              value={undelegateAmount}
              onChange={(e) => setUndelegateAmount(e.target.value)}
            />
          </div>
          <button
            onClick={handleUndelegate}
            disabled={loading || !undelegateAmount}
            className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-700 to-blue-700 shadow-md transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Unstaking...' : 'Unstake XOR'}
          </button>
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="rewards" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaCoins className="w-5 h-5 text-white" />
            <span>Claim Rewards</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-2">
              {userStaking.pendingRewards} XOR
            </div>
            <div className="text-sm text-muted-foreground">Available Rewards</div>
          </div>
          <button
            onClick={handleClaimRewards}
            disabled={loading || parseFloat(userStaking.pendingRewards) === 0}
            className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-700 to-blue-700 shadow-md transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Claiming...' : 'Claim Rewards'}
          </button>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
);

export default StakingActions; 