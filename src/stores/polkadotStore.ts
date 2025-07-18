import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Metadata } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types/create';
import { precompiledMetadata } from '../metadata';

export interface ApiState {
  api: ApiPromise | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'degraded' | 'error';
  lastError: string | null;
  latency: number | null;
  connectionAttempts: number;
  lastSuccessfulConnection: number | null;
  endpoint: string | null;
  lastConnected: Date | null;
}

export interface NetworkMetrics {
  validatorsOnline: number;
  totalValidators: number;
  stakingAPR: number;
  avgBlockTime: number;
  totalTransactions: number;
  totalValueLocked: string;
  networkHealth: number;
  activeAddresses: number;
  lastUpdated: number;
}

export interface Transaction {
  hash: string;
  blockNumber: number;
  blockHash: string;
  index: number;
  method: string;
  section: string;
  signer: string;
  timestamp: Date | null;
  success: boolean;
  fee: string;
  args: string[];
}

export interface Block {
  height: number;
  hash: string;
  timestamp: Date | null;
  txCount: number;
  proposer: string;
  size: string;
}

export interface TransactionData {
  transactions: Transaction[];
  blocks: Block[];
  lastUpdated: number;
}

export interface TransactionDetails {
  hash: string;
  blockNumber: number;
  blockHash: string;
  index: number;
  method: string;
  section: string;
  signer: string;
  timestamp: Date | null;
  success: boolean;
  fee: string;
  args: string[];
  events: any[];
  error: string | null;
  nonce: number;
  tip: string;
  era: number;
  signature: string;
  isDecoded: boolean;
  decodedArgs: any[];
}

export interface ValidatorInfo {
  address: string;
  commission: number;
  selfBonded: string;
  nominators: number;
  totalStake: string;
  status: string;
}

interface PolkadotStore {
  // API State
  apiState: ApiState;
  api: ApiPromise | null;
  
  // Network Data
  networkMetrics: NetworkMetrics;
  chartData: any[];
  stakingData: any[];
  
  // Transaction Data
  transactionData: TransactionData;
  isTransactionLoading: boolean;
  isTransactionFetching: boolean;
  
  // Transaction Details
  transactionDetails: TransactionDetails | null;
  isDetailsLoading: boolean;
  detailsError: string | null;
  
  // Loading States
  isLoading: boolean;
  isFetching: boolean;
  
  // Cache
  lastFetchTime: number;
  cacheTTL: number;
  
  // Actions
  setApiState: (state: Partial<ApiState>) => void;
  setApi: (api: ApiPromise | null) => void;
  setNetworkMetrics: (metrics: Partial<NetworkMetrics>) => void;
  setChartData: (data: any[]) => void;
  setStakingData: (data: any[]) => void;
  setTransactionData: (data: Partial<TransactionData>) => void;
  setTransactionLoading: (loading: boolean) => void;
  setTransactionFetching: (fetching: boolean) => void;
  setTransactionDetails: (details: TransactionDetails | null) => void;
  setDetailsLoading: (loading: boolean) => void;
  setDetailsError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setFetching: (fetching: boolean) => void;
  
  // API Management
  connect: (endpoint?: string) => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  
  // Data Fetching
  fetchNetworkData: () => Promise<void>;
  fetchTransactionData: () => Promise<void>;
  fetchTransactionDetails: (hash: string) => Promise<void>;
  refreshData: () => Promise<void>;
  refreshTransactionData: () => Promise<void>;
  
  // Caching
  cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  getCached: (key: string) => any | null;
  setCached: (key: string, data: any, ttl?: number) => void;
  clearCache: () => void;
  
  // Network Data (cached)
  networkData: any | null;
  setNetworkData: (data: any) => void;
  clearNetworkData: () => void;

  // Validators
  validators: ValidatorInfo[];
  fetchValidators: () => Promise<void>;
}

// Fixed endpoints with fallbacks
const ENDPOINTS = [
  "wss://ws-proxy-latest-jds3.onrender.com"
];

const DEFAULT_METRICS: NetworkMetrics = {
  validatorsOnline: 0,
  totalValidators: 0,
  stakingAPR: 0,
  avgBlockTime: 0,
  totalTransactions: 0,
  totalValueLocked: '0',
  networkHealth: 0,
  activeAddresses: 0,
  lastUpdated: 0
};

const CACHE_TTL = 30000; // 30 seconds
const CONNECTION_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 30000; // 30 seconds
const HEALTH_CHECK_INTERVAL = 15000; // 15 seconds
const MAX_LATENCY = 1000; // 1 second

