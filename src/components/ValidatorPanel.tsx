import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaSearch, FaShieldAlt, FaChartLine, FaUsers, FaStar } from 'react-icons/fa';
import { cn } from '@/lib/utils';

// Mock validator data moved outside component
const validatorsData = [
  { id: 1, name: 'Cosmos Hub Validator', operator: 'cosmosvaloper1...', votingPower: 2500000, commission: 5, apr: 12.8, uptime: 99.9, status: 'active', delegators: 1250, selfBonded: 150000, description: 'Leading validator with enterprise infrastructure' },
  { id: 2, name: 'Secure Staking Co.', operator: 'cosmosvaloper2...', votingPower: 2200000, commission: 3, apr: 12.5, uptime: 99.8, status: 'active', delegators: 980, selfBonded: 200000, description: 'Institutional grade staking services' },
  { id: 3, name: 'Decentralized Pool', operator: 'cosmosvaloper3...', votingPower: 1800000, commission: 7, apr: 12.2, uptime: 99.7, status: 'active', delegators: 2100, selfBonded: 80000, description: 'Community-driven validator node' },
  { id: 4, name: 'Community Validator', operator: 'cosmosvaloper4...', votingPower: 1600000, commission: 4, apr: 12.6, uptime: 99.5, status: 'active', delegators: 750, selfBonded: 120000, description: 'Supporting the ecosystem growth' },
  { id: 5, name: 'Network Guardian', operator: 'cosmosvaloper5...', votingPower: 1400000, commission: 6, apr: 12.3, uptime: 99.2, status: 'active', delegators: 890, selfBonded: 95000, description: 'Reliable and transparent operations' }
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

  const performanceData = useMemo(() => validatorsData.slice(0, 5).map(v => ({
    name: v.name,
    uptime: v.uptime,
    apr: v.apr,
    power: v.votingPower / 1000000
  })), []);

  // Memoized totals/averages
  const totalDelegators = useMemo(() => validatorsData.reduce((sum, v) => sum + v.delegators, 0), []);
  const avgCommission = useMemo(() => (validatorsData.reduce((sum, v) => sum + v.commission, 0) / validatorsData.length).toFixed(1), []);
  const avgUptime = useMemo(() => (validatorsData.reduce((sum, v) => sum + v.uptime, 0) / validatorsData.length).toFixed(1), []);

  // useCallback for handlers
  const handleSearch = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleSort = useCallback((sortKey) => setSortBy(sortKey), []);

  const formatPower = (power: number) => {
    if (power >= 1000000) return `${(power / 1000000).toFixed(1)}M`;
    if (power >= 1000) return `${(power / 1000).toFixed(1)}K`;
    return power.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary text-primary-foreground border-primary/30';
      case 'jailed': return 'bg-destructive/20 text-destructive-foreground border-destructive/30';
      case 'inactive': return 'bg-muted/20 text-muted-foreground border-border';
      default: return 'bg-muted/20 text-muted-foreground border-border';
    }
  };

  return (
    <section className="space-y-8 px-4" aria-label="Validator Panel">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center items-center">
        <Card className="bg-card border border-border mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Validators</CardTitle>
            <FaShieldAlt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{validatorsData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active validators</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Commission</CardTitle>
            <FaChartLine className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgCommission}%</div>
            <p className="text-xs text-muted-foreground mt-1">Network average</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Delegators</CardTitle>
            <FaUsers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalDelegators.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique delegators</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border mx-auto w-full max-w-md text-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Uptime</CardTitle>
            <FaStar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgUptime}%</div>
            <p className="text-xs text-muted-foreground mt-1">Network reliability</p>
          </CardContent>
        </Card>
      </div>
      {/* Performance Chart */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Validator Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" stroke="hsl(var(--foreground))" />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181A20', // fallback dark color
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'Uptime %') return [`${value}%`, 'Uptime'];
                  if (name === 'APR %') return [`${value}%`, 'APR'];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar
                yAxisId="left"
                dataKey="uptime"
                fill="hsl(var(--primary))"
                name="Uptime %"
                activeBar={{
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                  style: {
                    filter: 'brightness(1.2)'
                  }
                }}
              />
              <Bar
                yAxisId="right"
                dataKey="apr"
                fill="hsl(var(--accent))"
                name="APR %"
                activeBar={{
                  fill: "hsl(var(--accent))",
                  stroke: "hsl(var(--accent))",
                  strokeWidth: 2,
                  style: {
                    filter: 'brightness(1.2)'
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Validator List */}
      <Card className="bg-card border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-foreground">All Validators</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search validators..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9 pr-3 py-2 bg-input border-border text-foreground rounded-md"
                aria-label="Search validators"
              />
            </div>
            <Button variant="outline" onClick={() => setSearchTerm('')} aria-label="Clear search">Clear</Button>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Button variant={sortBy === 'power' ? 'default' : 'outline'} onClick={() => handleSort('power')} aria-label="Sort by Power">Power</Button>
            <Button variant={sortBy === 'commission' ? 'default' : 'outline'} onClick={() => handleSort('commission')} aria-label="Sort by Commission">Commission</Button>
            <Button variant={sortBy === 'apr' ? 'default' : 'outline'} onClick={() => handleSort('apr')} aria-label="Sort by APR">APR</Button>
            <Button variant={sortBy === 'uptime' ? 'default' : 'outline'} onClick={() => handleSort('uptime')} aria-label="Sort by Uptime">Uptime</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table role="table" aria-label="Validator List">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Voting Power</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>APR</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delegators</TableHead>
                  <TableHead>Self-Bonded</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedValidators.map((validator) => (
                  <TableRow key={validator.id}>
                    <TableCell>{validator.name}</TableCell>
                    <TableCell>{formatPower(validator.votingPower)}</TableCell>
                    <TableCell>{validator.commission}%</TableCell>
                    <TableCell>{validator.apr}%</TableCell>
                    <TableCell>{validator.uptime}%</TableCell>
                    <TableCell><Badge className={cn('border', getStatusColor(validator.status))}>{validator.status}</Badge></TableCell>
                    <TableCell>{validator.delegators}</TableCell>
                    <TableCell>{formatPower(validator.selfBonded)}</TableCell>
                    <TableCell>{validator.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ValidatorPanel;
