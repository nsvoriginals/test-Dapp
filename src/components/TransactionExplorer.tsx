import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FaSearch, FaExternalLinkAlt, FaCopy, FaFilter, FaBars, FaTimes, FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePolkadotStore } from '@/stores/polkadotStore';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Debounce hook for search input
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Skeleton components for loading states
const TransactionSkeleton = () => (
  <TableRow>
    <TableCell>
      <div className="h-4 bg-muted-foreground/20 rounded w-24 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-muted-foreground/20 rounded w-12 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-6 bg-muted-foreground/20 rounded w-20 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-muted-foreground/20 rounded w-16 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 w-4 bg-muted-foreground/20 rounded animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-muted-foreground/20 rounded w-16 animate-pulse"></div>
    </TableCell>
  </TableRow>
);

const BlockSkeleton = () => (
  <TableRow>
    <TableCell>
      <div className="h-4 bg-muted-foreground/20 rounded w-16 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-muted-foreground/20 rounded w-24 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-6 bg-muted-foreground/20 rounded w-8 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-muted-foreground/20 rounded w-16 animate-pulse"></div>
    </TableCell>
  </TableRow>
);

const TransactionExplorer = () => {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsSearchHash, setDetailsSearchHash] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get data from store
  const {
    apiState,
    transactionData,
    isTransactionLoading,
    isTransactionFetching,
    transactionDetails,
    isDetailsLoading,
    detailsError,
    fetchTransactionData,
    fetchTransactionDetails,
    refreshTransactionData
  } = usePolkadotStore();

  // Memoize filtered transactions with debounced search
  const filteredExtrinsics = useMemo(() => {
    return transactionData.transactions.filter(tx => {
      const matchesSearch = tx.hash.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           tx.signer.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           `${tx.section}.${tx.method}`.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'transfers' && tx.section === 'balances') ||
                           (filterType === 'staking' && tx.section === 'staking') ||
                           (filterType === 'system' && tx.section === 'system');
      
      return matchesSearch && matchesFilter;
    });
  }, [transactionData.transactions, debouncedSearchQuery, filterType]);

  // Memoize paginated transactions
  const paginatedExtrinsics = useMemo(() => {
    return filteredExtrinsics.slice((currentPage - 1) * 10, currentPage * 10);
  }, [filteredExtrinsics, currentPage]);

  // Start fetching immediately when connected
  useEffect(() => {
    if (apiState.status === 'connected' && transactionData.lastUpdated === 0) {
      fetchTransactionData();
    }
  }, [apiState.status]); // Remove fetchTransactionData from deps to prevent loops

  const handleRefresh = () => {
    refreshTransactionData();
  };

  const handleSearchDetails = () => {
    if (detailsSearchHash.trim()) {
      fetchTransactionDetails(detailsSearchHash.trim());
      setShowDetailsDialog(true);
    }
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)} DOT`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)} mDOT`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)} µDOT`;
    return `${num} planck`;
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <FaCheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <FaTimesCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getMethodColor = (section: string) => {
    switch (section) {
      case 'balances': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'staking': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'system': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  // Show connection status if not connected
  if (apiState.status !== 'connected') {
    return (
      <div className="min-h-screen bg-card p-2 sm:p-4 lg:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show UI immediately when connected, even if data is still loading
  const hasData = transactionData.lastUpdated > 0;
  const showSkeleton = !hasData && isTransactionLoading;

  return (
    <div className="min-h-screen bg-card p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transaction Explorer</h1>
            <p className="text-muted-foreground">Explore recent transactions and blocks on the network</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {!hasData && isTransactionLoading ? 'Loading...' : isTransactionFetching ? 'Updating...' : 'Live'}
            </Badge>
            {transactionData.lastUpdated > 0 && (
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(transactionData.lastUpdated).toLocaleTimeString()}
              </span>
            )}
            {isTransactionFetching && !isTransactionLoading && (
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            )}
            <Button onClick={handleRefresh} size="sm" variant="outline" disabled={isTransactionFetching}>
              {isTransactionFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className={cn(
            "lg:col-span-1 space-y-4",
            sidebarOpen ? "block" : "hidden lg:block"
          )}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaSearch className="w-5 h-5 text-primary" />
                  <span>Search & Filter</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Search</label>
                  <Input
                    placeholder="Search by hash, address, or method..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Filter by Type</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="transfers">Transfers</SelectItem>
                      <SelectItem value="staking">Staking</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <FaInfoCircle className="w-4 h-4 text-primary" />
                    <span>Transaction Details</span>
                  </label>
                  <div className="space-y-2 mt-2">
                    <Input
                      placeholder="Enter transaction hash..."
                      value={detailsSearchHash}
                      onChange={(e) => setDetailsSearchHash(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchDetails()}
                    />
                    <Button 
                      onClick={handleSearchDetails} 
                      size="sm" 
                      className="w-full"
                      disabled={!detailsSearchHash.trim() || isDetailsLoading}
                    >
                      {isDetailsLoading ? 'Searching...' : 'Search Details'}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-sm font-medium text-foreground mb-2">Statistics</div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>Total Transactions: {transactionData.transactions.length}</div>
                    <div>Filtered Results: {filteredExtrinsics.length}</div>
                    <div>Current Page: {currentPage} of {Math.ceil(filteredExtrinsics.length / 10)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="transactions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                <TabsTrigger value="blocks">Recent Blocks</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Hash</TableHead>
                            <TableHead>Block</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Signer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {showSkeleton ? (
                            // Show skeleton rows
                            Array.from({ length: 10 }, (_, i) => <TransactionSkeleton key={i} />)
                          ) : (
                            paginatedExtrinsics.map((tx, index) => (
                              <TableRow key={index} className="hover:bg-muted/50">
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-sm">{formatHash(tx.hash)}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopyToClipboard(tx.hash, 'Hash')}
                                      className="h-6 w-6 p-0"
                                    >
                                      <FaCopy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">{tx.blockNumber}</span>
                                </TableCell>
                                <TableCell>
                                  <Badge className={cn("text-xs", getMethodColor(tx.section))}>
                                    {tx.section}.{tx.method}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-mono">{formatAddress(tx.signer)}</span>
                                </TableCell>
                                <TableCell>
                                  {getStatusIcon(tx.success)}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">
                                    {tx.timestamp ? tx.timestamp.toLocaleTimeString() : 'N/A'}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {filteredExtrinsics.length > 10 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, filteredExtrinsics.length)} of {filteredExtrinsics.length} transactions
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage >= Math.ceil(filteredExtrinsics.length / 10)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blocks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Blocks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Height</TableHead>
                            <TableHead>Hash</TableHead>
                            <TableHead>Transactions</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {showSkeleton ? (
                            // Show skeleton rows
                            Array.from({ length: 10 }, (_, i) => <BlockSkeleton key={i} />)
                          ) : (
                            transactionData.blocks.map((block, index) => (
                              <TableRow key={index} className="hover:bg-muted/50">
                                <TableCell>
                                  <span className="font-medium">{block.height}</span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-sm">{formatHash(block.hash)}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopyToClipboard(block.hash, 'Block Hash')}
                                      className="h-6 w-6 p-0"
                                    >
                                      <FaCopy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{block.txCount}</Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">
                                    {block.timestamp ? block.timestamp.toLocaleTimeString() : 'N/A'}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FaInfoCircle className="w-5 h-5 text-primary" />
              <span>Transaction Details</span>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 p-4">
              {isDetailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading transaction details...</p>
                  </div>
                </div>
              ) : detailsError ? (
                <div className="text-center py-12">
                  <div className="text-destructive mb-4">
                    <FaTimesCircle className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold">Transaction Not Found</p>
                  </div>
                  <p className="text-muted-foreground mb-4">{detailsError}</p>
                  <Button onClick={() => setShowDetailsDialog(false)} variant="outline">
                    <FaArrowLeft className="w-4 h-4 mr-2" />
                    Back to Explorer
                  </Button>
                </div>
              ) : transactionDetails ? (
                <>
                  {/* Transaction Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Transaction Overview</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transactionDetails.success)}
                          <Badge variant={transactionDetails.success ? "default" : "destructive"}>
                            {transactionDetails.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-mono text-sm">{formatHash(transactionDetails.hash)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyToClipboard(transactionDetails.hash, 'Transaction Hash')}
                              className="h-6 w-6 p-0"
                            >
                              <FaCopy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Block Number</label>
                          <p className="text-sm mt-1">{transactionDetails.blockNumber.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Method</label>
                          <Badge className={cn("mt-1", getMethodColor(transactionDetails.section))}>
                            {transactionDetails.section}.{transactionDetails.method}
                          </Badge>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                          <p className="text-sm mt-1">
                            {transactionDetails.timestamp ? 
                              transactionDetails.timestamp.toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transaction Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Signer</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-mono text-sm">{formatAddress(transactionDetails.signer)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyToClipboard(transactionDetails.signer, 'Signer Address')}
                              className="h-6 w-6 p-0"
                            >
                              <FaCopy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Fee</label>
                          <p className="text-sm mt-1">{formatBalance(transactionDetails.fee)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Nonce</label>
                          <p className="text-sm mt-1">{transactionDetails.nonce}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Tip</label>
                          <p className="text-sm mt-1">{formatBalance(transactionDetails.tip)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Era</label>
                          <p className="text-sm mt-1">{transactionDetails.era}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Index</label>
                          <p className="text-sm mt-1">{transactionDetails.index}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Arguments */}
                  {transactionDetails.decodedArgs && transactionDetails.decodedArgs.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Arguments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {transactionDetails.decodedArgs.map((arg, index) => (
                            <div key={index} className="flex items-start space-x-4 p-3 bg-muted/50 rounded-lg">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{arg.name}</span>
                                  <Badge variant="outline" className="text-xs">{arg.type}</Badge>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="font-mono text-sm break-all">{arg.value}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyToClipboard(arg.value, `${arg.name} value`)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <FaCopy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Events */}
                  {transactionDetails.events && transactionDetails.events.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {transactionDetails.events.map((event, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-muted/30 rounded">
                              <Badge variant="outline" className="text-xs">
                                {event.phase}
                              </Badge>
                              <span className="text-sm">
                                {event.event.section}.{event.event.method}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Signature */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Signature</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm break-all">{formatHash(transactionDetails.signature)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(transactionDetails.signature, 'Signature')}
                          className="h-6 w-6 p-0"
                        >
                          <FaCopy className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionExplorer;
