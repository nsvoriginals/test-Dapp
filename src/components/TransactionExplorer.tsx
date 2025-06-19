import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FaSearch, FaExternalLinkAlt, FaCopy, FaFilter, FaBars, FaTimes } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import usePolkadot from '@/hooks/use-polkadot';
import { ApiPromise } from '@polkadot/api';

const TransactionExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { api, isConnected, loading: apiLoading, error: apiError } = usePolkadot();
  const [extrinsics, setExtrinsics] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [txDetails, setTxDetails] = useState<any>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  // Fetch latest 10 blocks and their extrinsics
  useEffect(() => {
    const fetchExtrinsics = async () => {
      if (!api || !isConnected) return;
      try {
        const latestHeader = await api.rpc.chain.getHeader();
        const latestBlockNumber = Number(latestHeader.number.toBigInt());
        const blockNumbers = Array.from({ length: 10 }, (_, i) => latestBlockNumber - i);
        const blockHashes = await Promise.all(blockNumbers.map(n => api.rpc.chain.getBlockHash(n)));
        const blockData = await Promise.all(blockHashes.map(hash => api.rpc.chain.getBlock(hash)));
        const extrinsicsList: any[] = [];
        const blocksList: any[] = [];
        for (let i = 0; i < blockData.length; i++) {
          const block = blockData[i];
          const blockHash = blockHashes[i].toHex();
          const blockNumber = blockNumbers[i];
          const timestampExtrinsic = block.block.extrinsics.find((ex: any) => ex.method.section === 'timestamp');
          let timestamp = null;
          if (timestampExtrinsic) {
            try {
              timestamp = Number(timestampExtrinsic.method.args[0].toString());
            } catch {}
          }
          blocksList.push({
            height: blockNumber,
            hash: blockHash,
            timestamp: timestamp ? new Date(timestamp) : null,
            txCount: block.block.extrinsics.length,
            proposer: '',
            size: '',
          });
          block.block.extrinsics.forEach((ex: any, idx: number) => {
            extrinsicsList.push({
              hash: ex.hash.toHex(),
              block: blockNumber,
              blockHash,
              index: idx,
              method: `${ex.method.section}.${ex.method.method}`,
              signer: ex.signer?.toString() || '',
              args: ex.method.args.map((a: any) => a.toString()),
              isSigned: ex.isSigned,
              nonce: ex.nonce?.toString() || '',
              tip: ex.tip?.toString() || '',
              timestamp: timestamp ? new Date(timestamp) : null,
            });
          });
        }
        setExtrinsics(extrinsicsList);
        setBlocks(blocksList);
      } catch (err) {
        setExtrinsics([]);
        setBlocks([]);
      }
    };
    fetchExtrinsics();
  }, [api, isConnected]);

  // Filter extrinsics by search and type
  const filteredExtrinsics = extrinsics.filter((ex) => {
    const matchesSearch =
      ex.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.signer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.block.toString().includes(searchTerm);
    const matchesFilter = filterType === 'all' || ex.method.toLowerCase().includes(filterType);
    return matchesSearch && matchesFilter;
  });

  // Fetch transaction details for selected extrinsic
  useEffect(() => {
    const fetchTxDetails = async () => {
      if (!api || !selectedTx) return;
      setTxLoading(true);
      setTxError(null);
      try {
        // Get block and extrinsic details
        const block = await api.rpc.chain.getBlock(selectedTx.blockHash);
        const extrinsic = block.block.extrinsics[selectedTx.index];
        setTxDetails(extrinsic.toHuman());
      } catch (err: any) {
        setTxError(err.message || 'Failed to fetch transaction details');
        setTxDetails(null);
      } finally {
        setTxLoading(false);
      }
    };
    if (isConnected && selectedTx) {
      fetchTxDetails();
    } else {
      setTxDetails(null);
    }
  }, [api, isConnected, selectedTx]);

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
                            {filteredExtrinsics.map((tx, index) => (
                              <TableRow key={index} className="border-b border-muted last:border-b-0" onClick={() => setSelectedTx(tx)} style={{ cursor: 'pointer', background: selectedTx?.hash === tx.hash ? 'rgba(0,0,0,0.05)' : undefined }}>
                                <TableCell className="px-5 py-5 text-sm font-mono text-primary">
                                  {formatHash(tx.hash)}
                                </TableCell>
                                <TableCell className="px-5 py-5 text-sm text-foreground">{tx.block}</TableCell>
                                <TableCell className="px-5 py-5 text-sm text-muted-foreground">{formatTime(tx.timestamp)}</TableCell>
                                <TableCell className="px-5 py-5 text-sm">
                                  <Badge className={getTypeColor(tx.method.split('.')[0])}>{tx.method.split('.')[0]}</Badge>
                                </TableCell>
<TableCell className="...">
  {(tx.method === 'balances.transfer' || tx.method === 'balances.transferKeepAlive') ? `${tx.args[1]} DOT` : '—'}
</TableCell>
                                <TableCell className="px-5 py-5 text-sm font-mono text-muted-foreground">
                                  {tx.signer.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="px-5 py-5 text-sm font-mono text-muted-foreground">
                                  {tx.signer.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="px-5 py-5 text-sm text-foreground">{tx.tip} ATOM</TableCell>
                                <TableCell className="px-5 py-5 text-sm">
                                  <Badge className={getStatusColor(tx.isSigned ? 'success' : 'failed')}>{tx.isSigned ? 'Signed' : 'Unsigned'}</Badge>
                                </TableCell>
                                <TableCell className="px-5 py-5 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(tx.hash);
                                      }}
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <FaCopy className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://explorer.example.com/tx/${tx.hash}`, '_blank');
                                      }}
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <FaExternalLinkAlt className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {filteredExtrinsics.length === 0 && (
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(block.hash);
                                      }}
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <FaCopy className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://explorer.example.com/block/${block.hash}`, '_blank');
                                      }}
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

            {/* Transaction Details (Polkadot or Mock) */}
            <Card className="bg-card border border-border mt-8">
              <CardHeader>
                <CardTitle className="text-foreground">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTx ? (
                  apiLoading ? (
                    <p className="text-muted-foreground">Connecting to Polkadot network...</p>
                  ) : txLoading ? (
                    <p className="text-muted-foreground">Loading transaction details...</p>
                  ) : txError ? (
                    <p className="text-destructive">{txError}</p>
                  ) : txDetails ? (
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-64">{JSON.stringify(txDetails, null, 2)}</pre>
                  ) : (
                    <>
                      <div className="mb-2"><span className="font-semibold">Hash:</span> {selectedTx.hash}</div>
                      <div className="mb-2"><span className="font-semibold">Block:</span> {selectedTx.block}</div>
                      <div className="mb-2"><span className="font-semibold">Method:</span> {selectedTx.method}</div>
                      <div className="mb-2"><span className="font-semibold">Signer:</span> {selectedTx.signer}</div>
                      <div className="mb-2"><span className="font-semibold">Args:</span> {selectedTx.args.join(', ')}</div>
                    </>
                  )
                ) : (
                  <p className="text-muted-foreground">Select a transaction to view its details.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionExplorer;
