
import React, { useState } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import ContributionModal from '../components/ContributionModal';
import { Project, Route } from '../types';
import ShareCard from '../components/common/ShareCard';

interface ProjectDetailPageProps {
  projectId: number;
  setRoute: (route: Route) => void;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId, setRoute }) => {
  const { getProjectById } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const project = getProjectById(projectId);

  if (!project) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <p className="mb-6">The project you are looking for does not exist.</p>
        <button onClick={() => setRoute({ page: 'home' })} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
          Back to Projects
        </button>
      </div>
    );
  }
  
  const progress = Math.min((project.currentAmount / project.fundingGoal) * 100, 100);
  const isFunded = progress >= 100;
  const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const hasEnded = daysLeft < 0;

  return (
    <>
      <div className="bg-white">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => setRoute({ page: 'home' })} className="text-blue-600 hover:underline mb-4">&larr; Back to all projects</button>
            <span className="block text-sm font-semibold text-blue-600 uppercase">{project.category}</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mt-2">{project.title}</h1>
            <p className="text-lg text-gray-500 mt-2">by {project.organizer}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <img src={project.featuredImage} alt={project.title} className="w-full h-auto object-cover rounded-lg shadow-lg mb-8" />
              
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-800">About this project</h2>
                <p>{project.longDescription}</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8">Impact</h2>
                <p>{project.impactStatement}</p>
              </div>

              {/* Updates */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Updates</h2>
                <div className="space-y-6 border-l-2 border-gray-200 pl-6">
                  {project.updates.length > 0 ? project.updates.map((update, index) => (
                    <div key={index} className="relative">
                       <div className="absolute -left-[33px] top-1.5 w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
                       <p className="text-sm text-gray-500">{new Date(update.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                       <p className="text-gray-700 mt-1">{update.description}</p>
                    </div>
                  )) : (
                    <p className="text-gray-500">No updates have been posted for this project yet.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                        className={`h-2.5 rounded-full ${isFunded ? 'bg-green-500' : 'bg-blue-600'}`} 
                        style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-800">KES {project.currentAmount.toLocaleString()}</span>
                    <span className="text-gray-500"> raised of KES {project.fundingGoal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-md text-gray-600 mb-6">
                      <span><span className="font-bold">{project.contributors.length}</span> contributors</span>
                      {isFunded ? (
                          <span className="font-semibold text-green-600">Goal Reached!</span>
                      ) : hasEnded ? (
                          <span className="font-semibold text-gray-500">Campaign Ended</span>
                      ) : (
                          <span><span className="font-bold">{daysLeft}</span> days left</span>
                      )}
                  </div>

                  <button 
                    onClick={() => setIsModalOpen(true)}
                    disabled={isFunded || hasEnded}
                    className={`w-full py-3 rounded-md font-bold text-lg text-white transition duration-300 ${isFunded || hasEnded ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isFunded ? 'Funded' : hasEnded ? 'Ended' : 'Contribute Now'}
                  </button>
                </div>

                <ShareCard project={project}/>

                {/* Recent Contributors */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Contributors</h3>
                    <div className="space-y-4">
                        {project.contributors.length > 0 ? project.contributors.slice(0, 5).map((c, i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full bg-gray-200"/>
                                <span className="font-medium text-gray-700">{c.name}</span>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500">Be the first to contribute!</p>
                        )}
                    </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
      <ContributionModal 
        project={project}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ProjectDetailPage;