import { useState } from 'react';
import NetworkStats from '@/components/NetworkStats';
import StakingInterface from '@/components/StakingInterface';
import ValidatorPanel from '@/components/ValidatorPanel';
import TransactionExplorer from '@/components/TransactionExplorer';
import { FaChartLine, FaShieldAlt, FaUsers, FaBolt } from 'react-icons/fa';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'staking', label: 'Staking', icon: FaShieldAlt },
    { id: 'validators', label: 'Validators', icon: FaUsers },
    { id: 'transactions', label: 'Transactions', icon: FaBolt },
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
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <NavigationBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/20 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 XORION. Built with React & Custom Data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;