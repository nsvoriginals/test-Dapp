import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FaWallet, FaChevronDown, FaCopy, FaSignOutAlt, FaCheck, FaGhost, FaSuitcase, FaKey } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { usePolkadotStore } from '@/stores/polkadotStore';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { formatBalance } from '@polkadot/util';
import { cn } from '@/lib/utils';
import { FrameSystemAccountInfo } from '@polkadot/types/lookup';

const WalletConnection = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const { toast } = useToast();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 320 });

  const { apiState, api } = usePolkadotStore();

  useEffect(() => {
    if (api && apiState.status === 'connected' && selectedAccount) {
      const fetchBalance = async () => {
        try {
          const { data: { free } }: FrameSystemAccountInfo = await api.query.system.account(selectedAccount.address);
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
    if ((isDropdownOpen || isAccountSelectorOpen) && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const dropdownWidth = 320;
        const dropdownHeight = isAccountSelectorOpen ? Math.min(400, accounts.length * 80 + 200) : 280;

        let left = rect.left;
        let top = rect.bottom + window.scrollY + 8;

        if (left + dropdownWidth > viewportWidth) {
          left = rect.right - dropdownWidth;
        }
        if (left < 0) {
          left = 8;
        }
        if (rect.bottom + dropdownHeight > viewportHeight) {
          top = rect.top + window.scrollY - dropdownHeight - 8;
        }

        setDropdownStyle({ top, left, width: dropdownWidth });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isDropdownOpen, isAccountSelectorOpen, accounts.length]);

  const handleConnect = async () => {
    try {
      await web3Enable('Xorion Blockchain Explorer');
      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);
      
      if (allAccounts.length > 0) {
        // Don't auto-select, show account selector instead
        setIsAccountSelectorOpen(true);
        toast({
          title: "Wallets Found",
          description: `Found ${allAccounts.length} account(s). Please select one to connect.`,
        });
      } else {
        toast({
          title: "No accounts found",
          description: "Please create an account in your wallet extension first",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleAccountSelect = (account: InjectedAccountWithMeta) => {
    setSelectedAccount(account);
    setIsAccountSelectorOpen(false);
    setIsDropdownOpen(true);
    toast({
      title: "Account Connected",
      description: `Connected to ${account.meta.name || 'Account'} from ${account.meta.source}`,
    });
  };

  const handleDisconnect = () => {
    setSelectedAccount(null);
    setAccounts([]);
    setBalance(null);
    setIsDropdownOpen(false);
    setIsAccountSelectorOpen(false);
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    });
  };

  const handleSwitchAccount = () => {
    setIsDropdownOpen(false);
    setIsAccountSelectorOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const formatShort = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getNetworkName = () => {
    if (!api) return 'Unknown';
    try {
      const chain = api.genesisHash?.toHex();
      if (chain === '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3') return 'Polkadot';
      if (chain === '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e') return 'Westend';
      if (chain === '0x67dddf2673b69e5f875f6f252774958c98deac9b') return 'Kusama';
      return 'Xorion Network';
    } catch {
      return 'Unknown';
    }
  };

  const getWalletIcon = (source: string) => {
    // Return React Icon components based on the source
    switch (source) {
      case 'polkadot-js':
        return <FaWallet className="w-4 h-4" />;
      case 'talisman':
        return <FaGhost className="w-4 h-4" />;
      case 'subwallet':
        return <FaSuitcase className="w-4 h-4" />;
      default:
        return <FaKey className="w-4 h-4" />;
    }
  };

  // Group accounts by wallet source
  const groupedAccounts = accounts.reduce((groups, account) => {
    const source = account.meta.source || 'unknown';
    if (!groups[source]) {
      groups[source] = [];
    }
    groups[source].push(account);
    return groups;
  }, {} as Record<string, InjectedAccountWithMeta[]>);

  if (!selectedAccount) {
    return (
      <>
        <Button
          ref={buttonRef}
          onClick={handleConnect}
          variant="outline"
          className="flex items-center space-x-2 bg-blue-300 hover:bg-blue-500 text-black"
          disabled={apiState.status !== 'connected'}
        >
          <FaWallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </Button>

        {/* Account Selector Modal */}
        {isAccountSelectorOpen && createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsAccountSelectorOpen(false)} />
            <Card
              className="fixed z-[9999] shadow-2xl border border-border/50 bg-card/95 backdrop-blur-sm"
              style={{
                top: dropdownStyle.top,
                left: dropdownStyle.left,
                width: dropdownStyle.width,
                minWidth: dropdownStyle.width,
                maxWidth: dropdownStyle.width,
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              <div
                className="absolute w-3 h-3 bg-card border-l border-t border-border/50 transform rotate-45"
                style={{ top: '-6px', left: '20px' }}
              />
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Select Account</h3>
                    <Badge variant="outline">{accounts.length} accounts found</Badge>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {Object.entries(groupedAccounts).map(([walletSource, walletAccounts]) => (
                      <div key={walletSource} className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                          {getWalletIcon(walletSource)}
                          <span className="capitalize">{walletSource.replace('-', ' ')}</span>
                        </div>
                        
                        {walletAccounts.map((account, index) => (
                          <div
                            key={`${walletSource}-${index}`}
                            onClick={() => handleAccountSelect(account)}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-foreground">
                                {account.meta.name || `Account ${index + 1}`}
                              </div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {formatShort(account.address)}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(account.address);
                              }}
                            >
                              <FaCopy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsDropdownOpen(false)} />
          <Card
            className="fixed z-[9999] shadow-2xl border border-border/50 bg-card/95 backdrop-blur-sm"
            style={{
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
              minWidth: dropdownStyle.width,
              maxWidth: dropdownStyle.width,
            }}
          >
            <div
              className="absolute w-3 h-3 bg-card border-l border-t border-border/50 transform rotate-45"
              style={{ top: '-6px', left: '20px' }}
            />
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getWalletIcon(selectedAccount.meta.source || '')}
                    <span className="text-foreground font-medium">{selectedAccount.meta.name || selectedAccount.meta.source}</span>
                  </div>
                  <Badge className="bg-primary text-primary-foreground border-primary/30">Connected</Badge>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Wallet</div>
                  <div className="text-foreground capitalize">{(selectedAccount.meta.source || '').replace('-', ' ')}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Network</div>
                  <div className="text-foreground">{getNetworkName()}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Address</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                      {formatShort(selectedAccount.address)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedAccount.address)}
                      className="h-6 w-6 p-0"
                    >
                      <FaCopy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {balance && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Balance</div>
                    <div className="text-lg font-bold text-foreground">
                      {(Number(balance) / 1e18).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 })} tXOR
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Connection Status</div>
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      apiState.status === 'connected' ? "bg-green-500" :
                      apiState.status === 'connecting' ? "bg-yellow-500" : "bg-red-500"
                    )} />
                    <span className="text-sm text-foreground capitalize">{apiState.status}</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 pt-2 border-t border-border">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedAccount.address)}
                      className="flex-1"
                    >
                      <FaCopy className="w-3 h-3 mr-1" />
                      Copy Address
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSwitchAccount}
                      className="flex-1"
                    >
                      <FaWallet className="w-3 h-3 mr-1" />
                      Switch Account
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="w-full"
                  >
                    <FaSignOutAlt className="w-3 h-3 mr-1" />
                    Disconnect
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