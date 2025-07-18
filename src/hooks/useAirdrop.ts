import { useEffect, useState, useRef } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3AccountsSubscribe } from '@polkadot/extension-dapp';
import { AirdropManager } from '../lib/AirdropManager';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export function useAirdrop() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [airdropManager, setAirdropManager] = useState<AirdropManager | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  // Effect for initialization and connection
  useEffect(() => {
    mounted.current = true;
    
    const initializeConnection = async () => {
      try {
        setConnectionStatus('connecting');
        setError(null);

        const extensions = await web3Enable('Airdrop DApp');
        if (extensions.length === 0) {
          throw new Error('No wallet extension found. Please install Polkadot.js extension.');
        }

        const wsProvider = new WsProvider('wss://ws-proxy-latest-jds3.onrender.com');
        wsProvider.on('connected', () => console.log('WebSocket connected'));
        wsProvider.on('disconnected', () => {
          if (mounted.current) setConnectionStatus('disconnected');
        });
        wsProvider.on('error', (err) => {
          console.error('WebSocket error:', err);
          if (mounted.current) setError('WebSocket connection error');
        });

        const apiInstance = await ApiPromise.create({ provider: wsProvider });
        await apiInstance.isReady;
        
        if (!mounted.current) {
          apiInstance.disconnect();
          return;
        }

        console.log('API is ready');
        setApi(apiInstance);
        setConnectionStatus('connected');
        
        const accounts = await web3Accounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setAirdropManager(new AirdropManager(apiInstance, accounts[0]));
        } else {
          setError('No accounts found. Please create an account in your wallet.');
        }
      } catch (err) {
        console.error('Initialization error:', err);
        if (mounted.current) {
          setError(err.message || 'Failed to initialize connection');
          setConnectionStatus('error');
        }
      }
    };

    initializeConnection();

    return () => {
      mounted.current = false;
      api?.disconnect();
    };
  }, []); // Runs only once on mount

  // Effect to handle account changes
  useEffect(() => {
    if (!api || connectionStatus !== 'connected') return;

    const subscribeToAccounts = async () => {
      const unsubscribe = await web3AccountsSubscribe((injectedAccounts) => {
        if (!mounted.current) return;
        
        console.log('Accounts changed:', injectedAccounts);
        const currentAccount = injectedAccounts.length > 0 ? injectedAccounts[0] : null;
        
        setAccount((prevAccount) => {
          if (prevAccount?.address !== currentAccount?.address) {
            setAirdropManager(currentAccount ? new AirdropManager(api, currentAccount) : null);
            return currentAccount;
          }
          return prevAccount;
        });
        
        if (injectedAccounts.length === 0) {
            setError('No accounts found. Please select an account in your wallet.');
        } else {
            setError(null);
        }
      });
      return unsubscribe;
    };
    
    const unsubPromise = subscribeToAccounts();
    
    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, [api, connectionStatus]);

  return { 
    api, 
    account, 
    airdropManager, 
    connectionStatus, 
    error,
    isConnected: connectionStatus === 'connected' && !!api && !!account
  };
}