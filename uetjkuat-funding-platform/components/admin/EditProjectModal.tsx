

import React, { useState, useEffect, useContext } from 'react';
import { Project } from '../../types';
import { IconClose } from '../icons';
import { useProjects } from '../../contexts/ProjectContext';
import { NotificationContext } from '../../contexts/NotificationContext';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, isOpen, onClose }) => {
  const [formData, setFormData] = useState<Project | null>(null);
  const { updateProject, categories } = useProjects();
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    setFormData(project);
  }, [project]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: name === 'fundingGoal' || name === 'currentAmount' ? Number(value) : value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    updateProject(formData);
    addNotification(`Project "${formData.title}" updated successfully!`);
    onClose();
  };
  
  const displayCategories = categories.filter(c => c !== 'All');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full relative transform transition-all duration-300 animate-scale-in max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <IconClose className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Project</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Project Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Long Description</label>
                <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
            </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Impact Statement</label>
                <textarea name="impactStatement" value={formData.impactStatement} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    {displayCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Funding Goal (KES)</label>
                <input type="number" name="fundingGoal" value={formData.fundingGoal} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Current Amount (KES)</label>
                <input type="number" name="currentAmount" value={formData.currentAmount} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Organizer</label>
                <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Featured Image URL</label>
                <input type="text" name="featuredImage" value={formData.featuredImage} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2 text-right mt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="mr-3 px-6 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;