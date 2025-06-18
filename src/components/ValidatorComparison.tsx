import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FaShieldAlt, FaChartLine, FaUsers, FaClock } from 'react-icons/fa';
import { cn } from '@/lib/utils';

// Mock validator data
const validators = [
  { id: 1, name: 'Cosmos Hub Validator', commission: 5, apr: 12.8, uptime: 99.9, delegators: 1250, selfBonded: 150000, description: 'Leading validator with enterprise infrastructure' },
  { id: 2, name: 'Secure Staking Co.', commission: 3, apr: 12.5, uptime: 99.8, delegators: 980, selfBonded: 200000, description: 'Institutional grade staking services' },
  { id: 3, name: 'Decentralized Pool', commission: 7, apr: 12.2, uptime: 99.7, delegators: 2100, selfBonded: 80000, description: 'Community-driven validator node' },
  { id: 4, name: 'Community Validator', commission: 4, apr: 12.6, uptime: 99.5, delegators: 750, selfBonded: 120000, description: 'Supporting the ecosystem growth' },
  { id: 5, name: 'Network Guardian', commission: 6, apr: 12.3, uptime: 99.2, delegators: 890, selfBonded: 95000, description: 'Reliable and transparent operations' }
];

const ValidatorComparison = () => {
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);

  const handleValidatorSelect = (value: string) => {
    if (selectedValidators.includes(value)) {
      setSelectedValidators(selectedValidators.filter(v => v !== value));
    } else if (selectedValidators.length < 3) {
      setSelectedValidators([...selectedValidators, value]);
    }
  };

  const getStatusColor = (value: number, type: 'commission' | 'apr' | 'uptime') => {
    if (type === 'commission') {
      if (value <= 3) return 'bg-green-500/20 text-green-500 border-green-500/30';
      if (value <= 5) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    }
    if (type === 'apr') {
      if (value >= 12.5) return 'bg-green-500/20 text-green-500 border-green-500/30';
      if (value >= 12) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    }
    if (type === 'uptime') {
      if (value >= 99.8) return 'bg-green-500/20 text-green-500 border-green-500/30';
      if (value >= 99.5) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    }
    return 'bg-primary/20 text-primary border-primary/30';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center space-x-2">
          <FaShieldAlt className="w-5 h-5 text-primary" />
          <span>Validator Comparison</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((index) => (
            <Select
              key={index}
              onValueChange={handleValidatorSelect}
              value={selectedValidators[index - 1] || ''}
            >
              <SelectTrigger className="w-[300px] bg-input border-border text-foreground">
                <SelectValue placeholder={`Select Validator ${index}`} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {validators.map((validator) => (
                  <SelectItem 
                    key={validator.id} 
                    value={validator.name}
                    disabled={selectedValidators.includes(validator.name) && !selectedValidators[index - 1]}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{validator.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Commission: {validator.commission}% | APR: {validator.apr}%
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {selectedValidators.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  {selectedValidators.map((validator) => (
                    <TableHead key={validator}>{validator}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Commission</TableCell>
                  {selectedValidators.map((validator) => {
                    const data = validators.find(v => v.name === validator);
                    return (
                      <TableCell key={validator}>
                        <Badge className={cn("border", getStatusColor(data?.commission || 0, 'commission'))}>
                          {data?.commission}%
                        </Badge>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">APR</TableCell>
                  {selectedValidators.map((validator) => {
                    const data = validators.find(v => v.name === validator);
                    return (
                      <TableCell key={validator}>
                        <Badge className={cn("border", getStatusColor(data?.apr || 0, 'apr'))}>
                          {data?.apr}%
                        </Badge>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Uptime</TableCell>
                  {selectedValidators.map((validator) => {
                    const data = validators.find(v => v.name === validator);
                    return (
                      <TableCell key={validator}>
                        <Badge className={cn("border", getStatusColor(data?.uptime || 0, 'uptime'))}>
                          {data?.uptime}%
                        </Badge>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Delegators</TableCell>
                  {selectedValidators.map((validator) => {
                    const data = validators.find(v => v.name === validator);
                    return (
                      <TableCell key={validator}>
                        {formatNumber(data?.delegators || 0)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Self-Bonded</TableCell>
                  {selectedValidators.map((validator) => {
                    const data = validators.find(v => v.name === validator);
                    return (
                      <TableCell key={validator}>
                        {formatNumber(data?.selfBonded || 0)} ATOM
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Description</TableCell>
                  {selectedValidators.map((validator) => {
                    const data = validators.find(v => v.name === validator);
                    return (
                      <TableCell key={validator} className="max-w-xs">
                        {data?.description}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidatorComparison; 