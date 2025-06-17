
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ExternalLink, Copy, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TransactionExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  // Mock transaction data
  const transactions = [
    {
      hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
      block: 15234567,
      timestamp: new Date(Date.now() - 300000),
      from: 'cosmos1abc...def123',
      to: 'cosmos1xyz...789abc',
      amount: 1250.50,
      fee: 0.025,
      type: 'transfer',
      status: 'success'
    },
    {
      hash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      block: 15234566,
      timestamp: new Date(Date.now() - 450000),
      from: 'cosmos1def...abc456',
      to: 'cosmos1uvw...456def',
      amount: 75.25,
      fee: 0.015,
      type: 'delegate',
      status: 'success'
    },
    {
      hash: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
      block: 15234565,
      timestamp: new Date(Date.now() - 600000),
      from: 'cosmos1ghi...789ghi',
      to: 'cosmos1rst...012rst',
      amount: 2500.00,
      fee: 0.030,
      type: 'transfer',
      status: 'success'
    },
    {
      hash: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      block: 15234564,
      timestamp: new Date(Date.now() - 750000),
      from: 'cosmos1jkl...345jkl',
      to: 'cosmos1mno...678mno',
      amount: 150.75,
      fee: 0.020,
      type: 'vote',
      status: 'failed'
    },
    {
      hash: '0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdefab',
      block: 15234563,
      timestamp: new Date(Date.now() - 900000),
      from: 'cosmos1pqr...901pqr',
      to: 'cosmos1stu...234stu',
      amount: 500.00,
      fee: 0.025,
      type: 'undelegate',
      status: 'success'
    }
  ];

  const blocks = [
    {
      height: 15234567,
      hash: '0xabc123...def789',
      timestamp: new Date(Date.now() - 180000),
      txCount: 45,
      proposer: 'Cosmos Hub Validator',
      size: '2.4 KB'
    },
    {
      height: 15234566,
      hash: '0xdef456...abc012',
      timestamp: new Date(Date.now() - 360000),
      txCount: 32,
      proposer: 'Secure Staking Co.',
      size: '1.8 KB'
    },
    {
      height: 15234565,
      hash: '0x789abc...345def',
      timestamp: new Date(Date.now() - 540000),
      txCount: 67,
      proposer: 'Decentralized Pool',
      size: '3.2 KB'
    }
  ];

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Hash copied to clipboard",
    });
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transfer': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'delegate': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'undelegate': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'vote': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <Card className="bg-black/40 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Transaction Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by hash, address, or block..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm"
              >
                <option value="all">All Types</option>
                <option value="transfer">Transfer</option>
                <option value="delegate">Delegate</option>
                <option value="undelegate">Undelegate</option>
                <option value="vote">Vote</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card className="bg-black/40 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Hash</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Fee</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Time</TableHead>
                      <TableHead className="text-gray-300"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.hash} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-400 font-mono text-sm">
                              {formatHash(tx.hash)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(tx.hash)}
                              className="h-6 w-6 p-0 hover:bg-gray-700"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(tx.type)}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {tx.amount.toLocaleString()} ATOM
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {tx.fee} ATOM
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(tx.status)}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatTime(tx.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ExternalLink className="w-3 h-3" />
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

        {/* Recent Blocks */}
        <div>
          <Card className="bg-black/40 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Recent Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blocks.map((block) => (
                  <div
                    key={block.height}
                    className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-blue-400 font-bold">#{block.height.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 font-mono">
                          {formatHash(block.hash)}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {block.txCount} txs
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-300 mb-1">
                      Proposer: {block.proposer}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{formatTime(block.timestamp)}</span>
                      <span>{block.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Stats */}
          <Card className="bg-black/40 border-gray-700/50 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Transaction Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Transactions</span>
                  <span className="text-white font-medium">15,234,567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Block Time</span>
                  <span className="text-white font-medium">6.2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network Fee</span>
                  <span className="text-white font-medium">0.025 ATOM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-green-400 font-medium">99.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransactionExplorer;
