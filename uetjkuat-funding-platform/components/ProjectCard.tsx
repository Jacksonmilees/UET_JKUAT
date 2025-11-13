
import React from 'react';
import { Project } from '../types';

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
        className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col group border border-secondary-200/50"
        role="button"
        tabIndex={0}
        onClick={() => onCardClick(project.id)}
        onKeyDown={(e) => e.key === 'Enter' && onCardClick(project.id)}
    >
      <div className="relative">
        <img src={project.featuredImage} alt={project.title} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <span className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Details</span>
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <span className="text-xs font-semibold text-primary-700 bg-primary-100 px-2 py-1 rounded-full self-start mb-3">{project.category}</span>
        <h3 className="text-xl font-serif font-bold text-secondary-800 mb-3 flex-grow">{project.title}</h3>
        
        <div className="mt-auto">
            <div className="w-full bg-secondary-200 rounded-full h-2 mb-2">
            <div 
                className={`h-2 rounded-full ${isFunded ? 'bg-green-500' : 'bg-primary-600'}`} 
                style={{ width: `${progress}%` }}
            ></div>
            </div>
            <div className="flex justify-between items-center text-sm text-secondary-500 mb-4">
              <span>{Math.round(progress)}% Funded</span>
              {isFunded ? (
                  <span className="font-semibold text-green-600">Goal Reached!</span>
              ) : hasEnded ? (
                  <span className="font-semibold text-secondary-500">Campaign Ended</span>
              ) : (
                  <span className="font-semibold text-red-600">{daysLeft} days left</span>
              )}
            </div>
            <div className="flex justify-between items-center text-sm">
              <div>
                  <span className="font-bold text-secondary-800 text-lg">KES {project.currentAmount.toLocaleString()}</span>
                  <span className="text-secondary-500"> of {project.fundingGoal.toLocaleString()}</span>
              </div>
              <button 
                  onClick={(e) => {
                      e.stopPropagation(); // prevent card click
                      onContributeClick(project)
                  }}
                  disabled={isFunded || hasEnded}
                  className={`px-4 py-2 rounded-md font-semibold text-white transition duration-300 z-10 ${isFunded || hasEnded ? 'bg-secondary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
              >
                  {isFunded ? 'Funded' : hasEnded ? 'Ended' : 'Contribute'}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;