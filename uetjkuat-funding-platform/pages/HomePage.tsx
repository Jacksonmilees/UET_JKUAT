
import React, { useState } from 'react';
import Hero from '../components/Hero';
import ProjectList from '../components/ProjectList';
import About from '../components/About';
import ContributionModal from '../components/ContributionModal';
import { Project, Route } from '../types';
import { useProjects } from '../contexts/ProjectContext';
import NewsPreview from '../components/common/NewsPreview';
import ImpactSection from '../components/common/ImpactSection';

interface HomePageProps {
  setRoute: (route: Route) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setRoute }) => {
  const { 
    stats, 
    categories,
    filterCategory,
    setFilterCategory,
    sortOption,
    setSortOption,
    filteredAndSortedProjects
  } = useProjects();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenContributeModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseContributeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleCardClick = (projectId: number) => {
      setRoute({ page: 'projectDetail', params: { id: projectId } });
  }

  return (
    <>
      <Hero />
      <ImpactSection stats={stats} />
      <ProjectList 
        projects={filteredAndSortedProjects} 
        onContributeClick={handleOpenContributeModal}
        onCardClick={handleCardClick}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />
      <NewsPreview setRoute={setRoute} />
      <About />
      <ContributionModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseContributeModal}
      />
    </>
  );
};

export default HomePage;
