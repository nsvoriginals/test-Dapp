import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaChartLine, FaShieldAlt, FaRocket, FaExchangeAlt, FaDiscord, FaTwitter, FaGithub, FaTelegramPlane } from 'react-icons/fa';
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
      <section className="relative h-[60vh] flex items-center justify-center text-center  from-primary/10 via-primary/5 to-background px-6 pt-16">
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-6 flex flex-col items-center text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Dive into the XORION Explorer and experience the next generation of blockchain analytics and staking tools.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-5 rounded-lg shadow-lg transition-all duration-300"
            onClick={handleLaunchExplorer}
          >
            Launch XORION Explorer
          </Button>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 bg-gradient-to-b from-secondary/10 via-background to-background">
        <div className="container mx-auto px-6 flex flex-col items-center text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Join Our Community</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Connect with us and other blockchain enthusiasts. Stay up to date, ask questions, and help shape the future of XORION.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" className="group">
              <FaDiscord className="w-10 h-10 text-primary group-hover:text-indigo-500 transition" />
              <span className="sr-only">Discord</span>
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="group">
              <FaTwitter className="w-10 h-10 text-primary group-hover:text-blue-400 transition" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="group">
              <FaGithub className="w-10 h-10 text-primary group-hover:text-gray-700 dark:group-hover:text-gray-200 transition" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="group">
              <FaTelegramPlane className="w-10 h-10 text-primary group-hover:text-blue-500 transition" />
              <span className="sr-only">Telegram</span>
            </a>
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
      <footer className="bg-gradient-to-b from-background to-card/20 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left text-muted-foreground">
            <p>&copy; 2024 XORION. All rights reserved.</p>
          </div>
          <div className="flex gap-4 justify-center md:justify-end">
            <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" className="group">
              <FaDiscord className="w-6 h-6 text-primary group-hover:text-indigo-500 transition" />
              <span className="sr-only">Discord</span>
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="group">
              <FaTwitter className="w-6 h-6 text-primary group-hover:text-blue-400 transition" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="group">
              <FaGithub className="w-6 h-6 text-primary group-hover:text-gray-700 dark:group-hover:text-gray-200 transition" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="group">
              <FaTelegramPlane className="w-6 h-6 text-primary group-hover:text-blue-500 transition" />
              <span className="sr-only">Telegram</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 