// Global connection state
let currentProvider: WsProvider | null = null;
let currentApi: ApiPromise | null = null;
let healthCheckInterval: NodeJS.Timeout | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let currentEndpointIndex = 0;
let retryDelay = INITIAL_RETRY_DELAY;
let eventListeners: { [key: string]: (...args: any[]) => void } = {};

export const usePolkadotStore = create<PolkadotStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    apiState: {
      api: null,
      status: 'disconnected',
      lastError: null,
      latency: null,
      connectionAttempts: 0,
      lastSuccessfulConnection: null,
      endpoint: null,
      lastConnected: null
    },
    api: null,
    networkMetrics: DEFAULT_METRICS,
    chartData: [],
    stakingData: [],
    transactionData: {
      transactions: [],
      blocks: [],
      lastUpdated: 0
    },
    isTransactionLoading: true,
    isTransactionFetching: false,
    transactionDetails: null,
    isDetailsLoading: true,
    detailsError: null,
    isLoading: true,
    isFetching: false,
    lastFetchTime: 0,
    cacheTTL: CACHE_TTL,
    cache: new Map(),
    networkData: null,
    validators: [],

    // State Setters
    setApiState: (updates) => set((state) => ({
      apiState: { ...state.apiState, ...updates }
    })),

    setApi: (api) => set({ api }),

    setNetworkMetrics: (updates) => set((state) => ({
      networkMetrics: { ...state.networkMetrics, ...updates, lastUpdated: Date.now() }
    })),

    setChartData: (data) => set({ chartData: data }),
    setStakingData: (data) => set({ stakingData: data }),
    setTransactionData: (updates) => set((state) => ({
      transactionData: { ...state.transactionData, ...updates, lastUpdated: Date.now() }
    })),
    setTransactionLoading: (loading) => set({ isTransactionLoading: loading }),
    setTransactionFetching: (fetching) => set({ isTransactionFetching: fetching }),
    setTransactionDetails: (details) => set({ transactionDetails: details }),
    setDetailsLoading: (loading) => set({ isDetailsLoading: loading }),
    setDetailsError: (error) => set({ detailsError: error }),
    setLoading: (loading) => set({ isLoading: loading }),
    setFetching: (fetching) => set({ isFetching: fetching }),

    // Fixed API Management with proper cleanup and reconnection
    connect: async (endpoint?: string) => {
      const { setApiState, setApi, setLoading } = get();
      
      if (get().apiState.status === 'connecting') return;
      
      setLoading(true);
      setApiState({ 
        status: 'connecting', 
        connectionAttempts: get().apiState.connectionAttempts + 1 
      });

      // Clean up previous connections
      await cleanupConnection();

      const endpointsToTry = endpoint ? [endpoint] : ENDPOINTS;
      const startIndex = endpoint ? 0 : currentEndpointIndex;
      
      for (let i = 0; i < endpointsToTry.length; i++) {
        const endpointIndex = (startIndex + i) % endpointsToTry.length;
        const targetEndpoint = endpointsToTry[endpointIndex];
        
        try {
          console.log(`🔄 Attempting to connect to: ${targetEndpoint}`);
          
          // Create new provider
          const provider = new WsProvider(targetEndpoint, CONNECTION_TIMEOUT);
          currentProvider = provider;

          // Setup event listeners with proper cleanup
          setupProviderListeners(provider, targetEndpoint);

          // Create API with precompiled metadata
          const metadata: Record<string, `0x${string}`> = {
            '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3-1000': precompiledMetadata as `0x${string}`
          };

          const api = await ApiPromise.create({
            provider,
            metadata,
            throwOnConnect: false,
            noInitWarn: true,
            initWasm: false
          });

          await api.isReady;
          
          // Test connection
          await api.rpc.system.chain();
          
          currentApi = api;
          setApi(api);
          setApiState({
            status: 'connected',
            api,
            lastError: null,
            lastSuccessfulConnection: Date.now(),
            endpoint: targetEndpoint,
            lastConnected: new Date()
          });

          // Setup health monitoring
          setupHealthMonitoring();
          
          // Reset retry parameters on successful connection
          currentEndpointIndex = endpointIndex;
          retryDelay = INITIAL_RETRY_DELAY;
          
          setLoading(false);
          console.log(`✅ Successfully connected to: ${targetEndpoint}`);
          
          // Fetch initial data
          get().fetchNetworkData();
          return;
          
        } catch (error: any) {
          console.warn(`❌ Failed to connect to ${targetEndpoint}:`, error.message);
          setApiState({ lastError: error.message });
          
          // Clean up failed connection
          await cleanupConnection();
          continue;
        }
      }
      
      // All endpoints failed
      setLoading(false);
      setApiState({ status: 'error', lastError: 'All endpoints failed' });
      scheduleReconnect();
    },

    disconnect: async () => {
      await cleanupConnection();
      
      set({
        apiState: {
          api: null,
          status: 'disconnected',
          lastError: null,
          latency: null,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          endpoint: null,
          lastConnected: null
        },
        api: null
      });
    },

    reconnect: async () => {
      const { endpoint } = get().apiState;
      await get().disconnect();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await get().connect(endpoint || undefined);
    },

    // Enhanced data fetching with better error handling
    fetchNetworkData: async () => {
      const { api, apiState, setNetworkMetrics, setChartData, setStakingData, setFetching, getCached, setCached, setApiState } = get();
      
      if (!api || apiState.status !== 'connected') {
        setFetching(false);
        return;
      }
      
      setFetching(true);
      
      try {
        // Check cache first
        const cachedData = getCached('networkData');
        if (cachedData) {
          setNetworkMetrics(cachedData.metrics);
          setChartData(cachedData.chartData);
          setStakingData(cachedData.stakingData);
          setFetching(false);
          return;
        }

        // Fetch with timeout
        const dataPromise = fetchNetworkDataWithTimeout(api);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network data fetch timeout')), 30000)
        );
        
        const result = await Promise.race([dataPromise, timeoutPromise]);
        
        if (result) {
          const { metrics, chartData, stakingData } = result as any;
          setNetworkMetrics(metrics);
          setChartData(chartData);
          setStakingData(stakingData);
          
          setCached('networkData', { metrics, chartData, stakingData }, 30000);
        }
        
        setFetching(false);
        
      } catch (error: any) {
        console.error('❌ Network data fetch failed:', error);
        setApiState({ lastError: error.message });
        setFetching(false);
      }
    },

    // Enhanced transaction data fetching
    fetchTransactionData: async () => {
      const { api, apiState, setTransactionData, setTransactionLoading, setTransactionFetching, getCached, setCached } = get();
      
      if (!api || apiState.status !== 'connected') {
        setTransactionLoading(false);
        setTransactionFetching(false);
        return;
      }
      
      setTransactionLoading(true);
      setTransactionFetching(true);
      
      try {
        const cachedData = getCached('transactionData');
        if (cachedData) {
          setTransactionData(cachedData);
          setTransactionLoading(false);
          setTransactionFetching(false);
          return;
        }

        const transactionData = await fetchTransactionDataWithTimeout(api);
        
        setTransactionData(transactionData);
        setCached('transactionData', transactionData, 15000);
        
      } catch (error: any) {
        console.error('❌ Transaction data fetch failed:', error);
        setTransactionData({ transactions: [], blocks: [], lastUpdated: Date.now() });
      } finally {
        setTransactionLoading(false);
        setTransactionFetching(false);
      }
    },

    fetchTransactionDetails: async (hash: string) => {
      const { api, apiState, setTransactionDetails, setDetailsLoading, setDetailsError, getCached, setCached } = get();
      
      if (!api || apiState.status !== 'connected') {
        setDetailsError('Not connected to network');
        return;
      }
      
      setDetailsLoading(true);
      setDetailsError(null);
      
      try {
        const cacheKey = `txDetails_${hash}`;
        const cachedData = getCached(cacheKey);
        if (cachedData) {
          setTransactionDetails(cachedData);
          setDetailsLoading(false);
          return;
        }

        // Simplified implementation - in practice, you'd need proper transaction lookup
        const transactionDetails: TransactionDetails = {
          hash,
          blockNumber: 0,
          blockHash: '',
          index: 0,
          method: 'Unknown',
          section: 'Unknown',
          signer: 'Unknown',
          timestamp: new Date(),
          success: true,
          fee: '0',
          args: [],
          events: [],
          error: null,
          nonce: 0,
          tip: '0',
          era: 0,
          signature: '',
          isDecoded: false,
          decodedArgs: []
        };

        setTransactionDetails(transactionDetails);
        setCached(cacheKey, transactionDetails, 60000);
        
      } catch (error: any) {
        console.error('❌ Error fetching transaction details:', error);
        setDetailsError(error.message);
      } finally {
        setDetailsLoading(false);
      }
    },

    refreshData: async () => {
      const { clearCache, fetchNetworkData, setNetworkMetrics } = get();
      clearCache();
      setNetworkMetrics({ lastUpdated: 0 });
      await fetchNetworkData();
    },

    refreshTransactionData: async () => {
      const { clearCache, fetchTransactionData, setTransactionData } = get();
      clearCache();
      setTransactionData({ transactions: [], blocks: [], lastUpdated: 0 });
      await fetchTransactionData();
    },

    // Enhanced caching
    getCached: (key: string) => {
      const { cache } = get();
      const cached = cache.get(key);
      
      if (!cached) return null;
      
      const now = Date.now();
      if (now - cached.timestamp > cached.ttl) {
        cache.delete(key);
        return null;
      }
      
      return cached.data;
    },

    setCached: (key: string, data: any, ttl: number = CACHE_TTL) => {
      const { cache } = get();
      cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
    },

    clearCache: () => {
      set({ cache: new Map() });
    },

    setNetworkData: (data: any) => set({ networkData: data }),
    clearNetworkData: () => set({ networkData: null }),

    // Enhanced validators fetching
    fetchValidators: async () => {
      const { api, apiState } = get();
      if (!api || apiState.status !== 'connected') return;
      
      try {
        const validatorAddresses = await api.query.session.validators();
        const validatorInfos: ValidatorInfo[] = await Promise.all(
          (validatorAddresses as unknown as any[]).slice(0, 10).map(async (addressCodec: any) => {
            const address = addressCodec.toString();
            
            try {
              const [prefs, ledger] = await Promise.all([
                api.query.staking.validators(address),
                api.query.staking.ledger(address)
              ]);
              
              const commission = (prefs as any).commission.toNumber() / 1e7;
              const selfBonded = (ledger as any).isSome ? (ledger as any).unwrap().active.toString() : '0';
              
              return {
                address,
                commission,
                selfBonded,
                nominators: 0, // Simplified
                totalStake: '0', // Simplified
                status: 'active'
              };
            } catch {
              return {
                address,
                commission: 0,
                selfBonded: '0',
                nominators: 0,
                totalStake: '0',
                status: 'unknown'
              };
            }
          })
        );
        
        set({ validators: validatorInfos });
      } catch (error) {
        console.error('❌ Error fetching validators:', error);
        set({ validators: [] });
      }
    },
  }))
);

