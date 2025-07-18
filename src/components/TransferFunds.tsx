import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FaArrowRight } from 'react-icons/fa6';
import { FaWallet } from 'react-icons/fa6';
import { FaCoins } from 'react-icons/fa6';
import { FaExchangeAlt } from 'react-icons/fa';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { usePolkadotStore } from '@/stores/polkadotStore';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { formatBalance } from '@polkadot/util';
import { cn } from '@/lib/utils';
import Footer from './Footer';
import { u128 } from '@polkadot/types';
import { FrameSystemAccountInfo } from '@polkadot/types/lookup';

interface TransferHistoryItem {
  id: number;
  from: string;
  to: string;
  amount: string;
  token: string;
  status: string;
  timestamp: Date;
  hash: string;
}

const TransferFunds = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedToken, setSelectedToken] = useState('XOR');
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>([]);

  // Get API state from store
  const { apiState, api } = usePolkadotStore();

  // Enable extension and fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        await web3Enable('mock-chain-explorer');
        const allAccounts = await web3Accounts();
        setAccounts(allAccounts);
        if (allAccounts.length > 0) setSelectedAccount(allAccounts[0]);
      } catch (e) {
        console.error('Error fetching accounts:', e);
      }
    };
    fetchAccounts();
  }, []);

  // Fetch balance when account or API changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!api || apiState.status !== 'connected' || !selectedAccount) return;
      try {
        const { data: { free }}: FrameSystemAccountInfo = await api.query.system.account(selectedAccount.address);
        setBalance(free.toString());
      } catch (e: any) {
        console.error('Error fetching balance:', e);
        setBalance('0');
      }
    };
    fetchBalance();
  }, [api, apiState.status, selectedAccount]);

  const handleTransfer = async () => {
    if (!api || apiState.status !== 'connected' || !selectedAccount) {
      toast({ title: 'Not connected', description: 'Please connect your wallet first', variant: 'destructive' });
      return;
    }
    if (!amount || !recipient) {
      toast({ title: 'Missing fields', description: 'Please enter amount and recipient address', variant: 'destructive' });
      return;
    }
    if (parseFloat(amount) <= 0) {
      toast({ title: 'Invalid amount', description: 'Amount must be greater than 0', variant: 'destructive' });
      return;
    }
    if (parseFloat(amount) > parseFloat(balance)) {
      toast({ title: 'Insufficient balance', description: 'You do not have enough funds', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      let transferTx;
      
      if (selectedToken === 'XOR') {
        // Transfer native XOR tokens
        const value = api.createType('Balance', amount.replace(/,/g, ''));
        transferTx = api.tx.balances.transfer(recipient, value);
      } else {
        // Transfer XOR tokens via assets pallet (if available)
        try {
          const assetId = api.createType('AssetId', 1); // Assuming XOR asset ID is 1
          const value = api.createType('Balance', amount.replace(/,/g, ''));
          transferTx = api.tx.assets.transfer(assetId, recipient, value);
        } catch (e) {
          // Fallback to balances transfer if assets pallet not available
          const value = api.createType('Balance', amount.replace(/,/g, ''));
          transferTx = api.tx.balances.transfer(recipient, value);
        }
      }

      const injector = await web3FromSource(selectedAccount.meta.source);
      
      const unsub = await transferTx.signAndSend(selectedAccount.address, { signer: injector.signer }, ({ status, dispatchError }) => {
        if (status.isInBlock) {
          toast({ title: 'Transfer in block', description: `Included in block: ${status.asInBlock.toString()}` });
        } else if (status.isFinalized) {
          const transferRecord: TransferHistoryItem = {
            id: Date.now(),
            from: selectedAccount.address,
            to: recipient,
            amount: amount,
            token: selectedToken,
            status: 'success',
            timestamp: new Date(),
            hash: transferTx.hash.toHex()
          };
          setTransferHistory(prev => [transferRecord, ...prev.slice(0, 9)]);
          setAmount('');
          setRecipient('');
          toast({ title: 'Transfer successful', description: `Successfully transferred ${amount} ${selectedToken} to ${recipient.slice(0, 8)}...` });
          setLoading(false);
          unsub();
        } else if (dispatchError) {
          let errorMsg = 'Transfer failed';
          if (dispatchError.isModule) {
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            errorMsg = `${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`;
          } else {
            errorMsg = dispatchError.toString();
          }
          toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
          setLoading(false);
          unsub();
        }
      });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  const validateAddress = (address: string) => {
    // Basic Polkadot address validation
    return address.length >= 47 && address.length <= 48 && (address.startsWith('1') || address.startsWith('5'));
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? (
      <FaCheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <FaTimesCircle className="w-4 h-4 text-red-500" />
    );
  };

  if (apiState.status !== 'connected') {
    return (
      <div className="min-h-screen bg-card p-2 sm:p-4 lg:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Connecting to Network</h3>
            <p className="text-muted-foreground mb-4">
              {apiState.status === 'connecting' ? 'Establishing connection...' :
               apiState.status === 'error' ? 'Connection failed' :
               apiState.status === 'disconnected' ? 'Disconnected' :
               'Initializing...'}
            </p>
            {apiState.lastError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded mb-4">
                Error: {apiState.lastError}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              Status: {apiState.status} | 
              Endpoint: {apiState.endpoint || 'None'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-card p-2 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Transfer Funds</h1>
            <p className="text-white">Send XOR tokens to other addresses</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {apiState.status === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
            {selectedAccount && (
              <Badge className="bg-primary text-white-foreground">
                {selectedAccount.meta.name || 'Wallet'}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transfer Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <FaExchangeAlt className="w-5 h-5 text-white" />
                  <span>Send Funds</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Account Selection */}
                <div>
                  <label className="text-sm font-medium text-white">From Account</label>
                  <Select value={selectedAccount?.address} onValueChange={(address) => {
                    const account = accounts.find(acc => acc.address === address);
                    setSelectedAccount(account || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.address} value={account.address} title={account.address}>
                          <div className="truncate">
                            {account.meta.name || `${account.address.slice(0, 8)}...${account.address.slice(-6)}`}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAccount && (
                    <div className="mt-2 text-sm text-white">
                      Balance: {formatBalance(balance, { decimals: 10 })} XOR
                    </div>
                  )}
                </div>

                {/* Token Selection */}
                <div>
                  <label className="text-sm font-medium text-white">Token</label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOR">XOR (Native)</SelectItem>
                      <SelectItem value="XOR-ASSET">XOR (Asset)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Recipient Address */}
                <div>
                  <label className="text-sm font-medium text-white">To Address</label>
                  <Input
                    placeholder="Enter recipient address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className={cn(
                      recipient && !validateAddress(recipient) && "border-red-500 focus:border-red-500"
                    )}
                  />
                  {recipient && !validateAddress(recipient) && (
                    <p className="text-sm text-red-500 mt-1">Invalid Polkadot address format</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm font-medium text-white">Amount</label>
                  <Input
                    type="text"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="mt-1 text-sm text-white">
                    Available: {formatBalance(balance, { decimals: 10 })} XOR
                  </div>
                </div>

                {/* Transfer Button */}
                <Button 
                  onClick={handleTransfer} 
                  disabled={loading || !amount || !recipient || !validateAddress(recipient) || !selectedAccount}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaArrowRight className="w-4 h-4 mr-2" />
                      Send {amount} {selectedToken}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transfer History */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <FaCoins className="w-5 h-5 text-white" />
                  <span>Recent Transfers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transferHistory.length === 0 ? (
                    <p className="text-sm text-white text-center py-4">
                      No transfers yet
                    </p>
                  ) : (
                    transferHistory.map((transfer) => (
                      <div key={transfer.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(transfer.status)}
                            <span className="text-sm font-medium">
                              {transfer.amount} {transfer.token}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {transfer.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-white space-y-1">
                          <div>From: {formatAddress(transfer.from)}</div>
                          <div>To: {formatAddress(transfer.to)}</div>
                          <div>Time: {transfer.timestamp.toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Network Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <FaWallet className="w-5 h-5 text-white" />
                  <span>Network Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white">Network:</span>
                  <span className="font-medium text-white">Polkadot</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white">Status:</span>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    Connected
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white">Endpoint:</span>
                  <span className="font-mono text-xs text-white">{apiState.endpoint?.slice(0, 20)}...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default TransferFunds;