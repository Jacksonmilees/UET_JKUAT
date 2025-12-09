import React from 'react';
import { Project } from '../types';
import { Clock, CheckCircle, Heart, ArrowRight, Users } from 'lucide-react';

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
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full"
      role="button"
      tabIndex={0}
      onClick={() => onCardClick(project.id)}
      onKeyDown={(e) => e.key === 'Enter' && onCardClick(project.id)}
    >
      {/* Image Section */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={project.featuredImage}
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-primary rounded-lg shadow-lg">
            {project.category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {isFunded ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-green-500 rounded-lg shadow-lg">
              <CheckCircle className="w-3.5 h-3.5" /> Funded
            </span>
          ) : hasEnded ? (
            <span className="px-3 py-1.5 text-xs font-bold text-white bg-gray-500 rounded-lg shadow-lg">
              Ended
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-black/60 backdrop-blur-sm rounded-lg">
              <Clock className="w-3.5 h-3.5" /> {daysLeft}d left
            </span>
          )}
        </div>

        {/* Hover Overlay with Quick Action */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 text-foreground font-medium rounded-lg shadow-lg">
              View Details <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-5 flex-grow flex flex-col">
        {/* Title */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-foreground mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description?.substring(0, 80)}...
          </p>
        </div>

        <div className="mt-auto space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                KES {project.currentAmount.toLocaleString()}
              </span>
              <span className={`text-sm font-bold ${isFunded ? 'text-green-500' : 'text-primary'}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  isFunded ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-primary to-orange-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Goal: KES {project.fundingGoal.toLocaleString()}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{project.donorCount || 0} backers</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onContributeClick(project)
              }}
              disabled={isFunded || hasEnded}
              className={`group/btn flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                isFunded || hasEnded
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:scale-105'
              }`}
            >
              {isFunded ? 'Funded' : hasEnded ? 'Ended' : 'Contribute'}
              {!isFunded && !hasEnded && (
                <Heart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;