// Helper functions
async function cleanupConnection() {
  // Clear intervals
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  // Clean up event listeners
  Object.values(eventListeners).forEach(cleanup => cleanup());
  eventListeners = {};
  
  // Disconnect API
  if (currentApi) {
    try {
      await currentApi.disconnect();
    } catch (error) {
      console.warn('Error disconnecting API:', error);
    }
    currentApi = null;
  }
  
  // Disconnect provider
  if (currentProvider) {
    try {
      currentProvider.disconnect();
    } catch (error) {
      console.warn('Error disconnecting provider:', error);
    }
    currentProvider = null;
  }
}

function setupProviderListeners(provider: WsProvider, endpoint: string) {
  const { setApiState } = usePolkadotStore.getState();
  
  const onConnected = () => {
    console.log(`🔗 WebSocket connected to ${endpoint}`);
    setApiState({ status: 'connected', lastConnected: new Date() });
  };
  
  const onDisconnected = () => {
    console.log(`🔌 WebSocket disconnected from ${endpoint}`);
    setApiState({ status: 'disconnected' });
    scheduleReconnect();
  };
  
  const onError = (error: any) => {
    console.error(`❌ WebSocket error on ${endpoint}:`, error);
    setApiState({ status: 'error', lastError: error.message });
    scheduleReconnect();
  };
  
  provider.on('connected', onConnected);
  provider.on('disconnected', onDisconnected);
  provider.on('error', onError);
  
  // Store cleanup functions
  eventListeners['connected'] = () => provider.off('connected', onConnected);
  eventListeners['disconnected'] = () => provider.off('disconnected', onDisconnected);
  eventListeners['error'] = () => provider.off('error', onError);
}

