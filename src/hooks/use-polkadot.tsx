import { ApiPromise, WsProvider } from '@polkadot/api';
import { useState, useEffect, useCallback } from 'react';

const usePolkadot = () => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new WsProvider('wss://rpc.polkadot.io'); // You can change this to a local node or another public node
      const polkadotApi = await ApiPromise.create({ provider });

      setApi(polkadotApi);
      setIsConnected(true);

      polkadotApi.on('disconnected', () => {
        setIsConnected(false);
        setError("Disconnected from network");
      });

      polkadotApi.on('connected', () => {
        setIsConnected(true);
        setError(null);
      });

      polkadotApi.on('error', (err) => {
        setError(err.message);
        setIsConnected(false);
      });

    } catch (err: any) {
      console.error("Polkadot API connection error:", err);
      setError(err.message || "Failed to connect to Polkadot API");
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      api?.disconnect();
    };
  }, [connect]);

  return { api, isConnected, loading, error, connect };
};

export default usePolkadot; 