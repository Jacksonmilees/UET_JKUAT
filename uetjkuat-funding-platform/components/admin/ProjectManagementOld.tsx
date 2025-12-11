
import React, { useState, useRef, useEffect } from 'react';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { useAI } from '../../contexts/AIContext';
import { Edit2, Sparkles, Trash2, Plus, Image as ImageIcon, Calendar, DollarSign, Target, Upload, Loader2, CreditCard, Search, X, User, Clock, Eye, EyeOff } from 'lucide-react';
import { Type } from '@google/genai';
import { Project } from '../../types';
import api from '../../services/api';
import { ProjectCardSkeleton } from '../ui/Skeleton';

interface ProjectManagementProps {
    onProjectEdit: (project: Project) => void;
    onProjectDelete: (project: Project) => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ onProjectEdit, onProjectDelete }) => {
    const { projects, addProject, categories, isLoading } = useProjects();
    const { user } = useAuth();
    const { addNotification } = React.useContext(NotificationContext);
    const { isGenerating, generateContent } = useAI();
    const [aiTopic, setAITopic] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        longDescription: '',
        category: categories.filter(c => c !== 'All')[0] || '',
        fundingGoal: 100000,
        featuredImage: '',
        organizer: user?.name || 'Admin',
        impactStatement: '',
        durationDays: 30,
        accountNumber: '', // For tracking donations to specific account
        visibility: 'public' as 'public' | 'private', // Public by default
    });

    // Search filtering effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredProjects(projects);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = projects.filter(p =>
            p.title?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query) ||
            p.organizer?.toLowerCase().includes(query) ||
            p.impactStatement?.toLowerCase().includes(query)
        );
        setFilteredProjects(filtered);
    }, [searchQuery, projects]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'fundingGoal' || name === 'durationDays' ? Number(value) : value }));
    };

    // Convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const base64 = await fileToBase64(file);
            setFormData(prev => ({ ...prev, featuredImage: base64 }));
            addNotification('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            addNotification('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.longDescription || !formData.impactStatement || formData.fundingGoal <= 0) {
            addNotification("Please fill all required fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            await addProject(formData);
            addNotification(`Project "${formData.title}" created successfully!`);
            // Reset form
            setFormData({
                title: '',
                description: '',
                longDescription: '',
                category: categories.filter(c => c !== 'All')[0] || '',
                fundingGoal: 100000,
                featuredImage: '',
                organizer: user?.name || 'Admin',
                impactStatement: '',
                durationDays: 30,
                accountNumber: '',
                visibility: 'public',
            });
        } catch (error) {
            addNotification('Failed to create project');
        } finally {
            setIsSubmitting(false);
        }
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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Project Management</h2>
                <div className="text-sm text-muted-foreground">
                    {projects.length} Active Projects
                </div>
            </div>

            {/* AI Generation Section */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Generate with AI
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Don't know where to start? Just provide a topic, and we'll draft the project details for you.
                </p>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={aiTopic}
                        onChange={(e) => setAITopic(e.target.value)}
                        placeholder="e.g., Annual charity marathon"
                        className="flex-grow block w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                    />
                    <button
                        type="button"
                        onClick={handleGenerateProjectContent}
                        disabled={isGenerating}
                        className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Project Form */}
                <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create New Project
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Project Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" placeholder="Enter project title" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Short Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" placeholder="Brief summary"></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Long Description</label>
                                <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" placeholder="Detailed explanation"></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Impact Statement</label>
                                <textarea name="impactStatement" value={formData.impactStatement} onChange={handleChange} rows={2} className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" placeholder="What will this achieve?"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm">
                                    {displayCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Funding Goal (KES)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-muted-foreground sm:text-sm">KES</span>
                                    </div>
                                    <input type="number" name="fundingGoal" value={formData.fundingGoal} onChange={handleChange} className="block w-full pl-12 rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Organizer</label>
                                <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Duration (days)</label>
                                <input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Visibility</label>
                                <select name="visibility" value={formData.visibility} onChange={handleChange} className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm">
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Featured Image</label>
                                <div className="flex gap-2">
                                    <input type="text" name="featuredImage" value={formData.featuredImage} onChange={handleChange} className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" placeholder="Image URL or upload" />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formData.featuredImage && (
                                    <div className="mt-2">
                                        <img src={formData.featuredImage} alt="Preview" className="w-32 h-20 object-cover rounded-lg border border-border" />
                                    </div>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Account Number (for tracking)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="block w-full pl-10 rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" placeholder="Optional: Link to account for tracking" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Link this project to an account to track donations</p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-border">
                            <button type="submit" disabled={isSubmitting} className="inline-flex justify-center items-center gap-2 py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {isSubmitting ? 'Creating...' : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Existing Projects List */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-fit">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Existing Projects</h3>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-9 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="text-xs text-muted-foreground mt-2">
                                {filteredProjects.length} of {projects.length} projects
                            </p>
                        )}
                    </div>

                    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredProjects.map(p => (
                            <div key={p.id} className="bg-secondary/30 p-3 rounded-xl border border-border hover:border-primary/30 transition-all group">
                                {/* Featured Image */}
                                {p.featuredImage && (
                                    <div className="mb-3">
                                        <img
                                            src={p.featuredImage}
                                            alt={p.title}
                                            className="w-full h-24 object-cover rounded-lg border border-border"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-foreground text-sm line-clamp-1">{p.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                                {p.category}
                                            </span>
                                            {p.visibility && (
                                                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                                    {p.visibility === 'public' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                    {p.visibility}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onProjectEdit(p)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => onProjectDelete(p)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Organizer and Duration */}
                                <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
                                    {p.organizer && (
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {p.organizer}
                                        </span>
                                    )}
                                    {p.durationDays && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {p.durationDays} days
                                        </span>
                                    )}
                                </div>

                                {/* Impact Statement */}
                                {p.impactStatement && (
                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 italic">
                                        "{p.impactStatement}"
                                    </p>
                                )}

                                {/* Funding Progress */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {p.currentAmount.toLocaleString()}</span>
                                        <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {p.fundingGoal.toLocaleString()}</span>
                                    </div>

                                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((p.currentAmount / p.fundingGoal) * 100, 100)}%` }}
                                        ></div>
                                    </div>

                                    <div className="text-xs text-center text-muted-foreground font-medium">
                                        {Math.round((p.currentAmount / p.fundingGoal) * 100)}% funded
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredProjects.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchQuery ? (
                                    <>
                                        <p>No projects match your search.</p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-2 text-sm text-primary hover:underline"
                                        >
                                            Clear search
                                        </button>
                                    </>
                                ) : (
                                    <p>No projects found.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectManagement;