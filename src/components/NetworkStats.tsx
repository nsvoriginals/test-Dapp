
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Clock, DollarSign, Activity, Shield } from 'lucide-react';

const NetworkStats = () => {
  // Mock data
  const networkData = {
    validatorsOnline: 178,
    totalValidators: 200,
    stakingAPR: 12.5,
    avgBlockTime: 6.2,
    totalTransactions: 15234567,
    totalValueLocked: 2340000000,
    networkHealth: 99.8,
    activeAddresses: 45231
  };

  const chartData = [
    { time: '00:00', transactions: 1200, validators: 175 },
    { time: '04:00', transactions: 800, validators: 178 },
    { time: '08:00', transactions: 2100, validators: 180 },
    { time: '12:00', transactions: 3400, validators: 179 },
    { time: '16:00', transactions: 2800, validators: 177 },
    { time: '20:00', transactions: 1900, validators: 178 },
  ];

  const stakingData = [
    { period: 'Jan', staked: 180000000, rewards: 15000000 },
    { period: 'Feb', staked: 195000000, rewards: 16250000 },
    { period: 'Mar', staked: 210000000, rewards: 17500000 },
    { period: 'Apr', staked: 225000000, rewards: 18750000 },
    { period: 'May', staked: 240000000, rewards: 20000000 },
    { period: 'Jun', staked: 258000000, rewards: 21500000 },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Validators Online</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {networkData.validatorsOnline}/{networkData.totalValidators}
            </div>
            <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-300 border-green-500/30">
              {((networkData.validatorsOnline / networkData.totalValidators) * 100).toFixed(1)}% Active
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Staking APR</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{networkData.stakingAPR}%</div>
            <p className="text-xs text-purple-300 mt-2">Annual Percentage Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30 hover:border-green-400/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Block Time</CardTitle>
            <Clock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{networkData.avgBlockTime}s</div>
            <p className="text-xs text-green-300 mt-2">Average Block Time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(networkData.totalValueLocked)}</div>
            <p className="text-xs text-orange-300 mt-2">TVL in USD</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>Network Activity (24h)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Staking Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stakingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="period" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Staked']}
                />
                <Area 
                  type="monotone" 
                  dataKey="staked" 
                  stroke="#8B5CF6" 
                  fill="url(#colorStaked)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorStaked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/40 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Network Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400 mb-2">{networkData.networkHealth}%</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${networkData.networkHealth}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">Uptime last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {networkData.totalTransactions.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Since genesis block</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Active Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {networkData.activeAddresses.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkStats;