function setupHealthMonitoring() {
  if (healthCheckInterval) return;
  
  healthCheckInterval = setInterval(async () => {
    const { api, apiState, setApiState } = usePolkadotStore.getState();
    
    if (!api || (apiState.status !== 'connected' && apiState.status !== 'degraded')) {
      return;
    }
    
    try {
      const start = Date.now();
      await api.rpc.system.chain();
      const latency = Date.now() - start;
      
      setApiState({ latency });
      
      if (latency > MAX_LATENCY) {
        if (apiState.status !== 'degraded') {
          setApiState({ status: 'degraded' });
        }
      } else if (latency <= MAX_LATENCY && apiState.status === 'degraded') {
        setApiState({ status: 'connected' });
      }
    } catch (error: any) {
      console.error('❌ Health check failed:', error);
      setApiState({ status: 'error', lastError: error.message });
      scheduleReconnect();
    }
  }, HEALTH_CHECK_INTERVAL);
}

function scheduleReconnect() {
  if (reconnectTimeout) return;
  
  const { connectionAttempts } = usePolkadotStore.getState().apiState;
  
  if (connectionAttempts >= MAX_RETRIES) {
    console.error('❌ Max connection attempts reached');
    return;
  }
  
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    rotateEndpoint();
    usePolkadotStore.getState().connect();
  }, retryDelay);
  
  // Exponential backoff
  retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
}

