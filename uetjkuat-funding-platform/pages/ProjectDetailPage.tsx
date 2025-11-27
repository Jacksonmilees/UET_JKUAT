import React, { useState } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import ContributionModal from '../components/ContributionModal';
import { Project, Route } from '../types';
import ShareCard from '../components/common/ShareCard';
import { IconArrowUp, IconCheckCircle, IconClock, IconUsers, IconTarget } from '../components/icons';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Project Not Found</h2>
          <p className="mb-8 text-gray-600">The project you are looking for does not exist.</p>
          <button 
            onClick={() => setRoute({ page: 'home' })} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-lg transform hover:scale-105 transition-all"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }
  
  const progress = Math.min((project.currentAmount / project.fundingGoal) * 100, 100);
  const isFunded = progress >= 100;
  const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const hasEnded = daysLeft < 0;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-6">
            <button 
              onClick={() => setRoute({ page: 'home' })} 
              className="text-white hover:text-blue-200 mb-6 flex items-center gap-2 font-semibold transition-colors"
            >
              ← Back to all projects
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full">
                {project.category}
              </span>
              {isFunded && (
                <span className="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1">
                  <IconCheckCircle className="w-4 h-4" /> Fully Funded
                </span>
              )}
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">{project.title}</h1>
            <p className="text-xl text-blue-100 mb-2">by {project.organizer}</p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured Image */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <img 
                  src={project.featuredImage} 
                  alt={project.title} 
                  className="w-full h-auto object-cover" 
                />
              </div>
              
              {/* About Section */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-4xl">📖</span>
                  About this project
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{project.longDescription}</p>
              </div>

              {/* Impact Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl p-8 border-2 border-green-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-4xl">🌟</span>
                  Impact
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">{project.impactStatement}</p>
              </div>

              {/* Updates Timeline */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                  <span className="text-4xl">📢</span>
                  Project Updates
                </h2>
                <div className="space-y-6 border-l-4 border-blue-600 pl-8 ml-2">
                  {project.updates.length > 0 ? project.updates.map((update, index) => (
                    <div key={index} className="relative">
                       <div className="absolute -left-[42px] top-2 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                       <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                         <p className="text-sm font-bold text-blue-600 mb-2">
                           {new Date(update.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                         </p>
                         <p className="text-gray-700 leading-relaxed">{update.description}</p>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 text-lg">No updates have been posted for this project yet. Check back soon! 🔔</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Funding Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100">
                  <div className="mb-6">
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-3">
                        <div 
                          className={`h-4 rounded-full transition-all duration-1000 ${isFunded ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="absolute -top-1 rounded-full w-6 h-6 bg-white shadow-lg border-3 border-blue-600" style={{ left: `calc(${progress}% - 12px)` }}></div>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">{Math.round(progress)}% Funded</p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-5xl font-extrabold text-gray-800 mb-2">
                      KES {project.currentAmount.toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-lg">
                      raised of <span className="font-bold">KES {project.fundingGoal.toLocaleString()}</span>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <IconUsers className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-800">{project.contributors.length}</p>
                      <p className="text-xs text-gray-600">Contributors</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <IconClock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-800">
                        {isFunded ? '✓' : hasEnded ? '0' : daysLeft}
                      </p>
                      <p className="text-xs text-gray-600">
                        {isFunded ? 'Funded' : hasEnded ? 'Ended' : 'Days Left'}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsModalOpen(true)}
                    disabled={isFunded || hasEnded}
                    className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 shadow-lg transform hover:scale-105 ${
                      isFunded || hasEnded 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl'
                    }`}
                  >
                    {isFunded ? '✓ Fully Funded' : hasEnded ? 'Campaign Ended' : 'Contribute Now 💝'}
                  </button>
                </div>

                {/* Share Card */}
                <ShareCard project={project}/>

                {/* Recent Contributors */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <IconUsers className="w-6 h-6 text-blue-600" />
                    Recent Contributors
                  </h3>
                  <div className="space-y-4">
                    {project.contributors.length > 0 ? project.contributors.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                        <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full bg-gray-200 border-2 border-blue-200"/>
                        <span className="font-semibold text-gray-700">{c.name}</span>
                      </div>
                    )) : (
                      <div className="text-center py-8 bg-blue-50 rounded-xl">
                        <p className="text-sm text-gray-600">Be the first to contribute! 🌟</p>
                      </div>
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
