import React from 'react';
import { Target, TrendingUp, Users } from 'lucide-react';

interface ImpactSectionProps {
  stats: {
    totalRaised: number;
    projectsFunded: number;
    totalContributors: number;
  }
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; delay: string }> = ({ icon, label, value, delay }) => (
  <div
    className="flex flex-col items-center text-center p-8 bg-secondary-800/50 rounded-3xl border border-secondary-700 hover:border-primary-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] group"
    style={{ animationDelay: delay }}
  >
    <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-500/20 transition-colors duration-300 group-hover:scale-110 transform">
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-8 h-8 text-primary-500" })}
    </div>
    <p className="text-4xl font-bold font-serif text-white mb-2 tracking-tight group-hover:text-primary-400 transition-colors">
      {value}
    </p>
    <p className="text-secondary-400 font-medium uppercase tracking-wider text-sm">{label}</p>
  </div>
);

const ImpactSection: React.FC<ImpactSectionProps> = ({ stats }) => {
  return (
    <section className="bg-secondary-950 py-16 md:py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Welcome to Our Community
          </h2>
          <p className="text-lg text-secondary-400 leading-relaxed">
            We are a fellowship united by faith, dedicated to spiritual growth and making a positive impact on our campus and beyond. This platform is where our mission comes to life through community-supported projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard
            icon={<TrendingUp />}
            label="Total Funds Raised"
            value={`KES ${stats.totalRaised.toLocaleString()}`}
            delay="0ms"
          />
          <StatCard
            icon={<Target />}
            label="Projects Funded"
            value={stats.projectsFunded.toString()}
            delay="100ms"
          />
          <StatCard
            icon={<Users />}
            label="Total Contributors"
            value={stats.totalContributors.toLocaleString()}
            delay="200ms"
          />
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
