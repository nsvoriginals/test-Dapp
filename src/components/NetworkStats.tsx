import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FaChartLine, FaUsers, FaClock, FaDollarSign, FaShieldAlt } from 'react-icons/fa';
import { FaBolt, FaWallet } from 'react-icons/fa6';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

// Mock data moved outside component
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

const NetworkStats = () => {
  // Memoized chart data (if derived from props/state in future)
  const memoChartData = useMemo(() => chartData, []);
  const memoStakingData = useMemo(() => stakingData, []);

  const getStatusColor = (value: number, type: 'validators' | 'health' | 'apr') => {
    if (type === 'validators') {
      const percentage = (value / networkData.totalValidators) * 100;
      if (percentage >= 90) return 'bg-green-500/20 text-green-500 border-green-500/30';
      if (percentage >= 75) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    }
    if (type === 'health') {
      if (value >= 99) return 'bg-green-500/20 text-green-500 border-green-500/30';
      if (value >= 95) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    }
    if (type === 'apr') {
      if (value >= 10) return 'bg-green-500/20 text-green-500 border-green-500/30';
      if (value >= 5) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    }
    return 'bg-primary/20 text-primary border-primary/30';
  };

  return (
    <section className="space-y-6 px-4" aria-label="Network Stats Overview">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center items-center">
        <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Validators Online</CardTitle>
            <FaUsers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {networkData.validatorsOnline}/{networkData.totalValidators}
            </div>
            <Badge className={cn("mt-2", getStatusColor(networkData.validatorsOnline, 'validators'))}>
              {((networkData.validatorsOnline / networkData.totalValidators) * 100).toFixed(1)}% Active
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Staking APR</CardTitle>
            <FaChartLine className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{networkData.stakingAPR}%</div>
            <Badge className={cn("mt-2", getStatusColor(networkData.stakingAPR, 'apr'))}>
              Current Rate
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Block Time</CardTitle>
            <FaClock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{networkData.avgBlockTime}s</div>
            <p className="text-xs text-muted-foreground mt-2">Average Block Time</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value Locked</CardTitle>
            <FaDollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatNumber(networkData.totalValueLocked)}</div>
            <p className="text-xs text-muted-foreground mt-2">TVL in USD</p>
          </CardContent>
        </Card>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <FaBolt className="w-5 h-5 text-primary" />
              <span>Network Activity (24h)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memoChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--primary))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181A20', // fallback dark color
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'transactions') return [
                        `${value.toLocaleString()} Transactions`,
                        'Transactions'
                      ];
                      if (name === 'validators') return [
                        `${value} Validators`,
                        'Validators Online'
                      ];
                      return [value, name];
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <FaShieldAlt className="w-5 h-5 text-primary" />
              <span>Staking Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memoStakingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatNumber} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181A20', // fallback dark color
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'staked') return [formatNumber(value), 'Staked'];
                      if (name === 'rewards') return [formatNumber(value), 'Rewards'];
                      return [value, name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="staked"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorStaked)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="rewards"
                    stroke="hsl(var(--accent))"
                    fill="url(#colorRewards)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorStaked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Network Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">{networkData.networkHealth}%</div>
            <Badge className={cn("mb-2", getStatusColor(networkData.networkHealth, 'health'))}>
              System Status
            </Badge>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${networkData.networkHealth}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Uptime last 30 days</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {networkData.totalTransactions.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Since genesis block</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Active Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {networkData.activeAddresses.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Unique active addresses</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NetworkStats;
