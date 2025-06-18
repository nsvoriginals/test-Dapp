import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaShieldAlt, FaExchangeAlt, FaRocket, FaSearch } from 'react-icons/fa';

const navItems = [
  { id: 'blocks', label: 'Blocks', icon: FaChartLine },
  { id: 'transactions', label: 'Transactions', icon: FaExchangeAlt },
  { id: 'validators', label: 'Validators', icon: FaShieldAlt },
  { id: 'contracts', label: 'Contracts', icon: FaRocket },
  { id: 'search', label: 'Search', icon: FaSearch },
];

const ExplorerPage = () => {
  const [activeTab, setActiveTab] = useState('blocks');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Pills */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-2 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-6 py-8">
        {/* Content will be rendered here based on activeTab */}
        <div className="text-foreground">
          {activeTab === 'blocks' && <div>Blocks Content</div>}
          {activeTab === 'transactions' && <div>Transactions Content</div>}
          {activeTab === 'validators' && <div>Validators Content</div>}
          {activeTab === 'contracts' && <div>Contracts Content</div>}
          {activeTab === 'search' && <div>Search Content</div>}
        </div>
      </div>
    </div>
  );
};

export default ExplorerPage; 