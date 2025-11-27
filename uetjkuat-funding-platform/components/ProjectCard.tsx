
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
        className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 flex flex-col group border-2 border-transparent hover:border-blue-200 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => onCardClick(project.id)}
        onKeyDown={(e) => e.key === 'Enter' && onCardClick(project.id)}
    >
      <div className="relative overflow-hidden">
        <img src={project.featuredImage} alt={project.title} className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
            <span className="text-white text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0 bg-blue-600 px-6 py-3 rounded-xl shadow-lg">View Details →</span>
        </div>
        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            {project.category}
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col bg-gradient-to-b from-white to-gray-50">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex-grow group-hover:text-blue-600 transition-colors">{project.title}</h3>
        
        <div className="mt-auto space-y-4">
            <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${isFunded ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`} 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="absolute -top-1 rounded-full w-5 h-5 bg-white shadow-lg border-2 border-blue-600 transition-all duration-1000" style={{ left: `calc(${progress}% - 10px)` }}></div>
            </div>
            
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-700">{Math.round(progress)}% Funded</span>
              {isFunded ? (
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">✓ Goal Reached!</span>
              ) : hasEnded ? (
                  <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Campaign Ended</span>
              ) : (
                  <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">⏰ {daysLeft} days left</span>
              )}
            </div>
            
            <div className="flex justify-between items-end gap-4">
              <div>
                  <p className="text-xs text-gray-500 mb-1">Raised</p>
                  <p className="font-extrabold text-gray-800 text-xl">KES {project.currentAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">of KES {project.fundingGoal.toLocaleString()}</p>
              </div>
              <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      onContributeClick(project)
                  }}
                  disabled={isFunded || hasEnded}
                  className={`px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 z-10 shadow-lg transform hover:scale-105 ${
                      isFunded || hasEnded 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
                  }`}
              >
                  {isFunded ? '✓ Funded' : hasEnded ? 'Ended' : 'Contribute 💝'}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;