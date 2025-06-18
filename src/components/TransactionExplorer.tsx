import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FaSearch, FaExternalLinkAlt, FaCopy, FaFilter, FaBars, FaTimes } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TransactionExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      case 'transfer': return 'bg-[hsl(var(--badge-transfer-bg))] text-[hsl(var(--badge-transfer-fg))] border-[hsl(var(--primary))/30]';
      case 'delegate': return 'bg-[hsl(var(--badge-delegate-bg))] text-[hsl(var(--badge-delegate-fg))] border-[hsl(var(--accent))/30]';
      case 'undelegate': return 'bg-[hsl(var(--badge-undelegate-bg))] text-[hsl(var(--badge-undelegate-fg))] border-[hsl(var(--destructive))/30]';
      case 'vote': return 'bg-[hsl(var(--badge-vote-bg))] text-[hsl(var(--badge-vote-fg))] border-[hsl(var(--secondary))/30]';
      default: return 'bg-muted/20 text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-[hsl(var(--badge-success-bg))] text-[hsl(var(--badge-success-fg))] border-[hsl(var(--primary))/30]';
      case 'failed': return 'bg-[hsl(var(--badge-failed-bg))] text-[hsl(var(--badge-failed-fg))] border-[hsl(var(--destructive))/30]';
      case 'pending': return 'bg-[hsl(var(--badge-pending-bg))] text-[hsl(var(--badge-pending-fg))] border-[hsl(var(--secondary))/30]';
      default: return 'bg-muted/20 text-muted-foreground border-border';
    }
  };

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const handleNavClick = (id) => {
    // Implement the logic to handle navigation click
    console.log(`Navigating to ${id}`);
    setSidebarOpen(false); // close sidebar on mobile after navigation
  };

  return (
    <div className="space-y-8 px-4">
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden ...">
        {/* ...logo... */}
        <button onClick={toggleSidebar} aria-label="Toggle menu">
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static ... transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          {/* ...nav buttons... */}
          {/* Add your navigation buttons here */}
        </div>
        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        {/* Main Content */}
        <div className="flex-1 ...">
          {/* Search and Filters */}
          <Card className="bg-card border border-border mx-auto w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-foreground">Transaction Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by hash, address, or block..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-input border-border text-foreground"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FaFilter className="w-4 h-4 text-muted-foreground" />
                  <Select onValueChange={setFilterType} value={filterType}>
                    <SelectTrigger className="w-[180px] bg-input border-border text-foreground">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="delegate">Delegate</SelectItem>
                      <SelectItem value="undelegate">Undelegate</SelectItem>
                      <SelectItem value="vote">Vote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="transactions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-2 bg-muted/40">
                  <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Transactions</TabsTrigger>
                  <TabsTrigger value="blocks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Blocks</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
                  <Card className="bg-card border border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table className="min-w-full leading-normal">
                          <thead>
                            <tr>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tx Hash</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Block</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fee</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.map((tx, index) => (
                              <TableRow key={index} className="border-b border-muted last:border-b-0">
                                <TableCell className="px-5 py-5 text-sm font-mono text-primary">
                                  {formatHash(tx.hash)}
                                </TableCell>
                                <TableCell className="px-5 py-5 text-sm text-foreground">{tx.block}</TableCell>
                                <TableCell className="px-5 py-5 text-sm text-muted-foreground">{formatTime(tx.timestamp)}</TableCell>
                                <TableCell className="px-5 py-5 text-sm">
                                  <Badge className={getTypeColor(tx.type)}>{tx.type}</Badge>
                                </TableCell>
                                <TableCell className="px-5 py-5 text-sm text-foreground">{tx.amount.toLocaleString()} ATOM</TableCell>
                                <TableCell className="px-5 py-5 text-sm font-mono text-muted-foreground">
                                  {tx.from.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="px-5 py-5 text-sm font-mono text-muted-foreground">
                                  {tx.to.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="px-5 py-5 text-sm text-foreground">{tx.fee} ATOM</TableCell>
                                <TableCell className="px-5 py-5 text-sm">
                                  <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                                </TableCell>
                                <TableCell className="px-5 py-5 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => copyToClipboard(tx.hash)}
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <FaCopy className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => window.open(`https://explorer.example.com/tx/${tx.hash}`, '_blank')}
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <FaExternalLinkAlt className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {filteredTransactions.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={10} className="px-5 py-5 text-center text-muted-foreground">
                                  No transactions found matching your criteria.
                                </TableCell>
                              </TableRow>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="blocks">
                  <Card className="bg-card border border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Recent Blocks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table className="min-w-full leading-normal">
                          <thead>
                            <tr>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Height</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hash</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tx Count</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Proposer</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size</TableHead>
                              <TableHead className="px-5 py-3 border-b-2 border-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                            </tr>
                          </thead>
                          <tbody>
                            {blocks.map((block, index) => (
                              <TableRow key={index} className="border-b border-muted last:border-b-0">
                                <TableCell className="px-5 py-5 text-sm font-medium text-primary">{block.height}</TableCell>
                                <TableCell className="px-5 py-5 text-sm font-mono text-muted-foreground">
                                  {formatHash(block.hash)}
                                </TableCell>
                                <TableCell className="px-5 py-5 text-sm text-muted-foreground">{formatTime(block.timestamp)}</TableCell>
                                <TableCell className="px-5 py-5 text-sm text-foreground">{block.txCount}</TableCell>
                                <TableCell className="px-5 py-5 text-sm text-foreground">{block.proposer}</TableCell>
                                <TableCell className="px-5 py-5 text-sm text-foreground">{block.size}</TableCell>
                                <TableCell className="px-5 py-5 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => copyToClipboard(block.hash)}
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <FaCopy className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => window.open(`https://explorer.example.com/block/${block.hash}`, '_blank')}
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <FaExternalLinkAlt className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {blocks.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={7} className="px-5 py-5 text-center text-muted-foreground">
                                  No blocks found.
                                </TableCell>
                              </TableRow>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Transaction Details (Placeholder) */}
            <Card className="bg-card border border-border h-fit">
              <CardHeader>
                <CardTitle className="text-foreground">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Select a transaction to view its details.</p>
                {/* Future: Display selected transaction details here */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionExplorer;
