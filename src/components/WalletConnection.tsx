
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, ChevronDown, Copy, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();

  // Mock wallet data
  const walletData = {
    address: 'cosmos1abc123def456ghi789jkl012mno345pqr678stu',
    balance: 15420.75,
    network: 'Cosmos Hub',
    walletType: 'Keplr'
  };

  const handleConnect = () => {
    // Simulate wallet connection
    setIsConnected(true);
    toast({
      title: "Wallet Connected!",
      description: `Connected to ${walletData.walletType} wallet`,
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsDropdownOpen(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletData.address);
    toast({
      title: "Address Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (!isConnected) {
    return (
      <Button 
        onClick={handleConnect}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="bg-black/20 border border-purple-500/30 hover:border-purple-400/50 text-white"
      >
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <div className="text-left">
            <div className="text-sm font-medium">{formatAddress(walletData.address)}</div>
            <div className="text-xs text-gray-300">{walletData.balance.toLocaleString()} ATOM</div>
          </div>
          <ChevronDown className="w-4 h-4" />
        </div>
      </Button>

      {isDropdownOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 bg-black/90 border-gray-700/50 backdrop-blur-sm z-50">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Wallet Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">{walletData.walletType}</span>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Connected
                </Badge>
              </div>

              {/* Network */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Network</div>
                <div className="text-white">{walletData.network}</div>
              </div>

              {/* Address */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Address</div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-sm">{formatAddress(walletData.address)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0 hover:bg-gray-700"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Balance */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Balance</div>
                <div className="text-white font-semibold">
                  {walletData.balance.toLocaleString()} ATOM
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-gray-700">
                <Button
                  onClick={handleDisconnect}
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect Wallet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backdrop */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default WalletConnection;
