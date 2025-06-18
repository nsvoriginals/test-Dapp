import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CellProps } from 'recharts';
import { FaDollarSign, FaChartLine, FaShieldAlt, FaClock } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StakingCalculator from './StakingCalculator';
import ValidatorComparison from './ValidatorComparison';
import StakingGuide from './StakingGuide';

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
    color: [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--secondary))',
      'hsl(var(--destructive))',
      'hsl(var(--muted-foreground))',
      'hsl(var(--primary) / 0.7)',
      'hsl(var(--accent) / 0.7)',
      'hsl(var(--secondary) / 0.7)',
      'hsl(var(--destructive) / 0.7)',
    ][index % 9]
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
    <div className="space-y-8 px-4">
      {/* Staking Guide */}
      <StakingGuide />

      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center items-center">
        <Card className="bg-card border border-border mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staked</CardTitle>
            <FaShieldAlt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userStaking.totalStaked.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">ATOM tokens</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards</CardTitle>
            <FaChartLine className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userStaking.totalRewards.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Rewards</CardTitle>
            <FaClock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userStaking.pendingRewards}</div>
            <Button 
              size="sm" 
              className="mt-2 bg-primary hover:bg-primary/90"
              onClick={handleClaimRewards}
            >
              Claim
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">APR</CardTitle>
            <FaDollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12.5%</div>
            <p className="text-xs text-muted-foreground mt-1">Average return</p>
          </CardContent>
        </Card>
      </div>

      {/* Staking Calculator */}
      <StakingCalculator />

      {/* Validator Comparison */}
      <ValidatorComparison />

      {/* Staking Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="delegate" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted/40">
              <TabsTrigger value="delegate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Delegate</TabsTrigger>
              <TabsTrigger value="redelegate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Redelegate</TabsTrigger>
              <TabsTrigger value="undelegate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Undelegate</TabsTrigger>
            </TabsList>

            <TabsContent value="delegate">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Delegate Tokens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Amount to Stake</label>
                    <Input
                      type="number"
                      placeholder="Enter amount..."
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Validator</label>
                    <Select onValueChange={setSelectedValidator} value={selectedValidator}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select a validator" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        {topValidators.map((validator) => (
                          <SelectItem key={validator.name} value={validator.name}>
                            <div className="flex flex-col">
                              <span className="font-medium">{validator.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Commission: {validator.commission} | APR: {validator.apr} | Uptime: {validator.uptime}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleStake}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!stakeAmount || !selectedValidator}
                  >
                    Delegate Tokens
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="redelegate">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Redelegate Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Move your staked tokens from one validator to another without unstaking period.</p>
                  <Button className="w-full mt-4 bg-primary hover:bg-primary/90" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="undelegate">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Undelegate Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Withdraw your staked tokens. Note: This will incur an unbonding period.</p>
                  <Button className="w-full mt-4 bg-primary hover:bg-primary/90" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Staking Distribution */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">My Staking Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stakingDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {stakingDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [`${value.toLocaleString()} ATOM`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 w-full px-4">
              {userStaking.delegations.map((delegation) => (
                <div key={delegation.validator} className="flex items-center space-x-2">
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stakingDistribution.find(d => d.name === delegation.validator)?.color }}
                  ></span>
                  <span className="text-sm text-muted-foreground">{delegation.validator}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delegations Table */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">My Delegations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Validator
                  </th>
                  <th className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Staked Amount
                  </th>
                  <th className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Rewards Earned
                  </th>
                </tr>
              </thead>
              <tbody>
                {userStaking.delegations.map((delegation, index) => (
                  <tr key={index} className="border-b border-muted last:border-b-0">
                    <td className="px-5 py-5 text-sm text-foreground">
                      {delegation.validator}
                    </td>
                    <td className="px-5 py-5 text-sm text-foreground">
                      {delegation.amount.toLocaleString()} ATOM
                    </td>
                    <td className="px-5 py-5 text-sm text-foreground">
                      {delegation.rewards.toLocaleString()} ATOM
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {userStaking.delegations.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No active delegations found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StakingInterface;
