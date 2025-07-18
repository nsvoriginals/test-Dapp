import { ApiPromise } from '@polkadot/api';
import { web3FromAddress } from '@polkadot/extension-dapp';
import BN from 'bn.js';

export class AirdropManager {
  api: ApiPromise;
  account: any;

  constructor(api: ApiPromise, account: any) {
    this.api = api;
    this.account = account;
    console.log('AirdropManager initialized with:', {
      api: !!api,
      account: account?.address
    });
  }

  async getAirdropStats() {
    try {
      console.log('Fetching airdrop stats...');
      if (!this.api.isReady) {
        await this.api.isReady;
      }

      if (!this.api.query.airdrop || !this.api.consts.airdrop) {
        console.error('Airdrop pallet not found in API');
        return this.getFallbackStats();
      }

      const [totalAirdrops, airdropsThisBlock] = await Promise.all([
        this.api.query.airdrop.totalAirdrops(),
        this.api.query.airdrop.airdropsThisBlock(),
      ]);
      
      const airdropAmount = this.api.consts.airdrop.airdropAmount;
      const maxPerBlock = this.api.consts.airdrop.maxAirdropsPerBlock;
      const cooldownPeriod = this.api.consts.airdrop.cooldownPeriod;

      const stats = {
        totalAirdrops: totalAirdrops.toHuman(),
        airdropsThisBlock: airdropsThisBlock.toHuman(),
        airdropAmount: airdropAmount.toHuman(),
        maxPerBlock: maxPerBlock.toHuman(),
        cooldownPeriod: cooldownPeriod.toHuman(),
      };

      console.log('Airdrop stats retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return this.getFallbackStats();
    }
  }

  getFallbackStats() {
    return {
      totalAirdrops: '0',
      airdropsThisBlock: '0',
      airdropAmount: '1000000000000000000000', // 1000 XOR fallback
      maxPerBlock: '10',
      cooldownPeriod: '100',
    };
  }

  async claimAirdrop() {
    if (!this.account?.address) {
      throw new Error('No account connected');
    }
    if (!this.api.tx.airdrop?.claimAirdrop) {
      throw new Error('Claim function is not available on the network.');
    }

    console.log('Claiming airdrop for:', this.account.address);
    const injector = await web3FromAddress(this.account.address);
    const unsub = await this.api.tx.airdrop
      .claimAirdrop()
      .signAndSend(this.account.address, { signer: injector.signer }, (result) => {
        console.log('Transaction status:', result.status.type);
        if (result.status.isInBlock) {
          console.log('Transaction included in block:', result.status.asInBlock.toHex());
          result.events.forEach(({ event: { data, method, section } }) => {
            console.log(`Event: ${section}.${method}`, data.toHuman());
            if (section === 'airdrop' && method === 'AirdropClaimed') {
              console.log('Airdrop claimed successfully!', data.toHuman());
            }
          });
        } else if (result.status.isFinalized) {
          console.log('Transaction finalized');
          unsub();
        }
      });
    return unsub;
  }

  async checkEligibility() {
    try {
      if (!this.account?.address) {
        return { eligible: false, claimed: false, error: 'No account' };
      }
      if (!this.api.rpc.airdrop?.isEligibleForAirdrop) {
        console.error('RPC airdrop.isEligibleForAirdrop not found');
        return { eligible: false, error: 'Eligibility check unavailable.' };
      }

      const isEligible = await this.api.rpc.airdrop.isEligibleForAirdrop(this.account.address);
      const eligible = isEligible?.isTrue || false;
      
      console.log('Eligibility check result:', { eligible });
      return { eligible, claimed: false };
    } catch (e) {
      console.error('Error checking eligibility:', e);
      return { eligible: false, error: e.message };
    }
  }

  async getRemainingXor() {
    try {
      if (!this.account?.address) return '0';
      if (!this.api.rpc.airdrop?.getAirdropPoolBalance) {
        console.error('RPC airdrop.getAirdropPoolBalance not found');
        return '0';
      }

      const poolBalance = await this.api.rpc.airdrop.getAirdropPoolBalance(this.account.address);
      return poolBalance?.toBn ? poolBalance.toBn().toString() : poolBalance?.toString?.() || '0';
    } catch (e) {
      console.error('Error getting remaining balance via RPC:', e);
      return '0';
    }
  }
  
  async getTotalXorAllocated() {
    // This can be a hardcoded value or fetched from a constant if available
    return BigInt(1_000_000 * 1e18);
  }

  async getMaxPerAccount() {
    try {
      if (!this.api.consts.airdrop?.maxAirdropsPerAccount || !this.api.consts.airdrop?.airdropAmount) {
        console.warn('Airdrop constants for max per account not found, using fallback');
        return '10000000000000000000000'; // 10,000 XOR fallback
      }

      const maxPer = this.api.consts.airdrop.maxAirdropsPerAccount;
      const airdropAmount = this.api.consts.airdrop.airdropAmount;

      const maxPerBN = new BN(maxPer.toString());
      const airdropAmountBN = new BN(airdropAmount.toString());
      
      return maxPerBN.mul(airdropAmountBN).toString();
    } catch (e) {
      console.error('Error getting max per account:', e);
      return '10000000000000000000000'; // 10,000 XOR fallback
    }
  }

  subscribeToEvents(callback: (event: any) => void) {
    console.log('Subscribing to airdrop events');
    return this.api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record;
        if (event.section === 'airdrop') {
          console.log('Airdrop event detected:', event.method, event.data.toHuman());
          callback({
            method: event.method,
            data: event.data.toHuman()
          });
        }
      });
    });
  }
}