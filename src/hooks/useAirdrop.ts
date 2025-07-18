import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { AirdropManager } from '../lib/AirdropManager';

export function useAirdrop() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [account, setAccount] = useState<any>(null);
  const [airdropManager, setAirdropManager] = useState<AirdropManager | null>(null);

  useEffect(() => {
    (async () => {
      await web3Enable('Airdrop DApp');
      const wsProvider = new WsProvider('wss://ws-proxy-latest-jds3.onrender.com');
      const api = await ApiPromise.create({ provider: wsProvider });
      setApi(api);

      const accounts = await web3Accounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setAirdropManager(new AirdropManager(api, accounts[0]));
      }
    })();

    return () => {
      if (api) api.disconnect();
    };
  }, []);

  return { api, account, airdropManager };
}