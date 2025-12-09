
import React from 'react';
import HeroNew from '../components/HeroNew';
import { Route } from '../types';
import { useProjects } from '../contexts/ProjectContext';

interface HomePageProps {
  setRoute: (route: Route) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setRoute }) => {
  const { stats } = useProjects();

  return (
    <>
      <HeroNew setRoute={setRoute} stats={stats} />
    </>
  );
};

export default HomePage;
