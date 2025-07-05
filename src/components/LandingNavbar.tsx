import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSun, FaMoon } from "react-icons/fa";
import logo from '/logo.svg';

const LandingNavbar = ({ isOpen, setIsOpen, navItems, handleNavClick, navigate, theme, toggleTheme }) => (
  <section className="py-4 lg:py-8 fixed w-full top-0 z-50 bg-background/80 backdrop-blur">
    <div className="container max-w-5xl mx-auto px-4">
      <div className="border border-border rounded-[27px] md:rounded-full bg-card/80 backdrop-blur max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 p-2 px-4 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/') }>
            <img src={logo} alt="company-logo" className="h-8 w-auto md:h-7" />
            <span className="text-xl font-semibold text-primary">XORION</span>
          </div>
          <div className="lg:flex justify-center items-center hidden">
            <nav className="flex gap-4 font-medium">
              {navItems.map((link) => (
                <a
                  href={link.href}
                  key={link.name}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex justify-end gap-3 items-center">
            <button
              className="bg-primary text-primary-foreground rounded-full px-6 py-2 font-semibold shadow hover:bg-primary/90 transition-all"
              onClick={() => navigate('/explorer')}
            >
              Explore
            </button>
            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col items-center gap-4 py-4">
                {navItems.map((link) => (
                  <a
                    href={link.href}
                    key={link.name}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <button
                  className="w-full max-w-[200px] bg-primary text-primary-foreground rounded-full py-2 font-semibold shadow hover:bg-primary/90 transition-all"
                  onClick={() => { setIsOpen(false); navigate('/explorer'); }}
                >
                  Explore
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </section>
); 
export default LandingNavbar; 