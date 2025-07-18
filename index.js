// airdropStats.js
import { ApiPromise, WsProvider } from '@polkadot/api';
import BN from 'bn.js';

class AirdropManager {
  constructor(api) {
    this.api = api;
  }

  async getAirdropStats() {
    try {
      const totalAirdrops = await this.api.query.airdrop.totalAirdrops();
      const airdropsThisBlock = await this.api.query.airdrop.airdropsThisBlock();
      const airdropAmount = await this.api.consts.airdrop.airdropAmount;
      const maxPerBlock = await this.api.consts.airdrop.maxAirdropsPerBlock;
      const cooldownPeriod = await this.api.consts.airdrop.cooldownPeriod;
      const maxPerAccount = await this.api.consts.airdrop.maxAirdropsPerAccount;

      // Calculate max tokens per address
      const maxClaimable = new BN(maxPerAccount.toString()).mul(new BN(airdropAmount.toString()));

      // Optional: Check if remaining balance is exposed via storage item
      let remainingBalance = 'Not Available';
      try {
        const remaining = await this.api.query.airdrop.remainingAirdropBalance?.();
        if (remaining) remainingBalance = remaining.toHuman?.() || remaining.toString();
      } catch (_) {}

      return {
        totalAirdrops: totalAirdrops.toHuman(),
        airdropsThisBlock: airdropsThisBlock.toHuman(),
        airdropAmount: airdropAmount.toHuman(),
        maxPerBlock: maxPerBlock.toHuman(),
        cooldownPeriod: cooldownPeriod.toHuman(),
        maxPerAccount: maxPerAccount.toHuman(),
        maxClaimable: maxClaimable.toString(),
        remainingBalance
      };
    } catch (error) {
      console.error('Error getting airdrop stats:', error);
      return null;
    }
  }
}

async function main() {
  const wsProvider = new WsProvider('wss://ws-proxy-latest-jds3.onrender.com');

  console.log('🔌 Connecting to blockchain...');
  const api = await ApiPromise.create({ provider: wsProvider });

  const manager = new AirdropManager(api);
  const stats = await manager.getAirdropStats();

  if (stats) {
    console.log('\n📊 Airdrop Stats:');
    console.log('------------------------');
    console.log(`Total Airdrops:           ${stats.totalAirdrops}`);
    console.log(`Airdrops This Block:      ${stats.airdropsThisBlock}`);
    console.log(`Airdrop Amount:           ${stats.airdropAmount}`);
    console.log(`Max Airdrops Per Block:   ${stats.maxPerBlock}`);
    console.log(`Cooldown Period:          ${stats.cooldownPeriod}`);
    console.log(`Max Airdrops Per Address: ${stats.maxPerAccount}`);
    console.log(`Max Claimable Per Address:${stats.maxClaimable}`);
    console.log(`Remaining Pool Balance:   ${stats.remainingBalance}`);
    console.log('------------------------\n');
  }

  await api.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
