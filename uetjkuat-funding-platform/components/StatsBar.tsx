
import React from 'react';
import { IconTarget, IconTrendingUp, IconUsers } from './icons';

interface StatsBarProps {
  totalRaised: number;
  projectsFunded: number;
  totalContributors: number; 
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex items-center space-x-4">
        <div className="bg-primary-100 text-primary-600 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-secondary-500 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold font-serif text-secondary-800">{value}</p>
        </div>
    </div>
);

const StatsBar: React.FC<StatsBarProps> = ({ totalRaised, projectsFunded, totalContributors }) => {
  return (
    <div className="bg-secondary-100">
        <div className="container mx-auto px-6">
            <div className="relative -mt-16 z-10 p-6 md:p-8 bg-white rounded-xl shadow-lg border border-secondary-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-secondary-200">
                    <div className="flex justify-center">
                        <StatCard 
                            icon={<IconTrendingUp className="w-6 h-6"/>}
                            label="Total Funds Raised" 
                            value={`KES ${totalRaised.toLocaleString()}`}
                        />
                    </div>
                    <div className="flex justify-center">
                        <StatCard 
                            icon={<IconTarget className="w-6 h-6"/>}
                            label="Projects Funded" 
                            value={projectsFunded.toString()}
                        />
                    </div>
                     <div className="flex justify-center">
                        <StatCard 
                            icon={<IconUsers className="w-6 h-6"/>}
                            label="Total Contributors" 
                            value={totalContributors.toLocaleString()}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StatsBar;