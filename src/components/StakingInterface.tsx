import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FaDollarSign, FaChartLine, FaShieldAlt, FaClock, FaStethoscope, FaUsers, FaCoins, FaArrowUp, FaArrowDown, FaWallet } from 'react-icons/fa';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePolkadotStore } from '@/stores/polkadotStore';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { formatBalance } from '@polkadot/util';
import { cn } from '@/lib/utils';

interface Validator {
  accountId: string;
  commission: number;
  totalStake: string;
  ownStake: string;
  nominatorCount: number;
  isActive: boolean;
}

interface Delegation {
  validator: string;
  amount: string;
  rewards: string;
}

const StakingInterface = () => {
  const { toast } = useToast();
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedValidator, setSelectedValidator] = useState('');
  const [redelegateAmount, setRedelegateAmount] = useState('');
  const [undelegateAmount, setUndelegateAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Get API state from store
  const { apiState, api } = usePolkadotStore();
  
  // Real data states
  const [validators, setValidators] = useState<Validator[]>([]);
  const [userStaking, setUserStaking] = useState({
    totalStaked: '0',
    totalRewards: '0',
    pendingRewards: '0',
    delegations: [] as Delegation[]
  });
  const [balance, setBalance] = useState<string>('0');

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

  // Fetch validators
  useEffect(() => {
    const fetchValidators = async () => {
      if (!api || apiState.status !== 'connected') return;
      try {
        console.log('👥 Fetching validators for staking...');
        // Fetch active validators
        const validatorsData = await api.query.staking.validators.entries();
        const validatorsList: Validator[] = [];
        
        for (const [accountId, validatorData] of validatorsData) {
          const validator = validatorData.toHuman() as any;
          const account = accountId.args[0].toString();
          
          // Get validator's total stake
          const totalStake = await api.query.staking.ledger(account);
          const nominators = await api.query.staking.nominators.entries();
          
          validatorsList.push({
            accountId: account,
            commission: validator?.commission || 0,
            totalStake: (totalStake as any).isSome ? (totalStake as any).unwrap().total.toHuman() : '0',
            ownStake: (totalStake as any).isSome ? (totalStake as any).unwrap().active.toHuman() : '0',
            nominatorCount: nominators.filter(([key]) => key.args[0].toString() === account).length,
            isActive: true
          });
        }
        
        console.log(`✅ Found ${validatorsList.length} validators`);
        setValidators(validatorsList);
      } catch (e) {
        console.error('❌ Error fetching validators:', e);
      }
    };
    fetchValidators();
  }, [api, apiState.status]);

  // Fetch user staking data
  useEffect(() => {
    const fetchUserStaking = async () => {
      if (!api || apiState.status !== 'connected' || !selectedAccount) return;
      try {
        console.log('💰 Fetching user staking data...');
        // Fetch user's ledger
        const ledger = await api.query.staking.ledger(selectedAccount.address);
        if ((ledger as any).isSome) {
          const ledgerData = (ledger as any).unwrap().toHuman();
          setUserStaking(prev => ({
            ...prev,
            totalStaked: ledgerData.total || '0',
            delegations: ledgerData.nominators ? ledgerData.nominators.map((nom: any) => ({
              validator: nom,
              amount: '0', // Would need to calculate from individual nominations
              rewards: '0' // Would need to calculate from rewards
            })) : []
          }));
        }

        // Fetch balance
        const { data: { free }}: any = await api.query.system.account(selectedAccount.address);
        setBalance(free.toHuman());
        console.log('✅ User staking data fetched');
      } catch (e) {
        console.error('❌ Error fetching user staking data:', e);
      }
    };
    fetchUserStaking();
  }, [api, apiState.status, selectedAccount]);

  // Handle delegation
  const handleStake = async () => {
    if (!api || apiState.status !== 'connected' || !selectedAccount) {
      toast({ title: 'Not connected', description: 'Please connect your wallet first', variant: 'destructive' });
      return;
    }
    if (!stakeAmount || !selectedValidator) {
      toast({ title: 'Missing fields', description: 'Please enter amount and select a validator', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const value = api.createType('Balance', stakeAmount.replace(/,/g, ''));
      const bond = api.tx.staking.bond(selectedValidator, value, 'Staked');
      
      const injector = await web3FromSource(selectedAccount.meta.source);
      
      const unsub = await bond.signAndSend(selectedAccount.address, { signer: injector.signer }, ({ status, dispatchError }) => {
        if (status.isInBlock) {
          toast({ title: 'Delegation in block', description: `Included in block: ${status.asInBlock.toString()}` });
        } else if (status.isFinalized) {
          toast({ title: 'Delegation successful', description: `Successfully delegated ${stakeAmount} XOR to ${selectedValidator}` });
          setStakeAmount('');
          setSelectedValidator('');
          setLoading(false);
          unsub();
        } else if (dispatchError) {
          let errorMsg = 'Delegation failed';
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

  // Handle redelegation
  const handleRedelegate = async () => {
    if (!api || apiState.status !== 'connected' || !selectedAccount) {
      toast({ title: 'Not connected', description: 'Please connect your wallet first', variant: 'destructive' });
      return;
    }
    if (!redelegateAmount || !selectedValidator) {
      toast({ title: 'Missing fields', description: 'Please enter amount and select a validator', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const value = api.createType('Balance', redelegateAmount.replace(/,/g, ''));
      const rebond = api.tx.staking.rebond(value);
      
      const rebondInjector = await web3FromSource(selectedAccount.meta.source);
      
      const unsub = await rebond.signAndSend(selectedAccount.address, { signer: rebondInjector.signer }, ({ status, dispatchError }) => {
        if (status.isInBlock) {
          toast({ title: 'Redelegation in block', description: `Included in block: ${status.asInBlock.toString()}` });
        } else if (status.isFinalized) {
          toast({ title: 'Redelegation successful', description: `Successfully redelegated ${redelegateAmount} XOR` });
          setRedelegateAmount('');
          setSelectedValidator('');
          setLoading(false);
          unsub();
        } else if (dispatchError) {
          let errorMsg = 'Redelegation failed';
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

  // Handle undelegation
  const handleUndelegate = async () => {
    if (!api || apiState.status !== 'connected' || !selectedAccount) {
      toast({ title: 'Not connected', description: 'Please connect your wallet first', variant: 'destructive' });
      return;
    }
    if (!undelegateAmount) {
      toast({ title: 'Missing amount', description: 'Please enter amount to undelegate', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const value = api.createType('Balance', undelegateAmount.replace(/,/g, ''));
      const unbond = api.tx.staking.unbond(value);
      
      const unbondInjector = await web3FromSource(selectedAccount.meta.source);
      
      const unsub = await unbond.signAndSend(selectedAccount.address, { signer: unbondInjector.signer }, ({ status, dispatchError }) => {
        if (status.isInBlock) {
          toast({ title: 'Undelegation in block', description: `Included in block: ${status.asInBlock.toString()}` });
        } else if (status.isFinalized) {
          toast({ title: 'Undelegation successful', description: `Successfully undelegated ${undelegateAmount} XOR` });
          setUndelegateAmount('');
          setLoading(false);
          unsub();
        } else if (dispatchError) {
          let errorMsg = 'Undelegation failed';
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

  // Handle claim rewards
  const handleClaimRewards = async () => {
    if (!api || apiState.status !== 'connected' || !selectedAccount) {
      toast({ title: 'Not connected', description: 'Please connect your wallet first', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const payout = api.tx.staking.payoutStakers(selectedAccount.address, 0); // Current era
      
      const payoutInjector = await web3FromSource(selectedAccount.meta.source);
      
      const unsub = await payout.signAndSend(selectedAccount.address, { signer: payoutInjector.signer }, ({ status, dispatchError }) => {
        if (status.isInBlock) {
          toast({ title: 'Claim in block', description: `Included in block: ${status.asInBlock.toString()}` });
        } else if (status.isFinalized) {
          toast({ title: 'Rewards claimed', description: 'Successfully claimed staking rewards' });
          setLoading(false);
          unsub();
        } else if (dispatchError) {
          let errorMsg = 'Claim failed';
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

  const stakingDistribution = userStaking.delegations.map((delegation, index) => ({
    name: delegation.validator,
    value: parseFloat(delegation.amount) || 0,
    color: ['#3b82f6', '#10b981', '#f59e0b'][index % 3]
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-3 rounded shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-blue-600">{`${payload[0].value.toLocaleString()} xor`}</p>
        </div>
      );
    }
    return null;
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
    <div className="min-h-screen bg-card p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staking Interface</h1>
            <p className="text-muted-foreground">Manage your XOR staking and delegations</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {apiState.status === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
            {selectedAccount && (
              <Badge className="bg-primary text-primary-foreground">
                {selectedAccount.meta.name || 'Wallet'}
              </Badge>
            )}
          </div>
        </div>

        {/* Account Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FaWallet className="w-5 h-5 text-primary" />
              <span>Wallet Connection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Select Account</label>
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
              </div>
              
              {selectedAccount && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <label className="text-sm font-medium text-foreground">Address</label>
                    <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                      <div className="truncate" title={selectedAccount.address}>
                        {selectedAccount.address}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Balance</label>
                    <div className="text-2xl font-bold text-foreground">
                      {formatBalance(balance, { decimals: 10 })} XOR
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Staking Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FaShieldAlt className="w-5 h-5 text-primary" />
              <span>Staking Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {formatBalance(userStaking.totalStaked, { decimals: 10 })} XOR
                </div>
                <div className="text-sm text-muted-foreground">Total Staked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {formatBalance(userStaking.totalRewards, { decimals: 10 })} XOR
                </div>
                <div className="text-sm text-muted-foreground">Total Rewards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {formatBalance(userStaking.pendingRewards, { decimals: 10 })} XOR
                </div>
                <div className="text-sm text-muted-foreground">Pending Rewards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {userStaking.delegations.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Delegations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staking Actions */}
        <Tabs defaultValue="stake" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="redelegate">Redelegate</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaArrowUp className="w-5 h-5 text-primary" />
                  <span>Delegate XOR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Select Validator</label>
                  <Select value={selectedValidator} onValueChange={setSelectedValidator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a validator" />
                    </SelectTrigger>
                    <SelectContent>
                      {validators.map((validator) => (
                        <SelectItem key={validator.accountId} value={validator.accountId} title={validator.accountId}>
                          <div className="truncate">
                            {`${validator.accountId.slice(0, 8)}...${validator.accountId.slice(-6)} (${validator.commission}% commission)`}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Amount (XOR)</label>
                  <Input
                    type="text"
                    placeholder="Enter amount to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>
                
                <Button onClick={handleStake} disabled={loading || !stakeAmount || !selectedValidator} className="w-full">
                  {loading ? 'Staking...' : 'Stake XOR'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redelegate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaArrowUp className="w-5 h-5 text-primary" />
                  <span>Redelegate XOR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Select New Validator</label>
                  <Select value={selectedValidator} onValueChange={setSelectedValidator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a validator" />
                    </SelectTrigger>
                    <SelectContent>
                      {validators.map((validator) => (
                        <SelectItem key={validator.accountId} value={validator.accountId} title={validator.accountId}>
                          <div className="truncate">
                            {`${validator.accountId.slice(0, 8)}...${validator.accountId.slice(-6)} (${validator.commission}% commission)`}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Amount (XOR)</label>
                  <Input
                    type="text"
                    placeholder="Enter amount to redelegate"
                    value={redelegateAmount}
                    onChange={(e) => setRedelegateAmount(e.target.value)}
                  />
                </div>
                
                <Button onClick={handleRedelegate} disabled={loading || !redelegateAmount || !selectedValidator} className="w-full">
                  {loading ? 'Redelegating...' : 'Redelegate XOR'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unstake" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaArrowDown className="w-5 h-5 text-primary" />
                  <span>Unstake XOR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Amount (XOR)</label>
                  <Input
                    type="text"
                    placeholder="Enter amount to unstake"
                    value={undelegateAmount}
                    onChange={(e) => setUndelegateAmount(e.target.value)}
                  />
                </div>
                
                <Button onClick={handleUndelegate} disabled={loading || !undelegateAmount} className="w-full">
                  {loading ? 'Unstaking...' : 'Unstake XOR'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaCoins className="w-5 h-5 text-primary" />
                  <span>Claim Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {formatBalance(userStaking.pendingRewards, { decimals: 10 })} XOR
                  </div>
                  <div className="text-sm text-muted-foreground">Available Rewards</div>
                </div>
                
                <Button onClick={handleClaimRewards} disabled={loading || parseFloat(userStaking.pendingRewards) === 0} className="w-full">
                  {loading ? 'Claiming...' : 'Claim Rewards'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delegation Distribution Chart */}
        {userStaking.delegations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FaChartLine className="w-5 h-5 text-primary" />
                <span>Delegation Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stakingDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stakingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StakingInterface;