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
    {/* Tabs List matching the design */}
    <TabsList className="grid w-full grid-cols-4 mb-1 bg-gradient-to-r from-pink-500 to-blue-600 rounded-lg p-1 shadow-lg">
      <TabsTrigger
        value="stake"
        className="mb-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-700 data-[state=active]:text-white text-white/80 font-medium rounded-md transition-all duration-200 shadow-md border-2 border-transparent data-[state=active]:border-white/20"
      >
        Stake
      </TabsTrigger>
      <TabsTrigger
        value="redelegate"
        className="mb-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-700 data-[state=active]:text-white text-white/80 font-medium rounded-md transition-all duration-200 shadow-md border-2 border-transparent data-[state=active]:border-white/20"
      >
        Redelegate
      </TabsTrigger>
      <TabsTrigger
        value="unstake"
        className="mb-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-700 data-[state=active]:text-white text-white/80 font-medium rounded-md transition-all duration-200 shadow-md border-2 border-transparent data-[state=active]:border-white/20"
      >
        Unstake
      </TabsTrigger>
      <TabsTrigger
        value="rewards"
        className="mb-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-700 data-[state=active]:text-white text-white/80 font-medium rounded-md transition-all duration-200 shadow-md border-2 border-transparent data-[state=active]:border-white/20"
      >
        Rewards
      </TabsTrigger>
    </TabsList>

    <TabsContent value="stake" className="space-y-4">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white space-x-2">
            <FaArrowUp className="w-5 h-5 text-green-400" />
            <span>Delegate XOR</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Select Validator</label>
            <Select value={selectedValidator} onValueChange={setSelectedValidator}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Choose a validator" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {validators.map((validator) => (
                  <SelectItem key={validator.accountId} value={validator.accountId} className="text-white hover:bg-slate-700">
                    <div className="truncate">
                      {`${validator.accountId.slice(0, 8)}...${validator.accountId.slice(-6)} (${validator.commission}% commission)`}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Amount (XOR)</label>
            <Input
              type="text"
              placeholder="Enter amount to stake"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleStake}
            disabled={loading || !stakeAmount || !selectedValidator}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-600 to-blue-600 shadow-lg transition-all duration-200 hover:from-pink-700 hover:to-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Staking...' : 'Stake XOR'}
          </button>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="redelegate" className="space-y-4">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white space-x-2">
            <FaArrowUp className="w-5 h-5 text-orange-400" />
            <span>Redelegate XOR</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Select New Validator</label>
            <Select value={selectedValidator} onValueChange={setSelectedValidator}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Choose a validator" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {validators.map((validator) => (
                  <SelectItem key={validator.accountId} value={validator.accountId} className="text-white hover:bg-slate-700">
                    <div className="truncate">
                      {`${validator.accountId.slice(0, 8)}...${validator.accountId.slice(-6)} (${validator.commission}% commission)`}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Amount (XOR)</label>
            <Input
              type="text"
              placeholder="Enter amount to redelegate"
              value={redelegateAmount}
              onChange={(e) => setRedelegateAmount(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleRedelegate}
            disabled={loading || !redelegateAmount || !selectedValidator}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-600 to-blue-600 shadow-lg transition-all duration-200 hover:from-pink-700 hover:to-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Redelegating...' : 'Redelegate XOR'}
          </button>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="unstake" className="space-y-4">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white space-x-2">
            <FaArrowDown className="w-5 h-5 text-red-400" />
            <span>Unstake XOR</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Amount (XOR)</label>
            <Input
              type="text"
              placeholder="Enter amount to unstake"
              value={undelegateAmount}
              onChange={(e) => setUndelegateAmount(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleUndelegate}
            disabled={loading || !undelegateAmount}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-600 to-blue-600 shadow-lg transition-all duration-200 hover:from-pink-700 hover:to-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Unstaking...' : 'Unstake XOR'}
          </button>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="rewards" className="space-y-4">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white space-x-2">
            <FaCoins className="w-5 h-5 text-yellow-400" />
            <span>Claim Rewards</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {userStaking.pendingRewards} XOR
            </div>
            <div className="text-sm text-slate-400">Available Rewards</div>
          </div>
          <button
            onClick={handleClaimRewards}
            disabled={loading || parseFloat(userStaking.pendingRewards) === 0}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-600 to-blue-600 shadow-lg transition-all duration-200 hover:from-pink-700 hover:to-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Claiming...' : 'Claim Rewards'}
          </button>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
);

export default StakingActions;
