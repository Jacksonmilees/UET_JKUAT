import React from 'react';
import { Project } from '../types';
import { Clock, CheckCircle, Heart } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onContributeClick: (project: Project) => void;
  onCardClick: (projectId: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onContributeClick, onCardClick }) => {
  const progress = Math.min((project.currentAmount / project.fundingGoal) * 100, 100);
  const isFunded = progress >= 100;
  const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const hasEnded = daysLeft < 0;

  return (
    <div
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col h-full"
      role="button"
      tabIndex={0}
      onClick={() => onCardClick(project.id)}
      onKeyDown={(e) => e.key === 'Enter' && onCardClick(project.id)}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={project.featuredImage}
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary/90 backdrop-blur-sm rounded-md shadow-sm">
            {project.category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {isFunded ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-100/90 backdrop-blur-sm rounded-md border border-green-200">
              <CheckCircle className="w-3 h-3" /> Funded
            </span>
          ) : hasEnded ? (
            <span className="px-2.5 py-1 text-xs font-semibold text-muted-foreground bg-secondary/90 backdrop-blur-sm rounded-md border border-border">
              Ended
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-primary-foreground bg-black/50 backdrop-blur-sm rounded-md border border-white/10">
              <Clock className="w-3 h-3" /> {daysLeft} Days Left
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-5 flex-grow flex flex-col">
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-card-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>
        </div>

        <div className="mt-auto space-y-5">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${isFunded ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-end pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Raised</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">KES {project.currentAmount.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">/ {project.fundingGoal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onContributeClick(project)
              }}
              disabled={isFunded || hasEnded}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${isFunded || hasEnded
                ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md'
                }`}
            >
              <span className="flex items-center gap-2">
                {isFunded ? 'Funded' : hasEnded ? 'Ended' : 'Back Project'}
                {!isFunded && !hasEnded && <Heart className="w-4 h-4" />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;