

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { useNews } from '../contexts/NewsContext';
import UserManagement from '../components/admin/UserManagement';
import ProjectManagement from '../components/admin/ProjectManagement';
import NewsManagement from '../components/admin/NewsManagement';
import FinanceDashboard from '../components/admin/FinanceDashboard';
import EditProjectModal from '../components/admin/EditProjectModal';
import EditNewsModal from '../components/admin/EditNewsModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Route, Project, NewsArticle, User } from '../types';
import { IconFilePlus, IconNewspaper, IconUserShield } from '../components/icons';

interface AdminPageProps {
  setRoute: (route: Route) => void;
}

type AdminTab = 'users' | 'projects' | 'news' | 'finance';
type DeletableItem = { type: 'user' | 'project' | 'news', id: number, name: string };

const AdminPage: React.FC<AdminPageProps> = ({ setRoute }) => {
  const { user, deleteUser } = useAuth();
  const { deleteProject } = useProjects();
  const { deleteArticle } = useNews();
  const [activeTab, setActiveTab] = useState<AdminTab>('finance');

  // Modal states
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [newsToEdit, setNewsToEdit] = useState<NewsArticle | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DeletableItem | null>(null);

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-6">You do not have permission to view this page.</p>
        <button onClick={() => setRoute({ page: 'home' })} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
          Go to Homepage
        </button>
      </div>
    );
  }

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    switch (itemToDelete.type) {
      case 'user':
        deleteUser(itemToDelete.id);
        break;
      case 'project':
        deleteProject(itemToDelete.id);
        break;
      case 'news':
        deleteArticle(itemToDelete.id);
        break;
    }
    setItemToDelete(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement onUserDelete={(user: User) => setItemToDelete({ type: 'user', id: user.id, name: user.name })} />;
      case 'projects':
        return <ProjectManagement onProjectEdit={setProjectToEdit} onProjectDelete={(project: Project) => setItemToDelete({ type: 'project', id: project.id, name: project.title })} />;
      case 'news':
        return <NewsManagement onArticleEdit={setNewsToEdit} onArticleDelete={(article: NewsArticle) => setItemToDelete({ type: 'news', id: article.id, name: article.title })} />;
      default:
        return null;
    }
  }

  const tabs: { id: AdminTab, name: string, icon: React.ReactNode }[] = [
    { id: 'users', name: 'User Management', icon: <IconUserShield className="w-5 h-5 mr-2" /> },
    { id: 'projects', name: 'Project Management', icon: <IconFilePlus className="w-5 h-5 mr-2" /> },
    { id: 'news', name: 'News Management', icon: <IconNewspaper className="w-5 h-5 mr-2" /> },
    { id: 'finance', name: 'Finance', icon: <IconNewspaper className="w-5 h-5 mr-2" /> },
  ];

  return (
    <>
      <div className="bg-gray-100 min-h-full">
        <div className="container mx-auto px-6 py-12">
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-lg text-gray-600">Manage your platform content and users.</p>
          </header>

          <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/4">
              <nav className="sticky top-24 bg-white p-4 rounded-lg shadow-md">
                <ul className="space-y-2">
                  {tabs.map(tab => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-md font-semibold transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        {tab.icon}
                        {tab.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
            <main className="flex-1">
              <div className="bg-white p-8 rounded-lg shadow-md min-h-[600px]">
                {activeTab === 'finance' ? <FinanceDashboard /> : renderTabContent()}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProjectModal
        isOpen={!!projectToEdit}
        onClose={() => setProjectToEdit(null)}
        project={projectToEdit}
      />
      <EditNewsModal
        isOpen={!!newsToEdit}
        onClose={() => setNewsToEdit(null)}
        article={newsToEdit}
      />
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${itemToDelete?.type}`}
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default AdminPage;