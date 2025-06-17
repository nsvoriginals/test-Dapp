
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, TrendingUp, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StakingInterface = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedValidator, setSelectedValidator] = useState('');
  const { toast } = useToast();

  // Mock user staking data
  const userStaking = {
    totalStaked: 15000,
    totalRewards: 1875,
    pendingRewards: 125.50,
    delegations: [
      { validator: 'Cosmos Hub Validator', amount: 8000, rewards: 1000 },
      { validator: 'Secure Staking Co.', amount: 4000, rewards: 500 },
      { validator: 'Decentralized Pool', amount: 3000, rewards: 375 },
    ]
  };

  const topValidators = [
    { name: 'Cosmos Hub Validator', commission: '5%', apr: '12.8%', uptime: '99.9%', status: 'active' },
    { name: 'Secure Staking Co.', commission: '3%', apr: '12.5%', uptime: '99.8%', status: 'active' },
    { name: 'Decentralized Pool', commission: '7%', apr: '12.2%', uptime: '99.7%', status: 'active' },
    { name: 'Community Validator', commission: '4%', apr: '12.6%', uptime: '99.5%', status: 'active' },
  ];

  const stakingDistribution = userStaking.delegations.map((delegation, index) => ({
    name: delegation.validator,
    value: delegation.amount,
    color: ['#3B82F6', '#8B5CF6', '#10B981'][index] || '#6B7280'
  }));

  const handleStake = () => {
    if (!stakeAmount || !selectedValidator) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and select a validator",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Delegation Successful!",
      description: `Successfully delegated ${stakeAmount} tokens to ${selectedValidator}`,
    });
    setStakeAmount('');
    setSelectedValidator('');
  };

  const handleClaimRewards = () => {
    toast({
      title: "Rewards Claimed!",
      description: `Claimed ${userStaking.pendingRewards} tokens in rewards`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Staked</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{userStaking.totalStaked.toLocaleString()}</div>
            <p className="text-xs text-blue-300 mt-1">ATOM tokens</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Rewards</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{userStaking.totalRewards.toLocaleString()}</div>
            <p className="text-xs text-green-300 mt-1">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Pending Rewards</CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{userStaking.pendingRewards}</div>
            <Button 
              size="sm" 
              className="mt-2 bg-purple-600 hover:bg-purple-700"
              onClick={handleClaimRewards}
            >
              Claim
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">APR</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12.5%</div>
            <p className="text-xs text-orange-300 mt-1">Average return</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staking Actions */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="delegate" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-black/40">
              <TabsTrigger value="delegate" className="data-[state=active]:bg-blue-600">Delegate</TabsTrigger>
              <TabsTrigger value="redelegate" className="data-[state=active]:bg-blue-600">Redelegate</TabsTrigger>
              <TabsTrigger value="undelegate" className="data-[state=active]:bg-blue-600">Undelegate</TabsTrigger>
            </TabsList>

            <TabsContent value="delegate">
              <Card className="bg-black/40 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Delegate Tokens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Amount to Stake</label>
                    <Input
                      type="number"
                      placeholder="Enter amount..."
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Select Validator</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {topValidators.map((validator) => (
                        <div
                          key={validator.name}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedValidator === validator.name
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedValidator(validator.name)}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-medium">{validator.name}</span>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                              {validator.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Commission: {validator.commission}</span>
                            <span>APR: {validator.apr}</span>
                            <span>Uptime: {validator.uptime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleStake}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!stakeAmount || !selectedValidator}
                  >
                    Delegate Tokens
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="redelegate">
              <Card className="bg-black/40 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Redelegate Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Move your staked tokens from one validator to another without unstaking period.</p>
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="undelegate">
              <Card className="bg-black/40 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Undelegate Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">Unstake your tokens (21-day unbonding period applies).</p>
                  <Button className="w-full bg-red-600 hover:bg-red-700" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Staking Distribution */}
        <div>
          <Card className="bg-black/40 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Staking Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stakingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stakingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2 mt-4">
                {userStaking.delegations.map((delegation, index) => (
                  <div key={delegation.validator} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stakingDistribution[index].color }}
                      ></div>
                      <span className="text-gray-300">{delegation.validator}</span>
                    </div>
                    <span className="text-white font-medium">{delegation.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StakingInterface;
