import React, { useEffect, useState } from 'react';
import { useAirdrop } from '../hooks/useAirdrop';
import { useToast } from '../hooks/use-toast';
import { ToastAction } from '../components/ui/toast';
import BN from 'bn.js';

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
    if (!account) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to claim the airdrop.',
        duration: 6000,
      });
    }
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
  }, []);

  useEffect(() => {
    if (!airdropManager || !account) return;
    (async () => {
      setLoading(true);
      try {
        const stats = await airdropManager.getAirdropStats();
        const eligible = await airdropManager.checkEligibility();
        const total = await airdropManager.getTotalXorAllocated();
        const remaining = await airdropManager.getRemainingXor();
        const max = await airdropManager.getMaxPerAccount();

        setStats(stats);
        setEligibility(eligible);
        setTotalAllocated(total);
        setRemainingXor(remaining);
        setMaxPerAccount(max);
      } catch (e: any) {
        console.error('Error loading airdrop data:', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [airdropManager, account]);

  const handleClaim = async () => {
    if (!airdropManager || !account) return;
    setClaiming(true);
    try {
      await airdropManager.claimAirdrop();
      setClaimed(true);
      toast({
        title: 'Success',
        description: 'Airdrop claimed successfully!',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to claim airdrop',
        variant: 'destructive',
      });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="relative rounded-2xl p-8 shadow-xl bg-black/70 border border-white/10 backdrop-blur-xl overflow-hidden">
      <h2 className="text-2xl font-extrabold mb-8 text-white tracking-tight">Airdrop XOR TOKEN</h2>

      {/* Pool Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <InfoCard title="Total Airdrop Pool" value={formatXOR(totalAllocated)} color={cardColors[0]} />
        <InfoCard title="Max Per Address" value={formatXOR(maxPerAccount)} color={cardColors[1]} />
        <InfoCard title="Remaining in Pool" value={formatXOR(remainingXor)} color={cardColors[2]} />
      </div>

      {/* Chain Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <InfoCard title="Total Airdrops" value={stats?.totalAirdrops || '-'} color={cardColors[0]} />
        <InfoCard title="Airdrops This Block" value={stats?.airdropsThisBlock || '-'} color={cardColors[1]} />
        <InfoCard title="Airdrop Amount" value={stats?.airdropAmount || '-'} color={cardColors[2]} />
        <InfoCard title="Max Per Block" value={stats?.maxPerBlock || '-'} color={cardColors[3]} />
      </div>

      {/* Eligibility */}
      <div className="mb-8">
        <div className="text-xs text-white/80 uppercase font-semibold mb-1">Eligibility</div>
        <div className={`text-lg font-bold ${
          eligibility?.eligible ? 'text-green-300' :
          claimed ? 'text-yellow-300' : 'text-red-300'
        } drop-shadow`}>
          {eligibility?.eligible ? "Eligible" : claimed ? "Already Claimed" : "Not Eligible"}
        </div>
      </div>

      {/* Claim Button */}
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

const InfoCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <div className={`rounded-2xl p-5 border shadow ${color}`}>
    <div className="text-sm font-semibold text-white/70 mb-1">{title}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

export default AirdropPanel;
