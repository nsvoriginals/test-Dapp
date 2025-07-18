import { ApiPromise } from '@polkadot/api';
import { web3FromAddress } from '@polkadot/extension-dapp';
import BN from 'bn.js';

export class AirdropManager {
  api: ApiPromise;
  account: any;

  constructor(api: ApiPromise, account: any) {
    this.api = api;
    this.account = account;
  }

  async getAirdropStats() {
    try {
      const totalAirdrops = await this.api.query.airdrop.totalAirdrops();
      const airdropsThisBlock = await this.api.query.airdrop.airdropsThisBlock();
      const airdropAmount = await this.api.consts.airdrop.airdropAmount;
      const maxPerBlock = await this.api.consts.airdrop.maxAirdropsPerBlock;
      const cooldownPeriod = await this.api.consts.airdrop.cooldownPeriod;

      return {
        totalAirdrops: totalAirdrops.toHuman(),
        airdropsThisBlock: airdropsThisBlock.toHuman(),
        airdropAmount: airdropAmount.toHuman(),
        maxPerBlock: maxPerBlock.toHuman(),
        cooldownPeriod: cooldownPeriod.toHuman()
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  async claimAirdrop() {
    try {
      const injector = await web3FromAddress(this.account.address);

      const unsub = await this.api.tx.airdrop
        .claimAirdrop()
        .signAndSend(this.account.address, { signer: injector.signer }, (result) => {
          console.log('Transaction status:', result.status.type);
          if (result.status.isInBlock) {
            console.log('Transaction included in block:', result.status.asInBlock.toHex());
            result.events.forEach(({ event: { data, method, section } }) => {
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
    } catch (error) {
      console.error('Error claiming airdrop:', error);
      throw error;
    }
  }

  async checkEligibility() {
    try {
      const userBalance = await this.api.query.system.account(this.account.address);
      const json = userBalance.toJSON();
      let free = '0';
      if (json && typeof json === 'object' && 'free' in json) {
        free = json.free?.toString() || '0';
      }

      const userFree = new BN(free);
      const eligible = userFree.gt(new BN(0)); // Check if user has any balance

      return { eligible, claimed: false };
    } catch (e) {
      return { eligible: false, error: e };
    }
  }

  async getTotalXorAllocated() {
    try {
      const total = await this.api.query.airdrop.totalAirdropAllocation?.();
      if (total) return total.toString(); // If stored on-chain
    } catch {}
    return (BigInt(1_000_000 * 1e18)).toString(); // Fallback
  }

  async getRemainingXor() {
    try {
      const remaining = await this.api.query.airdrop.remainingAirdropBalance?.();
      if (remaining) return remaining.toString();
    } catch {}
    return '0';
  }

  async getMaxPerAccount() {
    try {
      const maxPer = this.api.consts.airdrop.maxAirdropsPerAccount;
      const airdropAmount = this.api.consts.airdrop.airdropAmount;

      const maxPerBN = new BN(maxPer.toString());
      const airdropAmountBN = new BN(airdropAmount.toString());

      return maxPerBN.mul(airdropAmountBN).toString();
    } catch {
      return '0';
    }
  }

  subscribeToEvents(callback: (event: any) => void) {
    return this.api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record;
        if (event.section === 'airdrop') {
          callback({
            method: event.method,
            data: event.data.toHuman()
          });
        }
      });
    });
  }
}
