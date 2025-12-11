
import React from 'react';
import HeroNew from '../components/HeroNew';
import SEO from '../components/SEO';
import { Route } from '../types';
import { useProjects } from '../contexts/ProjectContext';

interface HomePageProps {
  setRoute: (route: Route) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setRoute }) => {
  const { stats } = useProjects();

  return (
    <>
      <SEO
        title="Home"
        description="United Evangelical Team JKUAT - Join us in faith, fellowship, and service. Support our projects and make a difference in our community."
        keywords="UET JKUAT, Christian fellowship, JKUAT ministry, student organization, faith community, fundraising"
      />
      <HeroNew setRoute={setRoute} stats={stats} />
    </>
  );
};

export default HomePage;
