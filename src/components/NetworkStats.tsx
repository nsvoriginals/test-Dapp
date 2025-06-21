import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { FaChartLine, FaUsers, FaClock, FaDollarSign, FaShieldAlt } from 'react-icons/fa';
import { FaBolt, FaWallet } from 'react-icons/fa6';
import { cn } from '@/lib/utils';
import { useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { usePolkadotStore } from '@/stores/polkadotStore';

const formatNumber = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

// Skeleton component for loading states
const MetricSkeleton = () => (
  <Card className="bg-card/50 backdrop-blur-sm border border-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 bg-muted-foreground/20 rounded w-24 animate-pulse"></div>
      <div className="h-4 w-4 bg-muted-foreground/20 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-muted-foreground/20 rounded w-16 mb-2 animate-pulse"></div>
      <div className="h-6 bg-muted-foreground/20 rounded w-20 animate-pulse"></div>
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <Card className="bg-card/50 backdrop-blur-sm border border-border">
    <CardHeader>
      <div className="h-6 bg-muted-foreground/20 rounded w-48 animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] bg-muted-foreground/10 rounded animate-pulse flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    </CardContent>
  </Card>
);

const NetworkStats = () => {
  const {
    apiState,
    networkMetrics,
    chartData,
    stakingData,
    isLoading,
    isFetching,
    connect,
    reconnect,
    refreshData,
    fetchNetworkData
  } = usePolkadotStore();

  // Memoize expensive calculations
  const validatorPercentage = useMemo(() => {
    return networkMetrics.totalValidators > 0 
      ? ((networkMetrics.validatorsOnline / networkMetrics.totalValidators) * 100).toFixed(1)
      : '0';
  }, [networkMetrics.validatorsOnline, networkMetrics.totalValidators]);

  // Debounced data fetching to prevent multiple calls
  const debouncedFetchData = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchNetworkData();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchNetworkData]);

  // Start fetching immediately when connected, don't wait
  useEffect(() => {
    if (apiState.status === 'connected' && networkMetrics.lastUpdated === 0) {
      // Start data fetch immediately but don't block UI
      fetchNetworkData();
    }
  }, [apiState.status]); // Remove fetchNetworkData from deps to prevent loops

  const getStatusColor = (value: number, type: 'validators' | 'health' | 'apr') => {
    if (type === 'validators') {
      const percentage = networkMetrics.totalValidators > 0 ? (value / networkMetrics.totalValidators) * 100 : 0;
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

  const handleReconnect = () => {
    reconnect();
  };

  const handleRefresh = () => {
    refreshData();
  };

  // Show connection status if not connected
  if (apiState.status !== 'connected') {
    return (
      <section className="space-y-6 px-4" aria-label="Network Stats Overview">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Network Statistics</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {apiState.status}
            </Badge>
            <Button onClick={handleReconnect} size="sm" variant="outline">
              Reconnect
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">
                {apiState.status === 'connecting' ? 'Connecting to Network...' :
                 apiState.status === 'error' ? 'Connection Failed' :
                 'Disconnected'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {apiState.status === 'connecting' ? 'Establishing connection to Polkadot network...' :
                 apiState.status === 'error' ? 'Unable to connect to any available endpoints' :
                 'Not connected to the network'}
              </p>
              {apiState.lastError && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded mb-4">
                  Error: {apiState.lastError}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Status: {apiState.status} | 
                Endpoint: {apiState.endpoint || 'None'} |
                Attempts: {apiState.connectionAttempts}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Show UI immediately when connected, even if data is still loading
  const hasData = networkMetrics.lastUpdated > 0;
  const showSkeleton = !hasData && isLoading;

  return (
    <section className="space-y-6 px-4" aria-label="Network Stats Overview">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Network Statistics</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {!hasData && isLoading ? 'Loading...' : isFetching ? 'Updating...' : 'Live'}
          </Badge>
          {networkMetrics.lastUpdated > 0 && (
            <span className="text-xs text-muted-foreground">
              Updated: {new Date(networkMetrics.lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleRefresh} size="sm" variant="outline" disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Metrics - Show skeleton if no data, otherwise show data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {showSkeleton ? (
          // Show skeleton for all 4 cards
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Validators Online</CardTitle>
                <FaUsers className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {`${networkMetrics.validatorsOnline}/${networkMetrics.totalValidators}`}
                </div>
                <Badge className={cn("mt-2", getStatusColor(networkMetrics.validatorsOnline, 'validators'))}>
                  {validatorPercentage}% Active
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Staking APR</CardTitle>
                <FaChartLine className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {`${networkMetrics.stakingAPR}%`}
                </div>
                <Badge className={cn("mt-2", getStatusColor(networkMetrics.stakingAPR, 'apr'))}>
                  Current Rate
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Block Time</CardTitle>
                <FaClock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {`${networkMetrics.avgBlockTime.toFixed(1)}s`}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Average Block Time</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Value Locked</CardTitle>
                <FaDollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatNumber(parseFloat(networkMetrics.totalValueLocked) || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">TVL in XOR</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {showSkeleton ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                <FaBolt className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatNumber(networkMetrics.totalTransactions)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Last 5 blocks</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Network Health</CardTitle>
                <FaShieldAlt className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {`${networkMetrics.networkHealth.toFixed(1)}%`}
                </div>
                <Badge className={cn("mt-2", getStatusColor(networkMetrics.networkHealth, 'health'))}>
                  {networkMetrics.networkHealth >= 99 ? 'Excellent' : networkMetrics.networkHealth >= 95 ? 'Good' : 'Poor'}
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Addresses</CardTitle>
                <FaWallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatNumber(networkMetrics.activeAddresses)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Estimated</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {showSkeleton ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-card/50 backdrop-blur-sm border border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center space-x-2">
                  <FaBolt className="w-5 h-5 text-primary" />
                  <span>Network Activity (Last 24 Hours)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                      <XAxis 
                        dataKey="time" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        interval="preserveStartEnd"
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        yAxisId="left" 
                        stroke="hsl(var(--primary))"
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => formatNumber(value)}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        label={{ 
                          value: 'Transactions', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
                        }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="hsl(var(--accent))"
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${value}`}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        label={{ 
                          value: 'Validators', 
                          angle: 90, 
                          position: 'insideRight',
                          style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
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
                          if (name === 'networkHealth') return [
                            `${value}%`,
                            'Network Health'
                          ];
                          return [value, name];
                        }}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="transactions"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ 
                          fill: 'hsl(var(--primary))', 
                          stroke: 'hsl(var(--background))', 
                          strokeWidth: 2, 
                          r: 3 
                        }}
                        activeDot={{ 
                          r: 5, 
                          stroke: 'hsl(var(--background))', 
                          strokeWidth: 2,
                          fill: 'hsl(var(--primary))'
                        }}
                        name="transactions"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="validators"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        dot={{ 
                          fill: 'hsl(var(--accent))', 
                          stroke: 'hsl(var(--background))', 
                          strokeWidth: 2, 
                          r: 3 
                        }}
                        activeDot={{ 
                          r: 5, 
                          stroke: 'hsl(var(--background))', 
                          strokeWidth: 2,
                          fill: 'hsl(var(--accent))'
                        }}
                        name="validators"
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
                  <span>Staking Overview (12 Months)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stakingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                      <XAxis 
                        dataKey="period" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        tickFormatter={formatNumber}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        label={{ 
                          value: 'Amount (XOR)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number, name: string) => [
                          `${formatNumber(value)} XOR`,
                          name === 'staked' ? 'Staked Amount' : 'Rewards Earned'
                        ]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="staked"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary)/20)"
                        name="staked"
                      />
                      <Area
                        type="monotone"
                        dataKey="rewards"
                        stackId="2"
                        stroke="hsl(var(--accent))"
                        fill="hsl(var(--accent)/20)"
                        name="rewards"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Network Health Chart */}
      <div className="grid grid-cols-1 gap-4">
        {showSkeleton ? (
          <ChartSkeleton />
        ) : (
          <Card className="bg-card/50 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center space-x-2">
                <FaShieldAlt className="w-5 h-5 text-primary" />
                <span>Network Health Trend (Last 24 Hours)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      interval="preserveStartEnd"
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      domain={[90, 100]}
                      tickFormatter={(value) => `${value}%`}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      label={{ 
                        value: 'Health Score (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Network Health']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="networkHealth"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ 
                        fill: 'hsl(var(--primary))', 
                        stroke: 'hsl(var(--background))', 
                        strokeWidth: 2, 
                        r: 4 
                      }}
                      activeDot={{ 
                        r: 6, 
                        stroke: 'hsl(var(--background))', 
                        strokeWidth: 2,
                        fill: 'hsl(var(--primary))'
                      }}
                      name="networkHealth"
                    />
                    {/* Add a reference line for 95% threshold */}
                    <ReferenceLine 
                      y={95} 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="3 3" 
                      strokeWidth={1}
                      label={{ 
                        value: '95% Threshold', 
                        position: 'insideBottomRight',
                        fill: 'hsl(var(--destructive))',
                        fontSize: 10
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default NetworkStats;