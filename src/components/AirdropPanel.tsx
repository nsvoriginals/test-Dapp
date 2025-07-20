import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { FiDroplet, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiInfo, FiZap } from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';

// Define types for the AirdropManager class
interface AirdropManagerProps {
  api: ApiPromise;
  account: any;
}

// AirdropManager class embedded in the component
class AirdropManager {
  private api: ApiPromise;
  private account: any;

  constructor(api: ApiPromise, account: any) {
    this.api = api;
    this.account = account;
  }

  async getAirdropStats() {
    try {
      if (!this.api.isConnected) {
        throw new Error('API is not connected');
      }

      const [totalAirdrops, airdropsThisBlock, airdropAmount, maxPerBlock, cooldownPeriod] = await Promise.all([
        this.api.query.airdrop.totalAirdrops(),
        this.api.query.airdrop.airdropsThisBlock(),
        this.api.consts.airdrop.airdropAmount,
        this.api.consts.airdrop.maxAirdropsPerBlock,
        this.api.consts.airdrop.cooldownPeriod
      ]);
      
      return {
        totalAirdrops: totalAirdrops.toString(),
        airdropsThisBlock: airdropsThisBlock.toString(),
        airdropAmount: airdropAmount.toString(),
        maxPerBlock: maxPerBlock.toString(),
        cooldownPeriod: cooldownPeriod.toString()
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  async claimAirdrop(): Promise<void> {
    try {
      if (!this.api.isConnected) {
        throw new Error('API is not connected');
      }

      // Update metadata before transaction
      await this.api.rpc.state.getMetadata();
      
      const injector = await web3FromAddress(this.account.address);
      
      return new Promise<void>((resolve, reject) => {
        this.api.tx.airdrop
          .claimAirdrop()
          .signAndSend(this.account.address, { 
            signer: injector.signer,
            nonce: -1 // Let the system determine the nonce
          }, (result) => {
            console.log('Transaction status:', result.status.type);
            
            if (result.status.isInBlock) {
              console.log('Transaction in block:', result.status.asInBlock.toHex());
              
              let claimSuccess = false;
              let transactionFailed = false;
              
              result.events.forEach(({ event }) => {
                console.log(`Event: ${event.section}.${event.method}`, event.data.toHuman());
                
                if (event.section === 'airdrop' && event.method === 'AirdropClaimed') {
                  console.log('Airdrop claimed successfully!');
                  claimSuccess = true;
                } else if (event.section === 'system' && event.method === 'ExtrinsicFailed') {
                  console.error('Transaction failed:', event.data.toHuman());
                  transactionFailed = true;
                }
              });
              
              if (transactionFailed) {
                reject(new Error('Transaction failed'));
              } else if (claimSuccess) {
                resolve();
              } else if (!transactionFailed) {
                resolve();
              }
              
            } else if (result.status.isFinalized) {
              console.log('Transaction finalized');
              if (!result.events.some(({ event }) => event.section === 'system' && event.method === 'ExtrinsicFailed')) {
                resolve();
              }
            } else if (result.isError) {
              reject(new Error('Transaction failed'));
            }
          })
          .catch(reject);
      });
    } catch (error) {
      console.error('Error claiming airdrop:', error);
      throw error;
    }
  }

  subscribeToEvents(callback: (event: any) => void): Promise<() => void> {
    return new Promise((resolve, reject) => {
      try {
        // Subscribe to system events - this doesn't return an unsubscribe function
        // but we can track the subscription and clean it up when needed
        this.api.query.system.events((events) => {
          events.forEach((record) => {
            const { event } = record;
            if (event.section === 'airdrop') {
              callback({
                method: event.method,
                data: event.data.toHuman(),
                timestamp: new Date().toLocaleTimeString()
              });
            }
          });
        });
        
        // Return a no-op cleanup function since system.events doesn't provide unsubscribe
        resolve(() => {
          console.log('System events subscription cleanup - will be handled by API disconnect');
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  isConnected(): boolean {
    return this.api.isConnected;
  }

  async reconnect(): Promise<void> {
    try {
      if (!this.api.isConnected) {
        await this.api.connect();
      }
    } catch (error) {
      console.error('Failed to reconnect:', error);
      throw error;
    }
  }
}

const AirdropPanel = () => {
  const [state, setState] = useState({
    api: null as ApiPromise | null,
    accounts: [] as any[],
    selectedAccount: null as any,
    airdropManager: null as AirdropManager | null,
    stats: null as any,
    events: [] as any[],
    isLoading: false,
    isConnecting: false,
    isClaiming: false,
    error: null as string | null,
    success: null as string | null,
    connectionStatus: 'disconnected' as 'disconnected' | 'connecting' | 'connected' | 'error'
  });

  const eventUnsubscribeRef = useRef<(() => void) | null>(null);
  const wsUrl = 'wss://ws-proxy-latest-jds3.onrender.com';
  const fallbackWsUrl = 'wss://rpc.polkadot.io'; // Fallback endpoint

  // Initialize API and wallet connection
  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null, connectionStatus: 'connecting' }));

      // Enable wallet extension
      const extensions = await web3Enable('Airdrop DApp');
      if (extensions.length === 0) {
        throw new Error('No wallet extension found. Please install Polkadot.js extension.');
      }

      let api: ApiPromise;
      let connectionError: string | null = null;

      // Try primary endpoint first
      try {
        console.log('Attempting to connect to primary endpoint:', wsUrl);
        const wsProvider = new WsProvider(wsUrl, 10000); // 10 second timeout
        api = await ApiPromise.create({ 
          provider: wsProvider,
          throwOnConnect: false,
          throwOnUnknown: false
        });
        
        // Wait for connection with timeout
        await Promise.race([
          api.isReady,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 15000))
        ]);
        
        console.log('Successfully connected to primary endpoint');
      } catch (primaryError) {
        connectionError = `Primary endpoint failed: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}`;
        console.warn(connectionError);
        
        // Try fallback endpoint
        try {
          console.log('Attempting to connect to fallback endpoint:', fallbackWsUrl);
          const fallbackProvider = new WsProvider(fallbackWsUrl, 10000);
          api = await ApiPromise.create({ 
            provider: fallbackProvider,
            throwOnConnect: false,
            throwOnUnknown: false
          });
          
          await Promise.race([
            api.isReady,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 15000))
          ]);
          
          console.log('Successfully connected to fallback endpoint');
        } catch (fallbackError) {
          throw new Error(`Both endpoints failed. Primary: ${connectionError}. Fallback: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
        }
      }

      // Verify connection is working
      if (!api.isConnected) {
        throw new Error('API connection failed - not connected after initialization');
      }

      // Force metadata update with retry
      console.log('API connected, updating metadata...');
      let metadataUpdated = false;
      for (let i = 0; i < 3; i++) {
        try {
          await api.rpc.state.getMetadata();
          metadataUpdated = true;
          break;
        } catch (metadataError) {
          console.warn(`Metadata update attempt ${i + 1} failed:`, metadataError);
          if (i === 2) throw new Error('Failed to update metadata after 3 attempts');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!metadataUpdated) {
        throw new Error('Failed to update network metadata');
      }

      // Wait a bit more for full initialization
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get accounts
      const accounts = await web3Accounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found in wallet. Please create an account first.');
      }

      setState(prev => ({
        ...prev,
        api,
        accounts,
        selectedAccount: accounts[0],
        isConnecting: false,
        connectionStatus: 'connected',
        success: 'Successfully connected to blockchain!'
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      console.error('Connection failed:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, []);

  // Select an account
  const selectAccount = useCallback((account: any) => {
    setState(prev => ({ ...prev, selectedAccount: account }));
  }, []);

  // Create airdrop manager when API and account are ready
  useEffect(() => {
    if (state.api && state.selectedAccount) {
      const manager = new AirdropManager(state.api, state.selectedAccount);
      setState(prev => ({ ...prev, airdropManager: manager }));
    }
  }, [state.api, state.selectedAccount]);

  // Subscribe to events when airdrop manager is ready
  useEffect(() => {
    if (state.airdropManager) {
      const subscribeToEvents = async () => {
        try {
          const unsubscribe = await state.airdropManager.subscribeToEvents((event) => {
            setState(prev => ({
              ...prev,
              events: [event, ...prev.events.slice(0, 9)]
            }));
          });
          eventUnsubscribeRef.current = unsubscribe;
        } catch (error) {
          console.error('Failed to subscribe to events:', error);
        }
      };

      subscribeToEvents();

      return () => {
        if (eventUnsubscribeRef.current) {
          eventUnsubscribeRef.current();
          eventUnsubscribeRef.current = null;
        }
      };
    }
  }, [state.airdropManager]);

  // Refresh airdrop statistics
  const refreshStats = useCallback(async () => {
    if (!state.airdropManager) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const stats = await state.airdropManager.getAirdropStats();
      setState(prev => ({ ...prev, stats, isLoading: false }));
      
      if (stats) {
        setState(prev => ({ ...prev, success: 'Stats refreshed successfully!' }));
        setTimeout(() => {
          setState(prev => ({ ...prev, success: null }));
        }, 2000);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get stats'
      }));
    }
  }, [state.airdropManager]);

  // Claim airdrop without eligibility check
  const claimAirdrop = useCallback(async () => {
    if (!state.airdropManager) {
      setState(prev => ({ ...prev, error: 'Airdrop manager not initialized' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isClaiming: true, error: null }));
      
      // Force metadata refresh before claiming
      console.log('Refreshing metadata before claim...');
      await state.api!.rpc.state.getMetadata();
      
      await state.airdropManager.claimAirdrop();
      
      setState(prev => ({ 
        ...prev, 
        isClaiming: false,
        success: 'Airdrop claimed successfully! 🎉'
      }));
      
      // Refresh stats after claiming
      setTimeout(() => {
        refreshStats();
      }, 1000);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 5000);
      
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Failed to claim airdrop';
      
      // Handle metadata specific errors
      if (errorMessage.includes('metadata') || errorMessage.includes('out of date')) {
        errorMessage = 'Network metadata is outdated. Please refresh the page and try again, or update your Polkadot.js extension.';
      }
      
      setState(prev => ({
        ...prev,
        isClaiming: false,
        error: errorMessage
      }));
    }
  }, [state.airdropManager, state.api, refreshStats]);

  // Update metadata manually
  const updateMetadata = useCallback(async () => {
    if (!state.api) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('Updating network metadata...');
      
      // Check if API is still connected
      if (!state.api.isConnected) {
        throw new Error('API is not connected. Please reconnect.');
      }
      
      await state.api.rpc.state.getMetadata();
      
      // Wait for the update to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        success: 'Network metadata updated successfully!' 
      }));
      
      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 3000);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to update metadata: ' + (error instanceof Error ? error.message : 'Unknown error')
      }));
    }
  }, [state.api]);

  // Reconnect function
  const reconnect = useCallback(async () => {
    if (state.api) {
      try {
        await state.api.disconnect();
      } catch (error) {
        console.warn('Error disconnecting:', error);
      }
    }
    
    // Clear current state
    setState(prev => ({
      ...prev,
      api: null,
      airdropManager: null,
      stats: null,
      events: [],
      connectionStatus: 'disconnected'
    }));
    
    // Attempt to reconnect
    await connect();
  }, [state.api, connect]);

  // Clear error message
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearSuccess = useCallback(() => {
    setState(prev => ({ ...prev, success: null }));
  }, []);

  // Auto-refresh stats when manager is ready
  useEffect(() => {
    if (state.airdropManager) {
      refreshStats();
    }
  }, [state.airdropManager, refreshStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventUnsubscribeRef.current) {
        eventUnsubscribeRef.current();
      }
      if (state.api) {
        state.api.disconnect();
      }
    };
  }, []);

  // Format large numbers
  const formatNumber = (num: string | number) => {
    if (!num) return '0';
    const n = parseFloat(num.toString());
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return n.toLocaleString();
  };

  // Format token amount with decimals
  const formatTokens = (amount: string | number) => {
    if (!amount) return '0';
    const tokens = parseFloat(amount.toString()) / Math.pow(10, 18); // Assuming 18 decimals
    return tokens.toFixed(4);
  };

  return (
    <div className="min-h-screen bg-background rounded-xl p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FiDroplet className="text-cyan-400 w-12 h-12 mr-3" />
            <h1 className="text-4xl font-bold text-white">Airdrop Panel</h1>
          </div>
          <p className="text-gray-400">Claim your tokens instantly - No eligibility checks required!</p>
        </div>

        {/* Glassmorphic Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {/* Balance Card */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl p-6 flex flex-col items-center transition-transform hover:scale-105">
            <MdAccountBalanceWallet className="w-8 h-8 text-cyan-400 mb-2" />
            <div className="text-lg font-semibold text-white mb-1">Your Balance</div>
            <div className="text-2xl font-bold text-cyan-200">{state.selectedAccount ? formatNumber(state.selectedAccount.meta.balance) : '--'} XOR</div>
            <div className="text-xs text-gray-400 mt-1">(Connect wallet to view)</div>
          </div>
          {/* Airdrop Status Card */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl p-6 flex flex-col items-center transition-transform hover:scale-105">
            <FiDroplet className="w-8 h-8 text-cyan-400 mb-2" />
            <div className="text-lg font-semibold text-white mb-1">Airdrop Status</div>
            <div className="text-2xl font-bold text-cyan-200">{state.stats ? formatNumber(state.stats.totalAirdrops) : '--'}</div>
            <div className="text-xs text-gray-400 mt-1">Total Airdrops</div>
          </div>
          {/* Network Health Card */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl p-6 flex flex-col items-center transition-transform hover:scale-105">
            <FiInfo className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-lg font-semibold text-white mb-1">Network Health</div>
            <div className={`text-2xl font-bold ${state.connectionStatus === 'connected' ? 'text-green-300' : 'text-red-400'}`}>{state.connectionStatus === 'connected' ? 'Healthy' : 'Offline'}</div>
            <div className="text-xs text-gray-400 mt-1">{state.connectionStatus === 'connected' ? 'Connected' : 'Not Connected'}</div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center space-x-4">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              state.connectionStatus === 'connected' 
                ? 'bg-green-900/50 text-green-400 border border-green-400/30' 
                : state.connectionStatus === 'connecting'
                ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-400/30'
                : state.connectionStatus === 'error'
                ? 'bg-red-900/50 text-red-400 border border-red-400/30'
                : 'bg-gray-900/50 text-gray-400 border border-gray-400/30'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                state.connectionStatus === 'connected' ? 'bg-green-400' :
                state.connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                state.connectionStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
              }`}></div>
              {state.connectionStatus === 'connected' ? 'Connected to Blockchain' :
               state.connectionStatus === 'connecting' ? 'Connecting...' :
               state.connectionStatus === 'error' ? 'Connection Error' :
               'Not Connected'}
            </div>
            
            {state.connectionStatus === 'error' && (
              <button
                onClick={reconnect}
                disabled={state.isConnecting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm"
              >
                {state.isConnecting ? 'Reconnecting...' : 'Reconnect'}
              </button>
            )}
          </div>
        </div>

        {/* Metadata Warning */}
        <div className="mb-6 p-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl">
          <div className="flex items-center">
            <FiAlertCircle className="text-yellow-400 w-5 h-5 mr-2" />
            <div>
              <div className="text-yellow-300 font-medium">Network Metadata Notice</div>
              <div className="text-yellow-200 text-sm mt-1">
                If transactions fail due to metadata issues, the app will automatically update the metadata. 
                Please ensure your Polkadot.js extension is up to date.
              </div>
            </div>
          </div>
        </div>
        {/* Success Message */}
        {state.success && (
          <div className="mb-6 p-4 bg-green-200/20 backdrop-blur-xl border border-green-200/30 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiCheckCircle className="text-green-400 w-5 h-5 mr-2" />
                <span className="text-green-300">{state.success}</span>
              </div>
              <button onClick={clearSuccess} className="text-green-400 hover:text-green-300">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-200/20 backdrop-blur-xl border border-red-200/30 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-400 w-5 h-5 mr-2" />
                <span className="text-red-300">{state.error}</span>
              </div>
              <button onClick={clearError} className="text-red-400 hover:text-red-300">
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Connection Panel */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <MdAccountBalanceWallet />
              Wallet Connection
            </h2>

            {!state.api ? (
              <button
                onClick={connect}
                disabled={state.isConnecting}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {state.isConnecting ? (
                  <div className="flex items-center justify-center">
                    <FiRefreshCw className="animate-spin w-5 h-5 mr-2" />
                    Connecting...
                  </div>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="text-green-400 text-sm flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-1" />
                  Connected
                </div>
                
                {state.accounts.length > 0 && (
                  <div>
                    <label className="block text-sm text-blue-200 mb-2">Select Account:</label>
                    <select
                      value={state.selectedAccount?.address || ''}
                      onChange={(e) => {
                        const account = state.accounts.find(acc => acc.address === e.target.value);
                        selectAccount(account);
                      }}
                      className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white backdrop-blur-md"
                    >
                      {state.accounts.map((account) => (
                        <option key={account.address} value={account.address} className="bg-gray-800">
                          {account.meta.name} ({account.address.slice(0, 8)}...)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats Panel */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FiInfo />
                Airdrop Stats
              </h2>
              <button
                onClick={refreshStats}
                disabled={state.isLoading}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors mr-2 shadow"
              >
                <FiRefreshCw className={`w-4 h-4 text-white ${state.isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={updateMetadata}
                disabled={state.isLoading}
                className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors text-xs shadow"
                title="Update Network Metadata"
              >
                Fetch
              </button>
            </div>

            {state.stats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                  <span className="text-blue-200">Total Airdrops:</span>
                  <span className="text-white font-medium">{formatNumber(state.stats.totalAirdrops)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                  <span className="text-blue-200">This Block:</span>
                  <span className="text-white font-medium">{state.stats.airdropsThisBlock}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                  <span className="text-blue-200">Airdrop Amount:</span>
                  <span className="text-white font-medium">{formatTokens(state.stats.airdropAmount)} XOR</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                  <span className="text-blue-200">Max Per Block:</span>
                  <span className="text-white font-medium">{state.stats.maxPerBlock}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-blue-200">
                {state.api ? 'Click refresh to load stats' : 'Connect wallet to view stats'}
              </div>
            )}
          </div>

          {/* Claim Panel */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FiZap />
              Instant Claim
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-xl border border-green-200/20 backdrop-blur-md">
                <div className="text-green-400 font-medium mb-1">✓ No Eligibility Check</div>
                <div className="text-sm text-green-200">Click claim to receive your airdrop instantly!</div>
              </div>

              <button
                onClick={claimAirdrop}
                disabled={!state.airdropManager || state.isClaiming}
                className="w-full py-4 px-4 bg-gradient-to-r from-green-500/80 to-emerald-500/80 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                {state.isClaiming ? (
                  <div className="flex items-center justify-center">
                    <FiRefreshCw className="animate-spin w-5 h-5 mr-2" />
                    Claiming Airdrop...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FiDroplet className="w-5 h-5 mr-2" />
                    Claim Airdrop Now!
                  </div>
                )}
              </button>

              {!state.airdropManager && (
                <div className="text-center text-sm text-yellow-300 bg-yellow-200/20 p-3 rounded-lg backdrop-blur-md">
                  Connect your wallet to start claiming
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Events */}
        {state.events.length > 0 && (
          <div className="mt-6 bg-white/20 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Airdrop Events</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {state.events.map((event, index) => (
                <div key={index} className="p-3 bg-white/10 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-400 font-medium">{event.method}</span>
                    <span className="text-blue-200 text-sm">{event.timestamp}</span>
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {JSON.stringify(event.data)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirdropPanel;