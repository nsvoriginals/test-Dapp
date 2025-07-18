import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ChevronDown, Copy, LogOut, User, Check } from 'lucide-react';
import { FaWallet, FaChevronDown, FaCopy, FaSignOutAlt, FaExternalLinkAlt, FaUser, FaCheck } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { usePolkadotStore } from '@/stores/polkadotStore';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { formatBalance } from '@polkadot/util';
import { cn } from '@/lib/utils';
import { FrameSystemAccountInfo } from '@polkadot/types/lookup';

const WalletConnection = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountSelectionOpen, setIsAccountSelectionOpen] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 320 });

  // Get API state from store
  const { apiState, api } = usePolkadotStore();

  useEffect(() => {
    if (api && apiState.status === 'connected' && selectedAccount) {
      const fetchBalance = async () => {
        try {
          const { data: { free }}: FrameSystemAccountInfo = await api.query.system.account(selectedAccount.address);
          setBalance(free.toString());
        } catch (e: any) {
          toast({
            title: "Error fetching balance",
            description: e.message,
            variant: "destructive",
          });
        }
      };
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [api, apiState.status, selectedAccount, toast]);

  useEffect(() => {
    if ((isDropdownOpen || isAccountSelectionOpen) && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const dropdownWidth = 320;
        const dropdownHeight = isAccountSelectionOpen ? 400 : 280; // Taller for account selection
        
        // Calculate optimal position
        let left = rect.left;
        let top = rect.bottom + window.scrollY + 8;
        
        // If dropdown would overflow right edge, align to right edge of button
        if (left + dropdownWidth > viewportWidth) {
          left = rect.right - dropdownWidth;
        }
        
        // Ensure dropdown doesn't go off the left edge
        if (left < 0) {
          left = 8; // 8px margin from left edge
        }
        
        // If dropdown would overflow bottom edge, show above button
        if (rect.bottom + dropdownHeight > viewportHeight) {
          top = rect.top + window.scrollY - dropdownHeight - 8;
        }
        
        setDropdownStyle({
          top: top,
          left: left,
          width: dropdownWidth
        });
      };
      
      updatePosition();
      
      // Add resize listener
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isDropdownOpen, isAccountSelectionOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // First, request permission from wallet extension
      const extensions = await web3Enable('Xorion Blockchain Explorer');
      
      if (!extensions || extensions.length === 0) {
        toast({
          title: "No Wallet Extension Found",
          description: "Please install Polkadot{.js} or other compatible wallet extension and refresh the page.",
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }

      // Get all accounts from the wallet
      const allAccounts = await web3Accounts();
      
      if (allAccounts.length === 0) {
        toast({
          title: "No accounts found",
          description: "Please create an account in your wallet extension first",
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }

      setAccounts(allAccounts);
      
      // If only one account, auto-select it
      if (allAccounts.length === 1) {
        setSelectedAccount(allAccounts[0]);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${allAccounts[0].meta.name || 'Account'}`,
        });
      } else {
        // Show account selection interface
        setIsAccountSelectionOpen(true);
      }
      
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccountSelect = (account: InjectedAccountWithMeta) => {
    setSelectedAccount(account);
    setIsAccountSelectionOpen(false);
    toast({
      title: "Account Selected",
      description: `Connected to ${account.meta.name || 'Account'}`,
    });
  };

  const handleDisconnect = () => {
    setSelectedAccount(null);
    setAccounts([]);
    setBalance(null);
    setIsDropdownOpen(false);
    setIsAccountSelectionOpen(false);
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const formatShort = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = () => {
    if (!api) return 'Unknown';
    
    try {
      const chain = api.genesisHash?.toHex();
      if (chain === '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3') {
        return 'Polkadot';
      } else if (chain === '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e') {
        return 'Westend';
      } else if (chain === '0x67dddf2673b69e5f875f6f252774958c98deac9b') {
        return 'Kusama';
      }
      return 'Custom Network';
    } catch {
      return 'Unknown';
    }
  };

  // Account Selection Modal
  const AccountSelectionModal = () => (
    <Card
      className="fixed z-[9999] shadow-2xl border border-border/50 glass-card"
      style={{
        top: dropdownStyle.top,
        left: dropdownStyle.left,
        width: dropdownStyle.width,
        minWidth: dropdownStyle.width,
        maxWidth: dropdownStyle.width
      }}
    >
      {/* Arrow pointing to button */}
      <div 
        className="absolute w-3 h-3 glass-card border-l border-t border-border/50 transform rotate-45"
        style={{
          top: '-6px',
          left: '20px'
        }}
      />
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <FaUser className="w-5 h-5 text-pink-500" />
          <span>Select Account</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Choose which account to connect to this dapp</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {accounts.map((account, index) => (
            <div
              key={account.address}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => handleAccountSelect(account)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {account.meta.name ? account.meta.name.charAt(0).toUpperCase() : (index + 1)}
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {account.meta.name || `Account ${index + 1}`}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {formatShort(account.address)}
                  </div>
                </div>
              </div>
              <FaCheck className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100" />
            </div>
          ))}
        </div>
        
        <div className="pt-3 mt-3 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAccountSelectionOpen(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Connected Wallet Dropdown
  const ConnectedWalletDropdown = () => (
    <Card
      className="fixed z-[9999] shadow-2xl border border-border/50 glass-card"
      style={{
        top: dropdownStyle.top,
        left: dropdownStyle.left,
        width: dropdownStyle.width,
        minWidth: dropdownStyle.width,
        maxWidth: dropdownStyle.width
      }}
    >
      {/* Arrow pointing to button */}
      <div 
        className="absolute w-3 h-3 glass-card border-l border-t border-border/50 transform rotate-45"
        style={{
          top: '-6px',
          left: '20px'
        }}
      />
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Wallet Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaWallet className="w-5 h-5 text-pink-500" />
              <span className="text-foreground font-medium">{selectedAccount?.meta.name || selectedAccount?.meta.source}</span>
            </div>
            <Badge className="bg-green-500 hover:bg-green-300 text-primary-foreground border-primary/30">
              Connected
            </Badge>
          </div>

          {/* Network */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">Network</div>
            <div className="text-foreground">{getNetworkName()}</div>
          </div>

          {/* Address */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">Address</div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                {formatShort(selectedAccount?.address || '')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(selectedAccount?.address || '')}
                className="h-6 w-6 p-0"
              >
                <FaCopy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Balance */}
          {balance && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Balance</div>
              <div className="text-lg font-bold text-foreground">
                {formatBalance(balance, { decimals: 10 })} XOR
              </div>
            </div>
          )}

          {/* Connection Status */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">Connection Status</div>
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                apiState.status === 'connected' ? "bg-green-500" : 
                apiState.status === 'connecting' ? "bg-yellow-400" : "bg-red-500"
              )} />
              <span className="text-sm text-foreground capitalize">{apiState.status}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2 border-t border-border">
            <Button
              size="sm"
              onClick={() => copyToClipboard(selectedAccount?.address || '')}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-none shadow hover:from-blue-500 hover:to-pink-500 transition-all"
            >
              <FaCopy className="w-3 h-3 mr-1" />
              Copy Address
            </Button>
            <Button
              size="sm"
              onClick={handleDisconnect}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-none shadow hover:from-blue-500 hover:to-pink-500 transition-all"
            >
              <FaSignOutAlt className="w-3 h-3 mr-1" />
              Disconnect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!selectedAccount) {
    return (
      <>
        <Button
          onClick={handleConnect}
          variant="outline"
          className="flex items-center space-x-2 bg-blue-300 hover:bg-blue-500 text-black"
          disabled={apiState.status !== 'connected' || isConnecting}
        >
          <FaWallet className="w-4 h-4" />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </Button>

        {isAccountSelectionOpen && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsAccountSelectionOpen(false)}
            />
            <AccountSelectionModal />
          </>,
          document.body
        )}
      </>
    );
  }

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        variant="outline"
        className="flex items-center space-x-2 bg-blue-300 text-black hover:bg-blue-500 hover:text-black"
      >
        <FaWallet className="w-4 h-4" />
        <span>{formatShort(selectedAccount.address)}</span>
        <FaChevronDown className={cn("w-3 h-3 transition-transform", isDropdownOpen && "rotate-180")} />
      </Button>

      {isDropdownOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsDropdownOpen(false)}
          />
          <ConnectedWalletDropdown />
        </>,
        document.body
      )}
    </>
  );
};

export default WalletConnection;