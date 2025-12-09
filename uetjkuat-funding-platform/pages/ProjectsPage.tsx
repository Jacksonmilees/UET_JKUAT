import React, { useState } from 'react';
import ProjectList from '../components/ProjectList';
import ContributionModal from '../components/ContributionModal';
import { Project, Route } from '../types';
import { useProjects } from '../contexts/ProjectContext';

interface ProjectsPageProps {
  setRoute: (route: Route) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ setRoute }) => {
  const { 
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
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our initiatives and contribute to causes that matter. 
            Every contribution helps us make a difference.
          </p>
          <div className="h-1 w-24 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Project List */}
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

        {/* Contribution Modal */}
        <ContributionModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={handleCloseContributeModal}
        />
      </div>
    </div>
  );
};

export default ProjectsPage;
