import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Menu, X, BarChart3, Shield, Zap, ArrowRightLeft, Github, Twitter, MessageCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '/logo.svg';
import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";
import Footer from '@/components/Footer';
import About from '@/components/About';
import CommunitySection from '@/components/Community';

const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Community', href: '#community' },
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Network Analytics',
      description: 'Real-time blockchain metrics and insights'
    },
    {
      icon: Shield,
      title: 'Secure Staking',
      description: 'Advanced delegation and reward management'
    },
    {
      icon: ArrowRightLeft,
      title: 'Transaction Explorer',
      description: 'Comprehensive transaction tracking'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed and performance'
    }
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: MessageCircle, href: 'https://discord.gg', label: 'Discord' },
    { icon: Send, href: 'https://t.me', label: 'Telegram' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <section className="py-4 lg:py-8 fixed w-full top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="border border-border rounded-[27px] md:rounded-full bg-card/80 backdrop-blur max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-3 p-2 px-4 items-center">
              {/* Logo */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/') }>
                <img src={logo} alt="company-logo" className="h-8 w-auto md:h-7" />
                <span className="text-xl font-semibold text-primary">XORION</span>
              </div>

              {/* Desktop Nav Links */}
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

              {/* Explore Button & Theme Toggle */}
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
            {/* Mobile Menu */}
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
      <div className="pb-[86px] md:pb-[98px] lg:pb-[130px]"></div>

      {/* Hero Section */}
      <section className="pt-16 pb-8 px-4 sm:px-6 lg:px-8 bg-background" id="hero">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-card rounded-full text-sm font-medium text-primary mb-8">
            <span>✨ Next-gen blockchain explorer</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Explore the Blockchain
            <br />
            <span className="text-primary">Effortlessly</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Your comprehensive portal for real-time network statistics, staking insights, and transaction tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold shadow hover:bg-primary/90 transition-all flex items-center justify-center"
              onClick={() => navigate('/explorer')}
            >
              Explore
            </button>
          </div>
        </div>
      </section>

      {/* Features Bento Grid Section */}
      <section id="features" className="py-8 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">Powerful Features</h2>

          {/* Demo Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center shadow">
              <div className="text-3xl font-bold text-primary mb-1">297</div>
              <div className="text-sm text-muted-foreground">Validators Online</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center shadow">
              <div className="text-3xl font-bold text-primary mb-1">13.2%</div>
              <div className="text-sm text-muted-foreground">Staking APR</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center shadow">
              <div className="text-3xl font-bold text-primary mb-1">$987M</div>
              <div className="text-sm text-muted-foreground">Total Value Locked</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center shadow">
              <div className="text-3xl font-bold text-primary mb-1">1,234,567</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(180px,1fr)]">
            {/* Feature 1 - Large */}
            <div className="bg-card border border-border rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all col-span-1 row-span-2 lg:col-span-2">
              <div>
                <div className="flex items-center mb-4">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mr-4">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15l4-4 4 4"/></svg>
                  </span>
                  <h3 className="text-2xl font-bold text-foreground">Real-time Network Analytics</h3>
                </div>
                <p className="text-muted-foreground text-lg">Live blockchain metrics, block times, and network health at a glance.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mr-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                </span>
                <h3 className="text-xl font-bold text-foreground">Advanced Staking</h3>
              </div>
              <p className="text-muted-foreground">Delegate, claim rewards, and compare validators with ease.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mr-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 9h8M8 13h6"/></svg>
                </span>
                <h3 className="text-xl font-bold text-foreground">Transaction Explorer</h3>
              </div>
              <p className="text-muted-foreground">Track every transaction and block with powerful search and filters.</p>
            </div>
            {/* Feature 4 - Tall */}
            <div className="bg-card border border-border rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all row-span-2">
              <div>
                <div className="flex items-center mb-4">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mr-4">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20"/></svg>
                  </span>
                  <h3 className="text-xl font-bold text-foreground">Validator Insights</h3>
                </div>
                <p className="text-muted-foreground">Compare, analyze, and choose the best validators for your needs.</p>
              </div>
            </div>
            {/* Feature 5 */}
            <div className="bg-card border border-border rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mr-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                </span>
                <h3 className="text-xl font-bold text-foreground">Secure & Fast</h3>
              </div>
              <p className="text-muted-foreground">Built on modern web tech for a smooth, secure, and responsive experience.</p>
            </div>
            {/* Feature 6 */}
            <div className="bg-card border border-border rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mr-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>
                </span>
                <h3 className="text-xl font-bold text-foreground">Open Source</h3>
              </div>
              <p className="text-muted-foreground">Transparent, community-driven, and open for contributions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <About />

      <CommunitySection></CommunitySection>

      {/* CTA Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-card border border-border rounded-3xl p-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Dive into the XORION Explorer and experience the next generation of blockchain analytics.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-primary/90 transition-all"
            onClick={() => navigate('/explorer')}
          >
            Launch XORION 
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;