import React from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import { ChevronDown, Filter } from 'lucide-react';

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
    <section id="projects" className="py-16 md:py-24 bg-secondary-950 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Active Projects</h2>
          <p className="text-lg text-secondary-400 max-w-2xl mx-auto">
            Support a cause that matters to you. Each project is a step towards strengthening our community and faith.
          </p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6 bg-secondary-900/50 p-4 rounded-2xl border border-secondary-800 backdrop-blur-sm">

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            <div className="flex items-center gap-2 text-secondary-400 mr-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Filter:</span>
            </div>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${filterCategory === category
                    ? 'bg-primary-500 text-primary-950 shadow-glow'
                    : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700 hover:text-secondary-200 border border-secondary-700'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative group">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none bg-secondary-800 text-secondary-200 border border-secondary-700 rounded-xl px-5 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 font-medium cursor-pointer hover:bg-secondary-700 transition-colors"
              aria-label="Sort projects"
            >
              <option value="default">Sort by: Default</option>
              <option value="ending_soon">Ending Soon</option>
              <option value="raised_desc">Most Raised</option>
              <option value="raised_asc">Least Raised</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none group-hover:text-primary-400 transition-colors" />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} onContributeClick={onContributeClick} onCardClick={onCardClick} />
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-secondary-500 text-lg">No projects found matching your criteria.</p>
            <button
              onClick={() => setFilterCategory('All')}
              className="mt-4 text-primary-400 hover:text-primary-300 font-medium underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectList;
