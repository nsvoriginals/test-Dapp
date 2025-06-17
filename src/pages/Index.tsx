
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NetworkStats } from '@/components/NetworkStats';
import { StakingInterface } from '@/components/StakingInterface';
import { ValidatorPanel } from '@/components/ValidatorPanel';
import { TransactionExplorer } from '@/components/TransactionExplorer';
import { WalletConnection } from '@/components/WalletConnection';
import { Activity, Shield, Users, Zap } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'staking', label: 'Staking', icon: Shield },
    { id: 'validators', label: 'Validators', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: Zap },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <NetworkStats />;
      case 'staking':
        return <StakingInterface />;
      case 'validators':
        return <ValidatorPanel />;
      case 'transactions':
        return <TransactionExplorer />;
      default:
        return <NetworkStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ChainScope</h1>
                <p className="text-sm text-gray-400">Blockchain Analytics Dashboard</p>
              </div>
            </div>
            <WalletConnection />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-black/10 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-blue-400 bg-blue-500/10'
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-black/20 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 ChainScope. Built with React & Custom Data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
