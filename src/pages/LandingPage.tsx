import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "next-themes";
import Footer from '@/components/Footer';
import About from '@/components/About';
import CommunitySection from '@/components/Community';
import LandingNavbar from '@/components/LandingNavbar';
import LandingHero from '@/components/LandingHero';
import LandingFeatures from '@/components/LandingFeatures';

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navItems={navItems}
        handleNavClick={handleNavClick}
        navigate={navigate}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className="pb-[86px] md:pb-[98px] lg:pb-[130px]"></div>
      <LandingHero navigate={navigate} />
      <LandingFeatures />
      <About />
      <CommunitySection />
      <Footer />
    </div>
  );
};

export default LandingPage;