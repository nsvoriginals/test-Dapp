import React from 'react';

const LandingHero = ({ navigate }) => (
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
      <div className="flex flex-wrap justify-center gap-3 mt-12 max-w-3xl mx-auto">
        {[
          "Real-time Transaction Tracking",
          "Advanced Block Analysis", 
          "Address Monitoring",
          "Smart Contract Insights"
        ].map((feature, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-4 py-2 bg-card/80 backdrop-blur-sm text-foreground text-sm font-medium rounded-full border border-border shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
            {feature}
          </span>
        ))}
      </div>
    </div>
  </section>
);
export default LandingHero; 