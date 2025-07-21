import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FaWallet, FaCopy, FaSignOutAlt, FaGhost, FaSuitcase, FaKey, FaSpinner } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { usePolkadotStore } from '@/stores/polkadotStore';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const WALLET_ICONS: Record<string, JSX.Element> = {
  'polkadot-js': <FaWallet className="w-5 h-5" />,
  'talisman': <FaGhost className="w-5 h-5" />,
  'subwallet-js': <FaSuitcase className="w-5 h-5" />,
  'default': <FaKey className="w-5 h-5" />,
};

const POPULAR_WALLETS = [
  { name: 'polkadot-js', title: 'Polkadot.js' },
  { name: 'talisman', title: 'Talisman' },
  { name: 'subwallet-js', title: 'SubWallet' }, // Fixed extension key
];

// Function to check if a wallet extension is installed
const checkWalletInstalled = (walletName: string): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).injectedWeb3?.[walletName];
};

const WalletConnection = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<'wallets' | 'accounts' | 'summary'>('wallets');
  const [installedWallets, setInstalledWallets] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { apiState, api } = usePolkadotStore();

  // Check for installed wallets when modal opens
  useEffect(() => {
    if (modalOpen && step === 'wallets') {
      const checkInstalled = async () => {
        try {
          // Enable web3 extensions first
          await web3Enable('Xorion Blockchain Explorer');
          setTimeout(() => {
            const installed = POPULAR_WALLETS.filter(wallet => {
              return checkWalletInstalled(wallet.name);
            }).map(wallet => ({
              ...wallet,
              installed: true
            }));
            setInstalledWallets(installed);
          }, 100);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to check for wallet extensions',
            variant: 'destructive',
          });
        }
      };

      checkInstalled();
    }
  }, [modalOpen, step, toast]);

  // Fetch accounts for selected wallet
  useEffect(() => {
    if (step === 'accounts' && selectedWallet) {
      setLoading(true);
      web3Accounts({ extensions: [selectedWallet.name] })
        .then(accs => {
          setAccounts(accs);
        })
        .catch(error => {
          toast({
            title: 'Error',
            description: 'Failed to fetch accounts from wallet',
            variant: 'destructive',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [step, selectedWallet, toast]);

  // Fetch balance for selected account
  useEffect(() => {
    if (api && apiState.status === 'connected' && selectedAccount && modalOpen) {
      api.query.system.account(selectedAccount.address).then((info: any) => {
        setBalance(info.data.free.toString());
      }).catch((e: any) => {
        toast({
          title: 'Error fetching balance',
          description: e.message,
          variant: 'destructive',
        });
      });
    } else if (!modalOpen) {
      // Optionally clear balance when modal closes
      // setBalance(null);
    }
  }, [api, apiState.status, selectedAccount, toast, modalOpen]);

  const handleWalletSelect = (wallet: any) => {
    setSelectedWallet(wallet);
    setStep('accounts');
  };

  const handleAccountSelect = (account: InjectedAccountWithMeta) => {
    setSelectedAccount(account);
    setStep('summary');
    toast({
      title: 'Account Connected',
      description: `Connected to ${account.meta.name || 'Account'} from ${account.meta.source}`,
    });
  };

  const handleDisconnect = () => {
    setSelectedAccount(null);
    setSelectedWallet(null);
    setAccounts([]);
    setStep('wallets');
    setModalOpen(false);
    toast({
      title: 'Disconnected',
      description: 'Wallet disconnected successfully',
    });
  };

  const handleSwitchAccount = () => {
    setStep('accounts');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Address copied to clipboard',
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

  // Get non-installed popular wallets
  const installedNames = installedWallets.map(wallet => wallet.name);
  const notInstalled = POPULAR_WALLETS.filter(wallet => !installedNames.includes(wallet.name));

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        variant="outline"
        className="flex items-center space-x-2 bg-blue-300 hover:bg-blue-500 text-black"
        disabled={apiState.status !== 'connected'}
      >
        <FaWallet className="w-4 h-4" />
        <span>{selectedAccount ? formatShort(selectedAccount.address) : 'Connect Wallet'}</span>
      </Button>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 'wallets' && 'Connect a Wallet'}
              {step === 'accounts' && 'Select Account'}
              {step === 'summary' && 'Wallet Connected'}
            </DialogTitle>
            <DialogDescription>
              {step === 'wallets' && 'Choose a wallet extension to connect.'}
              {step === 'accounts' && selectedWallet && `Select an account from ${selectedWallet.title || selectedWallet.name}.`}
              {step === 'summary' && 'You are connected. You can switch account or disconnect.'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Wallets */}
          {step === 'wallets' && (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-green-600 mb-1">Installed</div>
                {installedWallets.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No Polkadot wallet extensions found.
                    <br />
                    <span className="text-xs">Please install a wallet extension first.</span>
                  </div>
                )}
                {installedWallets.map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    className="w-full flex text-white items-center justify-start gap-3 mb-2"
                    onClick={() => handleWalletSelect(wallet)}
                  >
                    {WALLET_ICONS[wallet.name] || WALLET_ICONS['default']}
                    <span className="font-medium">{wallet.title}</span>
                    <Badge variant="outline" className="ml-auto text-green-600 border-green-200">
                      Installed
                    </Badge>
                  </Button>
                ))}
              </div>
              
              {notInstalled.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-blue-600 mb-1">Popular</div>
                  {notInstalled.map((wallet) => (
                    <Button
                      key={wallet.name}
                      variant="outline"
                      className="w-full text-white flex items-center justify-start gap-3 mb-2 opacity-60 cursor-not-allowed"
                      disabled
                    >
                      {WALLET_ICONS[wallet.name] || WALLET_ICONS['default']}
                      <span className="font-medium">{wallet.title}</span>
                      <Badge variant="outline" className="ml-auto text-gray-500">
                        Not Installed
                      </Badge>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Accounts */}
          {step === 'accounts' && (
            <div className="space-y-3">
              {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <FaSpinner className="animate-spin w-8 h-8 mb-2 text-blue-500" />
                  <div className="text-sm text-muted-foreground">Loading accounts...</div>
                </div>
              )}
              {!loading && accounts.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No accounts found in this wallet.
                  <br />
                  <span className="text-xs">Make sure your wallet is unlocked.</span>
                </div>
              )}
              {!loading && accounts.map((account, idx) => (
                <Button
                  key={account.address}
                  variant="outline"
                  className="w-full flex items-center justify-between"
                  onClick={() => handleAccountSelect(account)}
                >
                  <div className="flex items-center gap-2">
                    {WALLET_ICONS[selectedWallet?.name] || WALLET_ICONS['default']}
                    <span>{account.meta.name || `Account ${idx + 1}`}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{formatShort(account.address)}</span>
                </Button>
              ))}
              <Button variant="ghost" className="w-full mt-2" onClick={() => setStep('wallets')}>
                Back to Wallets
              </Button>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 'summary' && selectedAccount && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {WALLET_ICONS[selectedWallet?.name] || WALLET_ICONS['default']}
                <span className="font-medium">{selectedAccount.meta.name || selectedAccount.meta.source}</span>
                <Badge className="bg-primary text-primary-foreground border-primary/30 ml-2">Connected</Badge>
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
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{formatShort(selectedAccount.address)}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedAccount.address)} className="h-6 w-6 p-0">
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
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={handleSwitchAccount} className="w-full">
                  Switch Account
                </Button>
                <Button variant="outline" size="sm" onClick={handleDisconnect} className="w-full">
                  <FaSignOutAlt className="w-3 h-3 mr-1" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnection;