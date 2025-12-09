
import React, { useState } from 'react';
import HeroNew from '../components/HeroNew';
import ProjectList from '../components/ProjectList';
import ContributionModal from '../components/ContributionModal';
import { Project, Route } from '../types';
import { useProjects } from '../contexts/ProjectContext';

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
    filteredAndSortedProjects,
    isLoading,
    refreshProjects
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
      <HeroNew setRoute={setRoute} stats={stats} />
      <ProjectList 
        projects={filteredAndSortedProjects} 
        onContributeClick={handleOpenContributeModal}
        onCardClick={handleCardClick}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        sortOption={sortOption}
        setSortOption={setSortOption}
        isLoading={isLoading}
        onRefresh={refreshProjects}
      />
      <ContributionModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseContributeModal}
      />
    </>
  );
};

export default HomePage;
