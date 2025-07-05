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
import TransactionExplorerHeader from './TransactionExplorerHeader';
import ConnectionStatusCard from './ConnectionStatusCard';
import TransactionExplorerSidebar from './TransactionExplorerSidebar';
import TransactionsTable from './TransactionsTable';
import BlocksTable from './BlocksTable';
import PaginationControls from './PaginationControls';
import TransactionDetailsDialog from './TransactionDetailsDialog';

// DEBOUNCE HOOK FOR SEARCH INPUT, I THINK THIS IS FOR DELAYING TYPING
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

// SKELETON COMPONENTS FOR LOADING, I GUESS THIS SHOWS PLACEHOLDER ROWS
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

  // DEBOUNCED SEARCH QUERY, SO IT DOESN'T SEARCH EVERY KEYSTROKE
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // GET DATA FROM THE STORE, THIS IS WHERE WE PULL POLKADOT DATA
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

  // Debug log for fetched transactions and blocks
  useEffect(() => {
    if (transactionData && transactionData.transactions) {
      console.log('Fetched transactions:', transactionData.transactions);
      console.log('Fetched blocks:', transactionData.blocks);
    }
  }, [transactionData]);

  // FILTER TRANSACTIONS BASED ON SEARCH AND FILTER TYPE, NOT SURE IF THIS IS THE FASTEST WAY
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

  // PAGINATE THE FILTERED TRANSACTIONS, ONLY SHOW 10 AT A TIME
  const paginatedExtrinsics = useMemo(() => {
    return filteredExtrinsics.slice((currentPage - 1) * 10, currentPage * 10);
  }, [filteredExtrinsics, currentPage]);

  // FETCH DATA WHEN CONNECTED, I THINK THIS ONLY RUNS ONCE
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

  // IF NOT CONNECTED, SHOW CONNECTION STATUS CARD
  if (apiState.status !== 'connected') {
    return <ConnectionStatusCard apiState={apiState} />;
  }

  // IF CONNECTED, SHOW MAIN UI, EVEN IF STILL LOADING DATA
  const hasData = transactionData.lastUpdated > 0;
  const showSkeleton = !hasData && isTransactionLoading;
  const totalPages = Math.max(1, Math.ceil(filteredExtrinsics.length / 10));
  const isEmpty = !showSkeleton && filteredExtrinsics.length === 0;

  return (
    <div className="min-h-screen bg-card p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <TransactionExplorerHeader
          hasData={hasData}
          isTransactionLoading={isTransactionLoading}
          isTransactionFetching={isTransactionFetching}
          lastUpdated={transactionData.lastUpdated}
          onRefresh={handleRefresh}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className={cn(
            "lg:col-span-1 space-y-4",
            sidebarOpen ? "block" : "hidden lg:block"
          )}>
            <TransactionExplorerSidebar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterType={filterType}
              setFilterType={setFilterType}
              detailsSearchHash={detailsSearchHash}
              setDetailsSearchHash={setDetailsSearchHash}
              handleSearchDetails={handleSearchDetails}
              isDetailsLoading={isDetailsLoading}
              transactionCount={transactionData.transactions.length}
              filteredCount={filteredExtrinsics.length}
              currentPage={currentPage}
              totalPages={totalPages}
            />
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
                    {isEmpty ? (
                      <div className="text-center text-muted-foreground py-8 text-lg">
                        No transactions found on this network.
                      </div>
                    ) : (
                      <TransactionsTable
                        transactions={paginatedExtrinsics}
                        showSkeleton={showSkeleton}
                        formatHash={formatHash}
                        formatAddress={formatAddress}
                        getMethodColor={getMethodColor}
                        getStatusIcon={getStatusIcon}
                        handleCopyToClipboard={handleCopyToClipboard}
                      />
                    )}
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
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
                      <BlocksTable
                        blocks={transactionData.blocks}
                        showSkeleton={showSkeleton}
                        formatHash={formatHash}
                        handleCopyToClipboard={handleCopyToClipboard}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        isDetailsLoading={isDetailsLoading}
        detailsError={detailsError}
        transactionDetails={transactionDetails}
        formatHash={formatHash}
        formatAddress={formatAddress}
        formatBalance={formatBalance}
        getStatusIcon={getStatusIcon}
        getMethodColor={getMethodColor}
        handleCopyToClipboard={handleCopyToClipboard}
      />
    </div>
  );
};

export default TransactionExplorer;
