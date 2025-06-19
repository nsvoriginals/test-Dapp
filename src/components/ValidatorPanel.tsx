import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { Search, Shield, TrendingUp, Users, Star } from 'lucide-react';

// Dummy validator data
const validatorsData = [
  { id: 1, name: '1x2y3z...abcd', operator: '1x2y3z...abcd', votingPower: 2500000, commission: 5, apr: 12.8, uptime: 99.9, status: 'active', nominators: 1250, selfBonded: 150000, description: 'Leading validator with enterprise infrastructure' },
  { id: 2, name: '4a5b6c...efgh', operator: '4a5b6c...efgh', votingPower: 2200000, commission: 3, apr: 12.5, uptime: 99.8, status: 'active', nominators: 980, selfBonded: 200000, description: 'Institutional grade staking services' },
  { id: 3, name: '7i8j9k...lmno', operator: '7i8j9k...lmno', votingPower: 1800000, commission: 7, apr: 12.2, uptime: 99.7, status: 'active', nominators: 2100, selfBonded: 80000, description: 'Community-driven validator node' },
  { id: 4, name: '1p2q3r...stuv', operator: '1p2q3r...stuv', votingPower: 1600000, commission: 4, apr: 12.6, uptime: 99.5, status: 'active', nominators: 750, selfBonded: 120000, description: 'Supporting the ecosystem growth' },
  { id: 5, name: '4w5x6y...z123', operator: '4w5x6y...z123', votingPower: 1400000, commission: 6, apr: 12.3, uptime: 99.2, status: 'active', nominators: 890, selfBonded: 95000, description: 'Reliable and transparent operations' }
];

const ValidatorPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('power');

  // Memoized expensive calculations
  const filteredValidators = useMemo(() =>
    validatorsData.filter(validator =>
      validator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      validator.operator.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]
  );

  const sortedValidators = useMemo(() => {
    return [...filteredValidators].sort((a, b) => {
      switch (sortBy) {
        case 'power': return b.votingPower - a.votingPower;
        case 'commission': return a.commission - b.commission;
        case 'apr': return b.apr - a.apr;
        case 'uptime': return b.uptime - a.uptime;
        default: return 0;
      }
    });
  }, [filteredValidators, sortBy]);

  const abbreviate = (address) =>
    address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;

  const performanceData = useMemo(() => filteredValidators.slice(0, 5).map(v => ({
    name: abbreviate(v.name),
    uptime: v.uptime,
    apr: v.apr,
    power: v.votingPower / 1000000
  })), [filteredValidators]);

  // Memoized totals/averages
  const totalNominators = useMemo(() => validatorsData.reduce((sum, v) => sum + v.nominators, 0), []);
  const avgCommission = useMemo(() => (validatorsData.length ? (validatorsData.reduce((sum, v) => sum + v.commission, 0) / validatorsData.length).toFixed(1) : '0'), []);
  const avgUptime = useMemo(() => (validatorsData.length ? (validatorsData.reduce((sum, v) => sum + v.uptime, 0) / validatorsData.length).toFixed(1) : '0'), []);

  // useCallback for handlers
  const handleSearch = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleSort = useCallback((sortKey) => setSortBy(sortKey), []);

  const formatPower = (power) => {
    if (power >= 1000000) return `${(power / 1000000).toFixed(1)}M`;
    if (power >= 1000) return `${(power / 1000).toFixed(1)}K`;
    return power.toString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'jailed': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-6 bg-card">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Validators
            </CardTitle>
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {validatorsData.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active validators</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Avg Commission
            </CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {avgCommission}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Network average</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Nominators
            </CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {totalNominators.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unique nominators</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Avg Uptime
            </CardTitle>
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {avgUptime}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Network reliability</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="bg-card border border-border">
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-foreground text-base sm:text-lg">
            Validator Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          {/* Mobile: Horizontal scroll wrapper */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] sm:min-w-0 h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={performanceData} 
                  margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  barCategoryGap="20%"
                >
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
                  
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[95, 100]}
                  />
                  
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[10, 15]}
                  />
                  
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      minWidth: '120px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.10)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'Uptime %') return [`${value}%`, 'Uptime'];
                      if (name === 'APR %') return [`${value}%`, 'APR'];
                      return [value, name];
                    }}
                  />
                  
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                  
                  <Bar
                    yAxisId="left"
                    dataKey="uptime"
                    fill="url(#primaryGradient)"
                    name="Uptime %"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    <LabelList 
                      dataKey="uptime" 
                      position="top" 
                      formatter={(v) => `${v}%`}
                      style={{ fontSize: '10px', fontWeight: 600, fill: '#3b82f6' }}
                    />
                  </Bar>
                  
                  <Bar
                    yAxisId="right"
                    dataKey="apr"
                    fill="url(#accentGradient)"
                    name="APR %"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    <LabelList 
                      dataKey="apr" 
                      position="top" 
                      formatter={(v) => `${v}%`}
                      style={{ fontSize: '10px', fontWeight: 600, fill: '#10b981' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validator List */}
      <Card className="bg-card border border-border">
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 space-y-4">
          <CardTitle className="text-foreground text-base sm:text-lg">
            All Validators
          </CardTitle>
          
          {/* Search and Controls */}
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search validators..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={sortBy === 'power' ? 'default' : 'outline'} 
                onClick={() => handleSort('power')}
                size="sm"
                className="text-xs"
              >
                Power
              </Button>
              <Button 
                variant={sortBy === 'commission' ? 'default' : 'outline'} 
                onClick={() => handleSort('commission')}
                size="sm"
                className="text-xs"
              >
                Commission
              </Button>
              <Button 
                variant={sortBy === 'apr' ? 'default' : 'outline'} 
                onClick={() => handleSort('apr')}
                size="sm"
                className="text-xs"
              >
                APR
              </Button>
              <Button 
                variant={sortBy === 'uptime' ? 'default' : 'outline'} 
                onClick={() => handleSort('uptime')}
                size="sm"
                className="text-xs"
              >
                Uptime
              </Button>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  size="sm"
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          {sortedValidators.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <span className="text-base font-semibold">No validators found</span>
              <span className="text-sm mt-1">Try adjusting your search or filters.</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Voting Power
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Commission
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      APR
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Uptime
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Nominators
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Self-Bonded
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Description
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedValidators.map((validator) => (
                    <TableRow 
                      key={validator.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-foreground max-w-[100px] truncate">
                        {validator.name}
                      </TableCell>
                      <TableCell className="text-xs text-foreground whitespace-nowrap">
                        {formatPower(validator.votingPower)}
                      </TableCell>
                      <TableCell className="text-xs text-foreground whitespace-nowrap">
                        {validator.commission}%
                      </TableCell>
                      <TableCell className="text-xs text-foreground whitespace-nowrap">
                        {validator.apr}%
                      </TableCell>
                      <TableCell className="text-xs text-foreground whitespace-nowrap">
                        {validator.uptime}%
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${getStatusColor(validator.status)}`}>
                          {validator.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-foreground whitespace-nowrap">
                        {validator.nominators.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-foreground whitespace-nowrap">
                        {formatPower(validator.selfBonded)}
                      </TableCell>
                      <TableCell className="text-xs text-foreground max-w-[200px] truncate">
                        {validator.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidatorPanel;