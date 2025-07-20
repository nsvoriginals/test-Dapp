import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import BN from 'bn.js';
import { formatBalance } from '@polkadot/util';

interface AirdropRecord {
  claims_count: number;
  last_claim_block: number;
  total_received: string;
}

interface AirdropStats {
  totalAirdrops: string;
  airdropsThisBlock: string;
  lastResetBlock: string;
  airdropAmount: string;
  minimumBalanceThreshold: string;
  maxAirdropsPerBlock: string;
  cooldownPeriod: string;
  maxAirdropsPerAccount: string;
  poolBalance: string;
}

interface Eligibility {
  eligible: boolean;
  claimed: boolean;
  reason?: string;
  cooldownRemaining?: number;
  claimsCount?: number;
}

export class AirdropManager {
  public api: ApiPromise;
  public account: InjectedAccountWithMeta;

  constructor(api: ApiPromise, account: InjectedAccountWithMeta) {
    this.api = api;
    this.account = account;
    console.log('AirdropManager initialized for Xorion runtime');
  }

  /**
   * Get airdrop pool balance by calculating sovereign account
   */
  private async getAirdropPoolBalance(): Promise<string> {
    try {
      // Get PalletId from constants
      const palletId = this.api.consts.airdrop.palletId;
      
      if (!palletId) {
        console.warn('PalletId not found in airdrop pallet constants');
        return '0';
      }

      // Calculate sovereign account like Substrate does: T::PalletId::get().into_account_truncating()
      const palletIdBytes = palletId.toU8a();
      const accountBytes = new Uint8Array(32);
      accountBytes.set(palletIdBytes.slice(0, Math.min(32, palletIdBytes.length)), 0);
      
      const sovereignAccount = this.api.createType('AccountId', accountBytes);
      console.log('Airdrop pool sovereign account:', sovereignAccount.toString());

      // Get balance from the sovereign account
      const { data: { free } } = await this.api.query.system.account(sovereignAccount);
      console.log('Pool balance:', free.toString());
      
      return free.toString();
    } catch (error) {
      console.error('Error getting pool balance:', error);
      return '0';
    }
  }

  /**
   * Get comprehensive airdrop statistics from Xorion runtime
   */
  public async getAirdropStats(): Promise<AirdropStats> {
    try {
      console.log('Fetching airdrop stats from Xorion runtime...');
      await this.api.isReady;

      if (!this.api.query.airdrop || !this.api.consts.airdrop) {
        throw new Error('Airdrop pallet not found in Xorion runtime');
      }

      // Get all storage values
      const [totalAirdrops, airdropsThisBlock, lastResetBlock, poolBalance] = await Promise.all([
        this.api.query.airdrop.totalAirdrops(),
        this.api.query.airdrop.airdropsThisBlock(),
        this.api.query.airdrop.lastResetBlock(),
        this.getAirdropPoolBalance()
      ]);

      const stats: AirdropStats = {
        totalAirdrops: totalAirdrops.toString(),
        airdropsThisBlock: airdropsThisBlock.toString(),
        lastResetBlock: lastResetBlock.toString(),
        airdropAmount: this.api.consts.airdrop.airdropAmount.toString(),
        minimumBalanceThreshold: this.api.consts.airdrop.minimumBalanceThreshold.toString(),
        maxAirdropsPerBlock: this.api.consts.airdrop.maxAirdropsPerBlock.toString(),
        cooldownPeriod: this.api.consts.airdrop.cooldownPeriod.toString(),
        maxAirdropsPerAccount: this.api.consts.airdrop.maxAirdropsPerAccount.toString(),
        poolBalance
      };

      console.log('Xorion airdrop stats retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting airdrop stats:', error);
      throw error;
    }
  }

  /**
   * Get airdrop record for account
   */
  public async getAirdropRecord(): Promise<AirdropRecord | null> {
    try {
      if (!this.account?.address) return null;

      const record = await this.api.query.airdrop.airdropRecords(this.account.address);
      
      if (record.isSome) {
        const recordData = record.unwrap();
        return {
          claims_count: recordData.claims_count.toNumber(),
          last_claim_block: recordData.last_claim_block.toNumber(),
          total_received: recordData.total_received.toString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting airdrop record:', error);
      return null;
    }
  }

  /**
   * Check eligibility by implementing the same logic as your Rust pallet
   */
  public async checkEligibility(): Promise<Eligibility> {
    try {
      if (!this.account?.address) {
        return { eligible: false, claimed: false, reason: 'No account connected' };
      }

      console.log('Checking eligibility for account:', this.account.address);

      // Get current block number
      const currentBlock = await this.api.query.system.number();
      const currentBlockNumber = currentBlock.toNumber();

      // Get account balance
      const { data: { free } } = await this.api.query.system.account(this.account.address);
      const accountBalance = new BN(free.toString());

      // Get constants from Xorion runtime
      const minimumThreshold = new BN(this.api.consts.airdrop.minimumBalanceThreshold.toString());
      const maxAirdropsPerBlock = this.api.consts.airdrop.maxAirdropsPerBlock.toNumber();
      const maxAirdropsPerAccount = this.api.consts.airdrop.maxAirdropsPerAccount.toNumber();
      const cooldownPeriod = this.api.consts.airdrop.cooldownPeriod.toNumber();
      const airdropAmount = new BN(this.api.consts.airdrop.airdropAmount.toString());

      console.log('Eligibility check values:', {
        accountBalance: accountBalance.toString(),
        minimumThreshold: minimumThreshold.toString(),
        currentBlock: currentBlockNumber,
        cooldownPeriod,
        maxAirdropsPerAccount
      });

      // Check 1: Pool balance (most important first)
      const poolBalance = new BN(await this.getAirdropPoolBalance());
      if (poolBalance.isZero()) {
        return {
          eligible: false,
          claimed: false,
          reason: 'Airdrop pool is empty - admin needs to fund the pool'
        };
      }

      if (poolBalance.lt(airdropAmount)) {
        return {
          eligible: false,
          claimed: false,
          reason: 'Airdrop pool has insufficient funds for a claim'
        };
      }

      // Check 2: Balance threshold (account has too much money)
      if (accountBalance.gte(minimumThreshold)) {
        return {
          eligible: false,
          claimed: false,
          reason: `Account balance ${formatBalance(accountBalance, { decimals: 12, withUnit: 'XOR' })} exceeds minimum threshold`
        };
      }

      // Check 3: Block limit (too many airdrops this block)
      const airdropsThisBlock = await this.api.query.airdrop.airdropsThisBlock();
      if (airdropsThisBlock.toNumber() >= maxAirdropsPerBlock) {
        return {
          eligible: false,
          claimed: false,
          reason: 'Maximum airdrops per block reached, try again in next block'
        };
      }

      // Check 4: Account-specific limits and cooldown
      const record = await this.getAirdropRecord();
      
      if (record) {
        // Check maximum claims per account
        if (record.claims_count >= maxAirdropsPerAccount) {
          return {
            eligible: false,
            claimed: true,
            reason: `Maximum ${maxAirdropsPerAccount} airdrops already claimed`,
            claimsCount: record.claims_count
          };
        }

        // Check cooldown period
        const blocksSinceLastClaim = currentBlockNumber - record.last_claim_block;
        if (blocksSinceLastClaim < cooldownPeriod) {
          const cooldownRemaining = cooldownPeriod - blocksSinceLastClaim;
          
          return {
            eligible: false,
            claimed: true,
            reason: `Cooldown active: ${cooldownRemaining} blocks remaining (~${Math.ceil(cooldownRemaining * 6 / 60)} minutes)`,
            cooldownRemaining,
            claimsCount: record.claims_count
          };
        }
      }

      // All checks passed!
      console.log('✅ Account is eligible for airdrop');
      return {
        eligible: true,
        claimed: record !== null,
        claimsCount: record?.claims_count || 0
      };

    } catch (error) {
      console.error('Error checking eligibility:', error);
      return {
        eligible: false,
        claimed: false,
        reason: `Error checking eligibility: ${error.message}`
      };
    }
  }

  /**
   * Get remaining cooldown blocks
   */
  public async getCooldownRemaining(): Promise<number> {
    try {
      if (!this.account?.address) return 0;

      const record = await this.getAirdropRecord();
      if (!record) return 0;

      const currentBlock = await this.api.query.system.number();
      const currentBlockNumber = currentBlock.toNumber();
      const cooldownPeriod = this.api.consts.airdrop.cooldownPeriod.toNumber();

      const blocksSinceLastClaim = currentBlockNumber - record.last_claim_block;
      
      if (blocksSinceLastClaim < cooldownPeriod) {
        return cooldownPeriod - blocksSinceLastClaim;
      }

      return 0;
    } catch (error) {
      console.error('Error getting cooldown remaining:', error);
      return 0;
    }
  }

  /**
   * Claim airdrop using Xorion runtime extrinsic
   */
  public async claimAirdrop(): Promise<() => void> {
    if (!this.account?.address) {
      throw new Error('No account connected');
    }

    if (!this.api.tx.airdrop?.claimAirdrop) {
      throw new Error('claimAirdrop extrinsic not available in Xorion runtime');
    }

    console.log('Claiming airdrop for:', this.account.address);
    
    // Double-check eligibility
    const eligibility = await this.checkEligibility();
    if (!eligibility.eligible) {
      throw new Error(`Cannot claim airdrop: ${eligibility.reason}`);
    }

    const injector = await web3FromAddress(this.account.address);

    const unsub = await this.api.tx.airdrop
      .claimAirdrop()
      .signAndSend(this.account.address, { signer: injector.signer }, (result) => {
        console.log('Xorion transaction status:', result.status.type);
        
        if (result.status.isInBlock) {
          console.log(`Transaction included in block: ${result.status.asInBlock.toHex()}`);
          
          result.events.forEach(({ event }) => {
            console.log(`Event: ${event.section}.${event.method}`, event.data.toHuman());
            
            if (event.section === 'airdrop' && event.method === 'AirdropClaimed') {
              console.log('🎉 Airdrop claimed successfully from Xorion!', event.data.toHuman());
            }
          });
        } else if (result.status.isFinalized) {
          console.log(`Transaction finalized: ${result.status.asFinalized.toHex()}`);
          unsub();
        }

        if (result.dispatchError) {
          if (result.dispatchError.isModule) {
            const decoded = this.api.registry.findMetaError(result.dispatchError.asModule);
            console.error(`Xorion Dispatch Error: ${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`);
          } else {
            console.error('Xorion Dispatch Error:', result.dispatchError.toString());
          }
        }
      });

    return unsub;
  }

  /**
   * Helper methods for UI
   */
  public async getTotalXorAllocated(): Promise<string> {
    return await this.getAirdropPoolBalance();
  }

  public async getRemainingXor(): Promise<string> {
    return await this.getAirdropPoolBalance();
  }

  public async getMaxPerAccount(): Promise<string> {
    try {
      const maxClaims = this.api.consts.airdrop.maxAirdropsPerAccount.toNumber();
      const airdropAmount = new BN(this.api.consts.airdrop.airdropAmount.toString());
      return airdropAmount.muln(maxClaims).toString();
    } catch (error) {
      console.error('Error getting max per account:', error);
      return '0';
    }
  }

  public async getFormattedStats(): Promise<{
    totalAirdrops: string;
    airdropsThisBlock: string;
    airdropAmount: string;
    poolBalance: string;
    maxPerAccount: string;
    cooldownPeriod: string;
  }> {
    try {
      const stats = await this.getAirdropStats();
      
      return {
        totalAirdrops: stats.totalAirdrops,
        airdropsThisBlock: `${stats.airdropsThisBlock}/${stats.maxAirdropsPerBlock}`,
        airdropAmount: formatBalance(stats.airdropAmount, { decimals: 12, withUnit: 'XOR' }),
        poolBalance: formatBalance(stats.poolBalance, { decimals: 12, withUnit: 'XOR' }),
        maxPerAccount: stats.maxAirdropsPerAccount,
        cooldownPeriod: `${stats.cooldownPeriod} blocks (~${Math.ceil(Number(stats.cooldownPeriod) * 6 / 3600)} hours)`
      };
    } catch (error) {
      console.error('Error getting formatted stats:', error);
      return {
        totalAirdrops: '0',
        airdropsThisBlock: '0/0',
        airdropAmount: '0 XOR',
        poolBalance: '0 XOR',
        maxPerAccount: '0',
        cooldownPeriod: '0 blocks'
      };
    }
  }

  /**
   * Subscribe to Xorion airdrop events
   */
  public subscribeToEvents(callback: (event: any) => void): Promise<() => void> {
    console.log('Subscribing to Xorion airdrop events');
    
    return this.api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record;
        
        if (event.section === 'airdrop') {
          const eventData = {
            method: event.method,
            data: event.data.toHuman(),
            section: event.section,
            timestamp: new Date()
          };
          
          console.log('Xorion airdrop event detected:', eventData);
          callback(eventData);
        }
      });
    });
  }
}
