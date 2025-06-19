import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, ChevronDown, Copy, LogOut } from 'lucide-react';
import { FaWallet, FaChevronDown, FaCopy, FaSignOutAlt } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import usePolkadot from '@/hooks/use-polkadot';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const WalletConnection = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const { toast } = useToast();
  const { api, isConnected, loading, error, connect } = usePolkadot();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 320 });

  useEffect(() => {
    if (api && isConnected && selectedAccount) {
      const fetchBalance = async () => {
        try {
          const { data: { free }}:any = await api.query.system.account(selectedAccount.address);
          setBalance(free.toHuman());
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
  }, [api, isConnected, selectedAccount, toast]);

  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + window.scrollY + 8, // 8px margin
        left: rect.right - 320, // align right edge, width 320px
        width: 320
      });
    }
  }, [isDropdownOpen]);

  const handleConnect = async () => {
    try {
      const extensions = await web3Enable('mock-chain-explorer');
      if (extensions.length === 0) {
        toast({
          title: "No Polkadot.js Extension Found",
          description: "Please install the Polkadot.js extension for your browser.",
          variant: "destructive",
        });
        return;
      }
      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);
      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
        toast({
          title: "Wallet Connected!",
          description: `Connected to ${allAccounts[0].meta.name || allAccounts[0].meta.source} wallet`,
        });
      } else {
        toast({
          title: "No Accounts Found",
          description: "Please create an account in your Polkadot.js extension.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Connection Error",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    setSelectedAccount(null);
    setAccounts([]);
    setIsDropdownOpen(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address);
      toast({
        title: "Address Copied!",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatShort = (str: string) => {
    if (!str || str.length <= 14) return str;
    return `${str.slice(0, 6)}...${str.slice(-6)}`;
  };

  if (loading) {
    return (
      <Button disabled className="bg-primary/50 text-primary-foreground font-medium animate-pulse">
        <FaWallet className="w-4 h-4 mr-2" />
        Connecting...
      </Button>
    );
  }

  if (error) {
    return (
      <Button disabled className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium">
        <FaWallet className="w-4 h-4 mr-2" />
        Connection Error
      </Button>
    );
  }

  if (!selectedAccount) {
    return (
      <Button 
        onClick={handleConnect}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        <FaWallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <>
      <div className="relative z-[100]">
        <Button
          ref={buttonRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-card/20 border border-border hover:border-primary text-foreground min-w-0"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
            <div className="text-left min-w-0">
              <div className="text-sm font-medium text-foreground truncate max-w-[80px] md:max-w-[120px]">{formatAddress(selectedAccount.address)}</div>
              <div className="text-xs text-muted-foreground truncate max-w-[80px] md:max-w-[120px]">
                {balance ? `${balance} ATOM` : 'Fetching balance...'}
              </div>
            </div>
            <FaChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </Button>
      </div>
      {isDropdownOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsDropdownOpen(false)}
          />
          <Card
            className="fixed z-[9999] shadow-2xl"
            style={{
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
              minWidth: dropdownStyle.width,
              maxWidth: dropdownStyle.width
            }}
          >
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Wallet Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaWallet className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">{selectedAccount.meta.name || selectedAccount.meta.source}</span>
                  </div>
                  <Badge className="bg-primary text-primary-foreground border-primary/30">
                    Connected
                  </Badge>
                </div>

                {/* Network */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Network</div>
                  <div className="text-foreground">{
                    typeof api?.genesisHash?.toHuman === 'function'
                      ? formatShort(String(api.genesisHash.toHuman()))
                      : 'N/A'
                  }</div>
                </div>

                {/* Address */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Address</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-foreground font-mono text-sm">{formatAddress(selectedAccount.address)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyAddress}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <FaCopy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Balance */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Balance</div>
                  <div className="text-foreground font-semibold">
                    {balance ? `${balance} ATOM` : 'Fetching balance...'}
                  </div>
                </div>

                {/* Account Selection */}
                {accounts.length > 1 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Change Account</div>
                    <select
                      onChange={(e) => {
                        const acc = accounts.find(a => a.address === e.target.value);
                        if (acc) setSelectedAccount(acc);
                      }}
                      value={selectedAccount.address}
                      className="p-2 rounded-md bg-input border border-border text-foreground w-full"
                    >
                      {accounts.map(acc => (
                        <option key={acc.address} value={acc.address}>
                          {acc.meta.name || formatAddress(acc.address)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-border">
                  <Button
                    onClick={handleDisconnect}
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                  >
                    <FaSignOutAlt className="w-4 h-4 mr-2" />
                    Disconnect Wallet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>,
        document.body
      )}
    </>
  );
};

export default WalletConnection;
