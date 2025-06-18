import { Button } from '@/components/ui/button';
import WalletConnection from './WalletConnection';
import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Header = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0">
              <img src="/logo.svg" alt="XORION Logo" className="w-full h-full" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">XORION</h1>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-2 sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
                      {theme === "dark" ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                    <span className="text-sm text-muted-foreground">Toggle Theme</span>
                  </div>
                  <WalletConnection />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <WalletConnection />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 