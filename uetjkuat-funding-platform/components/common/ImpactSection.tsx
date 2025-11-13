
import React from 'react';
import { IconTarget, IconTrendingUp, IconUsers } from '../icons';

interface ImpactSectionProps {
  stats: {
    totalRaised: number;
    projectsFunded: number;
    totalContributors: number; 
  }
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center">
        <div className="bg-primary-100 text-primary-600 p-4 rounded-full mb-4">
            {icon}
        </div>
        <p className="text-3xl font-bold font-serif text-secondary-800 mb-1">{value}</p>
        <p className="text-secondary-500 font-medium">{label}</p>
    </div>
);

const ImpactSection: React.FC<ImpactSectionProps> = ({ stats }) => {
  const scrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-serif font-bold text-secondary-900 mb-4">
            Welcome to Our Community
          </h2>
          <p className="text-lg text-secondary-600 leading-relaxed">
            We are a fellowship united by faith, dedicated to spiritual growth and making a positive impact on our campus and beyond. This platform is where our mission comes to life through community-supported projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <StatCard 
              icon={<IconTrendingUp className="w-8 h-8"/>}
              label="Total Funds Raised" 
              value={`KES ${stats.totalRaised.toLocaleString()}`}
          />
          <StatCard 
              icon={<IconTarget className="w-8 h-8"/>}
              label="Projects Funded" 
              value={stats.projectsFunded.toString()}
          />
          <StatCard 
              icon={<IconUsers className="w-8 h-8"/>}
              label="Total Contributors" 
              value={stats.totalContributors.toLocaleString()}
          />
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
