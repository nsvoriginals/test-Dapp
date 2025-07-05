import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FaSearch, FaInfoCircle } from 'react-icons/fa';
import React from 'react';

interface TransactionExplorerSidebarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterType: string;
  setFilterType: (v: string) => void;
  detailsSearchHash: string;
  setDetailsSearchHash: (v: string) => void;
  handleSearchDetails: () => void;
  isDetailsLoading: boolean;
  transactionCount: number;
  filteredCount: number;
  currentPage: number;
  totalPages: number;
}

const TransactionExplorerSidebar: React.FC<TransactionExplorerSidebarProps> = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  detailsSearchHash,
  setDetailsSearchHash,
  handleSearchDetails,
  isDetailsLoading,
  transactionCount,
  filteredCount,
  currentPage,
  totalPages,
}) => (
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
          <div>Total Transactions: {transactionCount}</div>
          <div>Filtered Results: {filteredCount}</div>
          <div>Current Page: {currentPage} of {totalPages}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default TransactionExplorerSidebar; 