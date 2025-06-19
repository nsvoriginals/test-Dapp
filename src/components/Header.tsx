import { Button } from '@/components/ui/button';
import WalletConnection from './WalletConnection';
import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Header = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4">
        <div className="flex flex-row items-center justify-between w-full gap-x-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-x-2 min-w-0 group">
            <img src="/logo.svg" alt="XORION Logo" className="w-7 h-7 md:w-10 md:h-10 flex-shrink-0 transition-transform group-hover:scale-105" />
            <span className="text-lg md:text-2xl font-bold text-foreground whitespace-nowrap group-hover:text-primary transition-colors">XORION</span>
          </Link>

          {/* Theme Toggle */}
          <div className="flex flex-row items-center gap-x-2 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </Button>
            <div className="max-w-[160px] md:max-w-xs truncate flex-shrink min-w-0">
              <WalletConnection />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 