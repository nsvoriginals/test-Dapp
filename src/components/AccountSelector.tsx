import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FaWallet } from 'react-icons/fa';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { formatBalance } from '@polkadot/util';

interface AccountSelectorProps {
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  setSelectedAccount: (account: InjectedAccountWithMeta | null) => void;
  balance: string;
}

const AccountSelector = ({ accounts, selectedAccount, setSelectedAccount, balance }: AccountSelectorProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center text-white space-x-2">
        <FaWallet className="w-5 h-5 " />
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
              <div className="text-sm text-white font-mono bg-zinc-700 p-2 rounded">
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
);

export default AccountSelector; 