function rotateEndpoint() {
  currentEndpointIndex = (currentEndpointIndex + 1) % ENDPOINTS.length;
}

async function fetchNetworkDataWithTimeout(api: ApiPromise) {
  const [validatorsEntries, activeEraResult, lastHeaderResult] = await Promise.all([
    api.query.staking.validators.entries(),
    api.query.staking.activeEra(),
    api.rpc.chain.getHeader(),
  ]);
  
  const totalValidators = validatorsEntries.length;
  const validatorsOnline = validatorsEntries.filter(([_, prefs]) => {
    const p = prefs as any;
    return !p.blocked?.isTrue;
  }).length;
  
  const networkHealth = totalValidators > 0 ? Math.round((validatorsOnline / totalValidators) * 100) : 0;
  
  const metrics = {
    validatorsOnline,
    totalValidators,
    stakingAPR: 0, // Simplified
    avgBlockTime: 6, // Approximate
    totalTransactions: 0, // Simplified
    totalValueLocked: '0', // Simplified
    networkHealth,
    activeAddresses: Math.floor(validatorsOnline * 1.2),
    lastUpdated: Date.now()
  };
  
  return {
    metrics,
    chartData: [],
    stakingData: []
  };
}

async function fetchTransactionDataWithTimeout(api: ApiPromise) {
  const finalizedHead = await api.rpc.chain.getFinalizedHead();
  const finalizedBlock = await api.rpc.chain.getBlock(finalizedHead);
  const latestBlockNumber = finalizedBlock.block.header.number.toNumber();
  
  const blockNumbers = Array.from({ length: 5 }, (_, i) => latestBlockNumber - i);
  const blocks: Block[] = [];
  const transactions: Transaction[] = [];
  
  for (const blockNumber of blockNumbers) {
    try {
      const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
      const block = await api.rpc.chain.getBlock(blockHash);
      
      let timestamp: Date | null = null;
      const timestampExtrinsic = block.block.extrinsics.find(ext => 
        ext.method.section === 'timestamp' && ext.method.method === 'set'
      );
      if (timestampExtrinsic) {
        const timestampArg = timestampExtrinsic.method.args[0];
        timestamp = new Date(Number(timestampArg.toString()));
      }
      
      blocks.push({
        height: blockNumber,
        hash: blockHash.toHex(),
        timestamp,
        txCount: block.block.extrinsics.length,
        proposer: 'Unknown',
        size: JSON.stringify(block.block).length.toString()
      });
      
      block.block.extrinsics.slice(0, 10).forEach((extrinsic, index) => {
        transactions.push({
          hash: extrinsic.hash.toHex(),
          blockNumber,
          blockHash: blockHash.toHex(),
          index,
          method: extrinsic.method.method,
          section: extrinsic.method.section,
          signer: extrinsic.signer?.toString() || 'System',
          timestamp,
          success: true,
          fee: '0',
          args: extrinsic.method.args.map(arg => arg.toString().slice(0, 20))
        });
      });
    } catch (error) {
      console.warn(`Failed to fetch block ${blockNumber}:`, error);
    }
  }
  
  return {
    transactions: transactions.slice(0, 50),
    blocks,
    lastUpdated: Date.now()
  };
}

// Auto-connect on store initialization
if (typeof window !== 'undefined') {
  setTimeout(() => {
    usePolkadotStore.getState().connect();
  }, 1000);
}

// Auto-refresh data
if (typeof window !== 'undefined') {
  setInterval(() => {
    const { apiState, fetchNetworkData } = usePolkadotStore.getState();
    if (apiState.status === 'connected') {
      fetchNetworkData().catch(console.warn);
    }
  }, 30000);
}