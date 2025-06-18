import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaCalculator, FaChartLine } from 'react-icons/fa';

const StakingCalculator = () => {
  const [amount, setAmount] = useState('1000');
  const [apr, setApr] = useState(12.5);
  const [duration, setDuration] = useState(12);

  const calculateRewards = useMemo(() => {
    const principal = parseFloat(amount) || 0;
    const monthlyRate = apr / 100 / 12;
    const months = duration;

    const data = [];
    let currentAmount = principal;
    
    for (let i = 0; i <= months; i++) {
      data.push({
        month: i,
        amount: currentAmount,
        rewards: currentAmount - principal
      });
      currentAmount *= (1 + monthlyRate);
    }

    return data;
  }, [amount, apr, duration]);

  const totalRewards = useMemo(() => {
    const lastMonth = calculateRewards[calculateRewards.length - 1];
    return lastMonth ? lastMonth.rewards : 0;
  }, [calculateRewards]);

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center space-x-2">
          <FaCalculator className="w-5 h-5 text-primary" />
          <span>Staking Calculator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Staking Amount (ATOM)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apr">APR (%)</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="apr"
                value={[apr]}
                onValueChange={([value]) => setApr(value)}
                min={1}
                max={20}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{apr}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (months)</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="duration"
                value={[duration]}
                onValueChange={([value]) => setDuration(value)}
                min={1}
                max={60}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{duration}m</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card/50 border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalRewards.toFixed(2)} ATOM
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                After {duration} months
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(parseFloat(amount) + totalRewards).toFixed(2)} ATOM
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Including initial stake
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calculateRewards}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                label={{ value: 'ATOM', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)} ATOM`,
                  name === 'amount' ? 'Total Value' : 'Rewards'
                ]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name="Total Value"
              />
              <Line
                type="monotone"
                dataKey="rewards"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={false}
                name="Rewards"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StakingCalculator; 