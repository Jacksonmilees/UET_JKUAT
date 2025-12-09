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

  // Filter to show only active projects
  const activeProjects = filteredAndSortedProjects.filter(
    (project) => project.status === 'active' || project.status === 'ongoing'
  );

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
        {/* Project List - Active Projects Only */}
        <ProjectList 
          projects={activeProjects} 
          onContributeClick={handleOpenContributeModal}
          onCardClick={handleCardClick}
          categories={categories}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          sortOption={sortOption}
          setSortOption={setSortOption}
          isLoading={isLoading}
          onRefresh={refreshProjects}
          hideHeader={true}
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
