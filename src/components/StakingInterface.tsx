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
import AccountSelector from './AccountSelector';
import StakingOverview from './StakingOverview';
import StakingActions from './StakingActions';
import DelegationDistributionChart from './DelegationDistributionChart';
import { u128 } from '@polkadot/types';
import { TooltipProps } from 'recharts';
import CustomLoader from './ui/CustomLoader';

// MAIN STAKING INTERFACE COMPONENT, THIS IS WHERE STAKING HAPPENS

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
  
  // GET API STATE FROM STORE, PULLS POLKADOT API
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

  // ENABLE EXTENSION AND FETCH ACCOUNTS, LOADS WALLET ACCOUNTS
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

  // FETCH VALIDATORS, LOADS VALIDATOR DATA FROM API
  useEffect(() => {
    const fetchValidators = async () => {
      if (!api || apiState.status !== 'connected') return;
      try {
        console.log('👥 Fetching validators for staking...');
        // Fetch active validators
        const activeValidatorIds = await api.query.session.validators();
        const validatorsList: Validator[] = [];
        
        for (const validatorId of activeValidatorIds) {
          const account = validatorId.toString();
          const validatorPrefs = await api.query.staking.validators(account);
          const commission = (validatorPrefs.toHuman() as { commission: string })?.commission;

          // Get validator's total stake and nominators
          const totalStake = await api.query.staking.ledger(account);
          const nominators = await api.query.staking.nominators.entries();
          
          validatorsList.push({
            accountId: account,
            commission: parseFloat(commission?.replace('%', '')) || 0,
            totalStake: (totalStake as unknown as u128).toString(),
            ownStake: (totalStake as unknown as u128).toString(),
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

  // FETCH USER STAKING DATA, LOADS USER'S STAKING INFO
  useEffect(() => {
    const fetchUserStaking = async () => {
      if (!api || apiState.status !== 'connected' || !selectedAccount) return;
      try {
        console.log('💰 Fetching user staking data...');
        // Fetch user's ledger
        const ledger = await api.query.staking.ledger(selectedAccount.address);
        if ((ledger as unknown as u128).toHuman()) {
          const ledgerData = (ledger as unknown as u128).toHuman();
          setUserStaking(prev => ({
            ...prev,
            totalStaked: ledgerData.total || '0',
            delegations: (ledgerData.nominators as unknown as u128)?.targets.map((nom: { toString: () => string; }) => ({
              validator: nom.toString(),
              amount: '0',
              rewards: '0'
            })) || []
          }));
        }

        // Fetch balance
        const { data: { free }}: u128 = await api.query.system.account(selectedAccount.address);
        setBalance(free.toString());
        console.log(' User staking data fetched');
      } catch (e: any) {
        console.error(' Error fetching user staking data:', e);
      }
    };
    fetchUserStaking();
  }, [api, apiState.status, selectedAccount]);

  // HANDLE DELEGATION, STAKES TOKENS TO VALIDATOR
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

  // HANDLE REDELEGATION, MOVES STAKE TO ANOTHER VALIDATOR
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

  // HANDLE UNDELEGATION, UNSTAKES TOKENS
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

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
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
            <div className="flex justify-center mb-4"><CustomLoader /></div>
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sky-400/20 text-sky-400"><FaShieldAlt className="w-6 h-6" /></span>
              Staking Interface
            </h1>
            <p className="text-muted-foreground">Manage your XOR staking and delegations</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs bg-green-500 text-black">
              {apiState.status === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
            {selectedAccount && (
              <Badge className="bg-orange-300 text-primary-foreground">
                {selectedAccount.meta.name || 'Wallet'}
              </Badge>
            )}
          </div>
        </div>

        {/* Account Selection */}
        <AccountSelector
          accounts={accounts}
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          balance={balance}
        />

        {/* Staking Overview */}
        <StakingOverview userStaking={userStaking} />

        {/* Staking Actions */}
        <StakingActions
          validators={validators}
          selectedValidator={selectedValidator}
          setSelectedValidator={setSelectedValidator}
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          redelegateAmount={redelegateAmount}
          setRedelegateAmount={setRedelegateAmount}
          undelegateAmount={undelegateAmount}
          setUndelegateAmount={setUndelegateAmount}
          loading={loading}
          handleStake={handleStake}
          handleRedelegate={handleRedelegate}
          handleUndelegate={handleUndelegate}
          userStaking={userStaking}
          handleClaimRewards={handleClaimRewards}
        />

        {/* Delegation Distribution Chart */}
        {userStaking.delegations.length > 0 && (
          <DelegationDistributionChart
            stakingDistribution={stakingDistribution}
            CustomTooltip={CustomTooltip}
          />
        )}
      </div>
    </div>
  );
};

export default StakingInterface;