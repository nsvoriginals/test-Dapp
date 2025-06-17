
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Shield, TrendingUp, Users, Star } from 'lucide-react';

const ValidatorPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('power');

  // Mock validator data
  const validators = [
    {
      id: 1,
      name: 'Cosmos Hub Validator',
      operator: 'cosmosvaloper1...',
      votingPower: 2500000,
      commission: 5,
      apr: 12.8,
      uptime: 99.9,
      status: 'active',
      delegators: 1250,
      selfBonded: 150000,
      description: 'Leading validator with enterprise infrastructure'
    },
    {
      id: 2,
      name: 'Secure Staking Co.',
      operator: 'cosmosvaloper2...',
      votingPower: 2200000,
      commission: 3,
      apr: 12.5,
      uptime: 99.8,
      status: 'active',
      delegators: 980,
      selfBonded: 200000,
      description: 'Institutional grade staking services'
    },
    {
      id: 3,
      name: 'Decentralized Pool',
      operator: 'cosmosvaloper3...',
      votingPower: 1800000,
      commission: 7,
      apr: 12.2,
      uptime: 99.7,
      status: 'active',
      delegators: 2100,
      selfBonded: 80000,
      description: 'Community-driven validator node'
    },
    {
      id: 4,
      name: 'Community Validator',
      operator: 'cosmosvaloper4...',
      votingPower: 1600000,
      commission: 4,
      apr: 12.6,
      uptime: 99.5,
      status: 'active',
      delegators: 750,
      selfBonded: 120000,
      description: 'Supporting the ecosystem growth'
    },
    {
      id: 5,
      name: 'Network Guardian',
      operator: 'cosmosvaloper5...',
      votingPower: 1400000,
      commission: 6,
      apr: 12.3,
      uptime: 99.2,
      status: 'active',
      delegators: 890,
      selfBonded: 95000,
      description: 'Reliable and transparent operations'
    }
  ];

  const performanceData = validators.slice(0, 5).map(v => ({
    name: v.name.split(' ')[0],
    uptime: v.uptime,
    apr: v.apr,
    power: v.votingPower / 1000000
  }));

  const filteredValidators = validators.filter(validator =>
    validator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    validator.operator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedValidators = [...filteredValidators].sort((a, b) => {
    switch (sortBy) {
      case 'power':
        return b.votingPower - a.votingPower;
      case 'commission':
        return a.commission - b.commission;
      case 'apr':
        return b.apr - a.apr;
      case 'uptime':
        return b.uptime - a.uptime;
      default:
        return 0;
    }
  });

  const formatPower = (power: number) => {
    if (power >= 1000000) return `${(power / 1000000).toFixed(1)}M`;
    if (power >= 1000) return `${(power / 1000).toFixed(1)}K`;
    return power.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'jailed': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Validators</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{validators.length}</div>
            <p className="text-xs text-blue-300 mt-1">Active validators</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Avg Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(validators.reduce((sum, v) => sum + v.commission, 0) / validators.length).toFixed(1)}%
            </div>
            <p className="text-xs text-green-300 mt-1">Network average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Delegators</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {validators.reduce((sum, v) => sum + v.delegators, 0).toLocaleString()}
            </div>
            <p className="text-xs text-purple-300 mt-1">Unique delegators</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Avg Uptime</CardTitle>
            <Star className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(validators.reduce((sum, v) => sum + v.uptime, 0) / validators.length).toFixed(1)}%
            </div>
            <p className="text-xs text-orange-300 mt-1">Network reliability</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="bg-black/40 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Validator Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="uptime" fill="#10B981" name="Uptime %" />
              <Bar dataKey="apr" fill="#3B82F6" name="APR %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Validator List */}
      <Card className="bg-black/40 border-gray-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="text-white">Validator Directory</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search validators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white w-64"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm"
              >
                <option value="power">Sort by Voting Power</option>
                <option value="commission">Sort by Commission</option>
                <option value="apr">Sort by APR</option>
                <option value="uptime">Sort by Uptime</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Validator</TableHead>
                  <TableHead className="text-gray-300">Voting Power</TableHead>
                  <TableHead className="text-gray-300">Commission</TableHead>
                  <TableHead className="text-gray-300">APR</TableHead>
                  <TableHead className="text-gray-300">Uptime</TableHead>
                  <TableHead className="text-gray-300">Delegators</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedValidators.map((validator) => (
                  <TableRow key={validator.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{validator.name}</div>
                        <div className="text-sm text-gray-400 font-mono">
                          {validator.operator.slice(0, 20)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {formatPower(validator.votingPower)}
                    </TableCell>
                    <TableCell className="text-white">{validator.commission}%</TableCell>
                    <TableCell className="text-green-400 font-medium">{validator.apr}%</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="text-white">{validator.uptime}%</div>
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${validator.uptime}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{validator.delegators.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(validator.status)}>
                        {validator.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Delegate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidatorPanel;
