import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaChartLine, FaShieldAlt, FaRocket, FaExchangeAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LandingHeader from '@/components/LandingHeader';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLaunchExplorer = () => {
    navigate('/explorer');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-center bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 pt-16">
        <div className="max-w-4xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-foreground">
            Explore the Blockchain <span className="text-primary">Effortlessly</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive portal for real-time network statistics, staking insights, and transaction tracking.
          </p>
          <Button 
            size="lg" 
            className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-lg shadow-lg transition-all duration-300"
            onClick={handleLaunchExplorer}
          >
            Launch Explorer
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background via-background to-secondary/20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center bg-card/50 backdrop-blur-sm border border-border hover:border-primary transition-all duration-300">
              <CardHeader className="flex flex-col items-center justify-center pt-8 pb-4">
                <FaChartLine className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl font-semibold text-foreground">Network Statistics</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Real-time insights into blockchain health, block times, and total value locked.
              </CardContent>
            </Card>

            <Card className="text-center bg-card/50 backdrop-blur-sm border border-border hover:border-primary transition-all duration-300">
              <CardHeader className="flex flex-col items-center justify-center pt-8 pb-4">
                <FaShieldAlt className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl font-semibold text-foreground">Advanced Staking</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Manage your delegations, claim rewards, and compare validator performance with ease.
              </CardContent>
            </Card>

            <Card className="text-center bg-card/50 backdrop-blur-sm border border-border hover:border-primary transition-all duration-300">
              <CardHeader className="flex flex-col items-center justify-center pt-8 pb-4">
                <FaExchangeAlt className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl font-semibold text-foreground">Transaction Explorer</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Track every transaction and block with detailed information and powerful search filters.
              </CardContent>
            </Card>

            <Card className="text-center bg-card/50 backdrop-blur-sm border border-border hover:border-primary transition-all duration-300">
              <CardHeader className="flex flex-col items-center justify-center pt-8 pb-4">
                <FaRocket className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl font-semibold text-foreground">Blazing Fast</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Built on modern web technologies for a smooth, fast, and responsive user experience.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/20 via-background to-background">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-bold text-foreground">About XORION</h2>
          <p className="text-lg text-muted-foreground">
            XORION is designed to be your go-to application for interacting with the blockchain. 
            We provide a simple, intuitive interface to access complex network data, helping both 
            novice users and seasoned blockchain enthusiasts stay informed and in control.
          </p>
          <p className="text-lg text-muted-foreground">
            Our mission is to democratize access to blockchain information, making it transparent 
            and understandable for everyone.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-background to-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 XORION. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 