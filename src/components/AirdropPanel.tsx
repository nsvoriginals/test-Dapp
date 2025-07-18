import React, { useEffect, useState } from 'react';
import { useAirdrop } from '../hooks/useAirdrop';
import { useToast } from '../hooks/use-toast';
import { ToastAction } from '../components/ui/toast';

function formatXOR(amount: any) {
  let value = typeof amount === 'string' ? amount.replace(/,/g, '') : amount;
  try {
    const base = BigInt(1e18);
    const big = BigInt(value);
    const whole = big / base;
    const fraction = big % base;
    const fractionStr = fraction.toString().padStart(18, '0').slice(0, 6);
    return `${whole.toString()}.${fractionStr} XOR`;
  } catch {
    if (!isNaN(Number(value))) {
      return (Number(value) / 1e18).toFixed(6) + ' XOR';
    }
    return value;
  }
}

const cardColors = [
  'bg-blue-900/70 border-blue-600/30',
  'bg-purple-900/70 border-purple-600/30',
  'bg-green-900/70 border-green-600/30',
  'bg-yellow-900/70 border-yellow-600/30',
];

const AirdropPanel: React.FC = () => {
  const { api, account, airdropManager } = useAirdrop();
  const [stats, setStats] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [totalAllocated, setTotalAllocated] = useState<string>('0');
  const [remainingXor, setRemainingXor] = useState<string>('0');
  const [maxPerAccount, setMaxPerAccount] = useState<string>('0');
  const { toast } = useToast();

  useEffect(() => {
    // Show connect wallet warning if no account
    if (!account) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to claim the airdrop.',
        duration: 6000,
      });
    }
    // Show follow us on X toast every time
    toast({
      title: 'Follow us on X',
      description: 'Stay updated! Follow us on X (Twitter) for the latest news.',
      duration: 6000,
      action: (
        <ToastAction altText="Follow on X" onClick={() => window.open('https://x.com/xorionchain', '_blank')}>
          Follow
        </ToastAction>
      ),
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!account) return;
    (async () => {
      // Replace all airdropManager calls with backend API calls
      // Example endpoints: /api/airdrop/stats, /api/airdrop/eligibility, etc.
      const statsRes = await fetch(`/api/airdrop/stats`).then(r => r.json());
      setStats(statsRes);
      const eligibilityRes = await fetch(`/api/airdrop/eligibility?address=${account.address}`).then(r => r.json());
      setEligibility(eligibilityRes);
      setTotalAllocated(statsRes.totalAllocated?.toString() || '0');
      setRemainingXor(statsRes.remainingXor?.toString() || '0');
      setMaxPerAccount(statsRes.maxPerAccount?.toString() || '0');
      setLoading(false);
    })();
  }, [account]);

  const handleClaim = async () => {
    if (!account) return;
    setClaiming(true);
    try {
      // Call backend claim endpoint
      const res = await fetch(`/api/airdrop/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account.address })
      });
      const data = await res.json();
      if (data.success) setClaimed(true);
      else alert(data.error || 'Failed to claim airdrop');
    } catch (e) {
      alert('Failed to claim airdrop');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="relative rounded-2xl p-8 shadow-xl bg-black/70 border border-white/10 backdrop-blur-xl overflow-hidden">
      <h2 className="text-2xl font-extrabold mb-8 text-white tracking-tight">Airdrop XOR TOKEN</h2>
      {/* New info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-2xl p-5 border shadow ${cardColors[0]}`}>
          <div className="text-sm font-semibold text-blue-200 mb-1">Total Airdrop Pool</div>
          <div className="text-2xl font-bold text-white">{formatXOR(totalAllocated)}</div>
        </div>
        <div className={`rounded-2xl p-5 border shadow ${cardColors[1]}`}>
          <div className="text-sm font-semibold text-purple-200 mb-1">Max Per Address</div>
          <div className="text-2xl font-bold text-white">{formatXOR(maxPerAccount)}</div>
        </div>
        <div className={`rounded-2xl p-5 border shadow ${cardColors[2]}`}>
          <div className="text-sm font-semibold text-green-200 mb-1">Remaining in Pool</div>
          <div className="text-2xl font-bold text-white">{formatXOR(remainingXor)}</div>
        </div>
      </div>
      {/* Original stats and eligibility */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-2xl p-5 border shadow ${cardColors[0]}`}>
          <div className="text-sm font-semibold text-blue-200 mb-1">Total Airdrops</div>
          <div className="text-2xl font-bold text-white">{stats?.totalAirdrops ? formatXOR(stats.totalAirdrops) : '-'}</div>
        </div>
        <div className={`rounded-2xl p-5 border shadow ${cardColors[1]}`}>
          <div className="text-sm font-semibold text-purple-200 mb-1">Airdrops This Block</div>
          <div className="text-2xl font-bold text-white">{stats?.airdropsThisBlock ? formatXOR(stats.airdropsThisBlock) : '-'}</div>
        </div>
        <div className={`rounded-2xl p-5 border shadow ${cardColors[2]}`}>
          <div className="text-sm font-semibold text-green-200 mb-1">Airdrop Amount</div>
          <div className="text-2xl font-bold text-white">{stats?.airdropAmount ? formatXOR(stats.airdropAmount) : '-'}</div>
        </div>
        <div className={`rounded-2xl p-5 border shadow ${cardColors[3]}`}>
          <div className="text-sm font-semibold text-yellow-200 mb-1">Max Per Block</div>
          <div className="text-2xl font-bold text-white">{stats?.maxPerBlock ? formatXOR(stats.maxPerBlock) : '-'}</div>
        </div>
      </div>
      <div className="mb-8">
        <div className="text-xs text-white/80 uppercase font-semibold mb-1">Eligibility</div>
        <div className={`text-lg font-bold ${eligibility?.eligible ? 'text-green-300' : eligibility?.claimed ? 'text-yellow-300' : 'text-red-300'} drop-shadow`}>
          {eligibility?.eligible ? "Eligible" : eligibility?.claimed ? "Already Claimed" : "Not Eligible"}
        </div>
      </div>
      <button
        className="w-full py-3 rounded-xl font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleClaim}
        disabled={!eligibility?.eligible || claiming || claimed}
      >
        {claiming ? 'Claiming...' : claimed ? 'Claimed!' : 'Claim Airdrop'}
      </button>
    </div>
  );
};

export default AirdropPanel; 