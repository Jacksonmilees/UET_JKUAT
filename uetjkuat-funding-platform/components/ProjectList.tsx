import React, { useState } from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import { ChevronDown, Filter, RefreshCw } from 'lucide-react';

// Skeleton Card Component
const ProjectCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
    {/* Image skeleton */}
    <div className="h-52 bg-secondary/60" />
    
    {/* Content skeleton */}
    <div className="p-5 space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-5 bg-secondary/60 rounded-lg w-3/4" />
        <div className="h-4 bg-secondary/40 rounded-lg w-full" />
        <div className="h-4 bg-secondary/40 rounded-lg w-2/3" />
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-secondary/60 rounded w-20" />
          <div className="h-4 bg-secondary/60 rounded w-12" />
        </div>
        <div className="h-2.5 bg-secondary/40 rounded-full" />
        <div className="h-3 bg-secondary/40 rounded w-28" />
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="h-4 bg-secondary/40 rounded w-20" />
        <div className="h-10 bg-secondary/60 rounded-xl w-28" />
      </div>
    </div>
  </div>
);

interface ProjectListProps {
  projects: Project[];
  onContributeClick: (project: Project) => void;
  onCardClick: (projectId: number) => void;
  categories: string[];
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onContributeClick,
  onCardClick,
  categories,
  filterCategory,
  setFilterCategory,
  sortOption,
  setSortOption,
  isLoading = false,
  onRefresh
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <section id="projects" className="py-16 md:py-24 bg-background relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Active Projects</h2>
            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={refreshing || isLoading}
                className="p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
                title="Refresh projects"
              >
                <RefreshCw className={`w-5 h-5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support a cause that matters to you. Each project is a step towards strengthening our community and faith.
          </p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6 bg-secondary/30 p-4 rounded-xl border border-border">

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            <div className="flex items-center gap-2 text-muted-foreground mr-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Filter:</span>
            </div>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${filterCategory === category
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-muted-foreground hover:bg-secondary hover:text-foreground border border-border'
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
              className="appearance-none bg-background text-foreground border border-border rounded-lg px-5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium cursor-pointer hover:bg-secondary/50 transition-colors"
              aria-label="Sort projects"
            >
              <option value="default">Sort by: Default</option>
              <option value="ending_soon">Ending Soon</option>
              <option value="raised_desc">Most Raised</option>
              <option value="raised_asc">Least Raised</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Show skeleton cards while loading
            <>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <ProjectCardSkeleton key={i} />
              ))}
            </>
          ) : (
            projects.map(project => (
              <ProjectCard key={project.id} project={project} onContributeClick={onContributeClick} onCardClick={onCardClick} />
            ))
          )}
        </div>

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No projects found matching your criteria.</p>
            <button
              onClick={() => setFilterCategory('All')}
              className="mt-4 text-primary hover:text-primary/80 font-medium underline"
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
