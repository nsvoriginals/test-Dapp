import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FaDollarSign, FaChartLine, FaShieldAlt, FaClock } from 'react-icons/fa';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StakingInterface = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedValidator, setSelectedValidator] = useState('');
  const [toastMessage, setToastMessage] = useState('');

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
    color: ['#3b82f6', '#10b981', '#f59e0b'][index % 3]
  }));

  const handleStake = () => {
    if (!stakeAmount || !selectedValidator) {
      setToastMessage("Please enter amount and select a validator");
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setToastMessage(`Successfully delegated ${stakeAmount} tokens to ${selectedValidator}`);
    setTimeout(() => setToastMessage(''), 3000);
    setStakeAmount('');
    setSelectedValidator('');
  };

  const handleClaimRewards = () => {
    setToastMessage(`Claimed ${userStaking.pendingRewards} tokens in rewards`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-3 rounded shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-blue-600">{`${payload[0].value.toLocaleString()} ATOM`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-card p-2 sm:p-4 lg:p-6">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded shadow-lg">
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Staking Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Manage your ATOM staking rewards</p>
        </div>

        {/* Staking Overview - Fully Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Staked</CardTitle>
              <FaShieldAlt className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                {userStaking.totalStaked.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">ATOM tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Rewards</CardTitle>
              <FaChartLine className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                {userStaking.totalRewards.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pending Rewards</CardTitle>
              <FaClock className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                {userStaking.pendingRewards}
              </div>
              <Button 
                size="sm" 
                className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                onClick={handleClaimRewards}
              >
                Claim
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">APR</CardTitle>
              <FaDollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">12.5%</div>
              <p className="text-xs text-muted-foreground mt-1">Average return</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Staking Actions - Mobile First */}
          <div className="xl:col-span-2">
            <Tabs defaultValue="delegate" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted/40 p-1 rounded-lg">
                <TabsTrigger 
                  value="delegate" 
                  className="text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  Delegate
                </TabsTrigger>
                <TabsTrigger 
                  value="redelegate" 
                  className="text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  Redelegate
                </TabsTrigger>
                <TabsTrigger 
                  value="undelegate" 
                  className="text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  Undelegate
                </TabsTrigger>
              </TabsList>

              <TabsContent value="delegate">
                <Card className="bg-card border border-border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl text-foreground">Delegate Tokens</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Amount to Stake
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter amount..."
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="w-full bg-card border-border text-foreground text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Select Validator
                      </label>
                      <Select onValueChange={setSelectedValidator} value={selectedValidator}>
                        <SelectTrigger className="w-full bg-card border-border text-foreground text-sm sm:text-base">
                          <SelectValue placeholder="Select a validator" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border max-h-60 overflow-y-auto">
                          {topValidators.map((validator) => (
                            <SelectItem key={validator.name} value={validator.name} className="text-sm">
                              <div className="flex flex-col py-1">
                                <span className="font-medium text-foreground">{validator.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  Commission: {validator.commission} | APR: {validator.apr}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleStake}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base py-2 sm:py-3"
                      disabled={!stakeAmount || !selectedValidator}
                    >
                      Delegate Tokens
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="redelegate">
                <Card className="bg-card border border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl text-foreground">Redelegate Tokens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Move your staked tokens from one validator to another without unstaking period.
                    </p>
                    <Button className="w-full mt-4 bg-muted text-muted-foreground text-sm sm:text-base py-2 sm:py-3" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="undelegate">
                <Card className="bg-card border border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl text-foreground">Undelegate Tokens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Withdraw your staked tokens. Note: This will incur an unbonding period.
                    </p>
                    <Button className="w-full mt-4 bg-muted text-muted-foreground text-sm sm:text-base py-2 sm:py-3" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Responsive Chart */}
          <div className="xl:col-span-1">
            <Card className="bg-card border border-border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl text-foreground">Staking Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 sm:h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stakingDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {stakingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => (
                          <span className="text-xs sm:text-sm text-foreground">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Responsive Delegations Table */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-foreground">My Delegations</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Mobile View - Cards */}
            <div className="block sm:hidden">
              {userStaking.delegations.map((delegation, index) => (
                <div key={index} className="border-b border-gray-200 p-4 last:border-b-0">
                  <div className="font-medium text-foreground mb-2">{delegation.validator}</div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Staked: {delegation.amount.toLocaleString()} ATOM</span>
                    <span>Rewards: {delegation.rewards.toLocaleString()} ATOM</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validator
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staked Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rewards Earned
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userStaking.delegations.map((delegation, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {delegation.validator}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {delegation.amount.toLocaleString()} ATOM
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {delegation.rewards.toLocaleString()} ATOM
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {userStaking.delegations.length === 0 && (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
                No active delegations found.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Responsive Validator List */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-foreground">Top Validators</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Mobile View - Cards */}
            <div className="block lg:hidden">
              {topValidators.map((validator, index) => (
                <div key={index} className="border-b border-gray-200 p-4 last:border-b-0">
                  <div className="font-medium text-foreground mb-2">{validator.name}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span>Commission: {validator.commission}</span>
                    <span>APR: {validator.apr}</span>
                    <span>Uptime: {validator.uptime}</span>
                    <Badge className="bg-success/10 text-success text-xs w-fit">
                      {validator.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validator
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      APR
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topValidators.map((validator, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {validator.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {validator.commission}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {validator.apr}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {validator.uptime}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Badge className="bg-success/10 text-success">
                          {validator.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StakingInterface;