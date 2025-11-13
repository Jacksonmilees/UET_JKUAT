

import React, { useState } from 'react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { useAI } from '../../contexts/AIContext';
import { IconEdit, IconSparkles, IconTrash } from '../icons';
import { Type } from '@google/genai';
import { Project } from '../../types';

interface ProjectManagementProps {
    onProjectEdit: (project: Project) => void;
    onProjectDelete: (project: Project) => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ onProjectEdit, onProjectDelete }) => {
    const { projects, addProject, categories } = useProjects();
    const { user } = useAuth();
    const { addNotification } = React.useContext(NotificationContext);
    const { isGenerating, generateContent } = useAI();
    const [aiTopic, setAITopic] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        longDescription: '',
        category: categories.filter(c => c !== 'All')[0] || '',
        fundingGoal: 100000,
        featuredImage: 'https://picsum.photos/seed/new_project/600/400',
        organizer: user?.name || 'Admin',
        impactStatement: '',
        durationDays: 30
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'fundingGoal' || name === 'durationDays' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.longDescription || !formData.impactStatement || formData.fundingGoal <= 0) {
            addNotification("Please fill all required fields.");
            return;
        }
        addProject(formData);
        addNotification(`Project "${formData.title}" created successfully!`);
        // Optionally reset form
    };
    
    const handleGenerateProjectContent = async () => {
        if (!aiTopic) {
            addNotification("Please enter a topic for AI generation.");
            return;
        }
        const prompt = `Generate content for a university christian union funding project. The topic is "${aiTopic}". The content should be inspiring and clear. Provide a title, a short description (around 20-30 words), a long description (around 60-80 words), and an impact statement (around 20-30 words).`;
        
        const projectSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "The catchy title of the project." },
                description: { type: Type.STRING, description: "A short, one-sentence description." },
                longDescription: { type: Type.STRING, description: "A more detailed paragraph about the project." },
                impactStatement: { type: Type.STRING, description: "A sentence describing the project's impact." }
            },
            required: ["title", "description", "longDescription", "impactStatement"]
        };

        const result = await generateContent(prompt, projectSchema);

        if (result) {
            try {
                const parsedResult = JSON.parse(result);
                setFormData(prev => ({
                    ...prev,
                    title: parsedResult.title || prev.title,
                    description: parsedResult.description || prev.description,
                    longDescription: parsedResult.longDescription || prev.longDescription,
                    impactStatement: parsedResult.impactStatement || prev.impactStatement,
                }));
                addNotification("AI content generated successfully!");
            } catch (e) {
                console.error("Failed to parse AI response:", e);
                addNotification("AI generated content in an unexpected format.");
            }
        }
    };

    const displayCategories = categories.filter(c => c !== 'All');

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Management</h2>
            
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg mb-6">
                 <h3 className="text-lg font-semibold text-indigo-800 mb-2 flex items-center">
                    <IconSparkles className="w-5 h-5 mr-2 text-indigo-600"/>
                    Generate with AI
                </h3>
                <p className="text-sm text-indigo-700 mb-3">
                    Don't know where to start? Just provide a topic, and we'll draft the project details for you.
                </p>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={aiTopic}
                        onChange={(e) => setAITopic(e.target.value)}
                        placeholder="e.g., Annual charity marathon"
                        className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button 
                        type="button" 
                        onClick={handleGenerateProjectContent}
                        disabled={isGenerating}
                        className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                         <IconSparkles className="w-4 h-4 mr-1.5"/>
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Create New Project</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <label className="block text-sm font-medium text-gray-700">Organizer</label>
                        <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Campaign Duration (days)</label>
                        <input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Featured Image URL</label>
                        <input type="text" name="featuredImage" value={formData.featuredImage} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div className="md:col-span-2 text-right">
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
             <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Projects ({projects.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {projects.map(p => (
                        <div key={p.id} className="bg-white p-3 rounded-md shadow-sm border flex justify-between items-center">
                            <div>
                               <p className="font-semibold text-gray-800">{p.title}</p>
                               <p className="text-sm text-gray-500">{p.category} - KES {p.currentAmount.toLocaleString()} / {p.fundingGoal.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-2.5 bg-gray-200 rounded-full">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(p.currentAmount / p.fundingGoal) * 100}%`}}></div>
                                </div>
                                <button onClick={() => onProjectEdit(p)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                    <IconEdit className="w-4 h-4" />
                                </button>
                                <button onClick={() => onProjectDelete(p)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                                    <IconTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectManagement;