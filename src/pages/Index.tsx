import { useState } from 'react';
import NetworkStats from '@/components/NetworkStats';
import StakingInterface from '@/components/StakingInterface';
import ValidatorPanel from '@/components/ValidatorPanel';
import TransactionExplorer from '@/components/TransactionExplorer';
import { FaChartLine, FaShieldAlt, FaUsers, FaBolt } from 'react-icons/fa';
import Header from '@/components/Header';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
//import NavigationBar from '@/components/NavigationBar';

const NavigationBar = ({ tabs, activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation - Visible on lg+ screens */}
      <nav className="hidden lg:block bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Hamburger menu for lg- screens */}
      <nav className="lg:hidden bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            {/* Current Tab Indicator */}
            <div className="flex items-center space-x-2">
              {(() => {
                const currentTab = tabs.find(tab => tab.id === activeTab);
                const IconComponent = currentTab?.icon;
                return (
                  <>
                    <IconComponent className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{currentTab?.label}</span>
                  </>
                );
              })()}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-background">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Navigation</h3>
                </div>
                
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary/10 text-primary border border-primary/30'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  );
};

// Main App Component
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
    <div className="min-h-screen bg-background">
      {/* Header - Always clean and visible */}
      <Header />
      
      {/* Navigation - Responsive tabs */}
      <NavigationBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 XORION. Built with React & Custom Data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;