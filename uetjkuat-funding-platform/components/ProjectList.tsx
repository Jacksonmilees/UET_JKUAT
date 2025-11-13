
import React from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import { IconChevronDown } from './icons';

interface ProjectListProps {
  projects: Project[];
  onContributeClick: (project: Project) => void;
  onCardClick: (projectId: number) => void;
  categories: string[];
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
    projects, 
    onContributeClick, 
    onCardClick,
    categories, 
    filterCategory, 
    setFilterCategory,
    sortOption,
    setSortOption
}) => {
  return (
    <section id="projects" className="py-16 md:py-24 bg-secondary-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-secondary-900">Active Projects</h2>
          <p className="text-lg text-secondary-600 mt-2 max-w-2xl mx-auto">Support a cause that matters to you. Each project is a step towards strengthening our community and faith.</p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button 
                key={category} 
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${filterCategory === category ? 'bg-primary-700 text-white shadow-md' : 'bg-white text-secondary-700 hover:bg-secondary-100 border border-secondary-200'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none bg-white border border-secondary-300 rounded-full px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-secondary-700"
              aria-label="Sort projects"
            >
              <option value="default">Sort by: Default</option>
              <option value="ending_soon">Ending Soon</option>
              <option value="raised_desc">Most Raised</option>
              <option value="raised_asc">Least Raised</option>
            </select>
            <IconChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 pointer-events-none" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} onContributeClick={onContributeClick} onCardClick={onCardClick} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectList;
