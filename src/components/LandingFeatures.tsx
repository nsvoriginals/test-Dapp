import React from 'react';

const LandingFeatures = () => (
  <section id="features" className="py-8 px-4 sm:px-6 lg:px-8 bg-background">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">Powerful Features</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-card rounded-xl p-6 flex flex-col items-center text-center shadow">
          <div className="text-3xl font-bold text-primary mb-1">297</div>
          <div className="text-sm text-muted-foreground">Validators Online</div>
        </div>
        <div className="bg-card rounded-xl p-6 flex flex-col items-center text-center shadow">
          <div className="text-3xl font-bold text-primary mb-1">13.2%</div>
          <div className="text-sm text-muted-foreground">Staking APR</div>
        </div>
        <div className="bg-card rounded-xl p-6 flex flex-col items-center text-center shadow">
          <div className="text-3xl font-bold text-primary mb-1">$987M</div>
          <div className="text-sm text-muted-foreground">Total Value Locked</div>
        </div>
        <div className="bg-card rounded-xl p-6 flex flex-col items-center text-center shadow">
          <div className="text-3xl font-bold text-primary mb-1">1,234,567</div>
          <div className="text-sm text-muted-foreground">Transactions</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(180px,1fr)]">
        <div className="bg-card rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all col-span-1 row-span-2 lg:col-span-2">
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
        <div className="bg-card rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all">
          <div className="flex items-center mb-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mr-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </span>
            <h3 className="text-xl font-bold text-foreground">Advanced Staking</h3>
          </div>
          <p className="text-muted-foreground">Delegate, claim rewards, and compare validators with ease.</p>
        </div>
        <div className="bg-card rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all">
          <div className="flex items-center mb-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mr-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 9h8M8 13h6"/></svg>
            </span>
            <h3 className="text-xl font-bold text-foreground">Transaction Explorer</h3>
          </div>
          <p className="text-muted-foreground">Track every transaction and block with powerful search and filters.</p>
        </div>
        <div className="bg-card rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all row-span-2">
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
        <div className="bg-card rounded-xl shadow p-8 flex flex-col justify-between hover:bg-primary/5 transition-all">
          <div className="flex items-center mb-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mr-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            </span>
            <h3 className="text-xl font-bold text-foreground">Secure & Fast</h3>
          </div>
          <p className="text-muted-foreground">Built for performance, security, and reliability.</p>
        </div>
      </div>
    </div>
  </section>
);
export default LandingFeatures; 