import React from 'react';
import { Project } from '../types';
import { Clock, CheckCircle, ArrowRight, Heart } from 'lucide-react';

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
      className="group relative bg-secondary-800 rounded-3xl overflow-hidden border border-secondary-700/50 hover:border-primary-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col h-full"
      role="button"
      tabIndex={0}
      onClick={() => onCardClick(project.id)}
      onKeyDown={(e) => e.key === 'Enter' && onCardClick(project.id)}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={project.featuredImage}
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/20 to-transparent opacity-90"></div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-950 bg-primary-400 rounded-full shadow-glow">
            {project.category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {isFunded ? (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-100 bg-emerald-900/80 backdrop-blur-md rounded-full border border-emerald-700">
              <CheckCircle className="w-3 h-3" /> Funded
            </span>
          ) : hasEnded ? (
            <span className="px-3 py-1 text-xs font-bold text-secondary-400 bg-secondary-900/80 backdrop-blur-md rounded-full border border-secondary-700">
              Ended
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-primary-100 bg-secondary-900/80 backdrop-blur-md rounded-full border border-secondary-700">
              <Clock className="w-3 h-3 text-primary-400" /> {daysLeft} Days Left
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-6 flex-grow flex flex-col -mt-12">
        {/* Title */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-primary-400 transition-colors">
            {project.title}
          </h3>
          <div className="h-1 w-12 bg-primary-500 rounded-full"></div>
        </div>

        <div className="mt-auto space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-secondary-300">Progress</span>
              <span className="text-primary-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-secondary-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${isFunded ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-600 to-primary-400'}`}
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer Effect */}
                {!isFunded && !hasEnded && (
                  <div className="w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ backgroundSize: '200% 100%' }}></div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-end border-t border-secondary-700/50 pt-4">
            <div>
              <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Raised</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">KES {project.currentAmount.toLocaleString()}</span>
                <span className="text-xs text-secondary-500">/ {project.fundingGoal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onContributeClick(project)
              }}
              disabled={isFunded || hasEnded}
              className={`group/btn relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden ${isFunded || hasEnded
                  ? 'bg-secondary-700 text-secondary-400 cursor-not-allowed'
                  : 'bg-primary-500 text-primary-950 hover:bg-primary-400 shadow-glow hover:shadow-glow-lg'
                }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isFunded ? 'Funded' : hasEnded ? 'Ended' : 'Back Project'}
                {!isFunded && !hasEnded && <Heart className="w-4 h-4 fill-current" />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;