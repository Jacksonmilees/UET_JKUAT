
import React, { createContext, useState, useMemo, useCallback, ReactNode, useContext, useEffect } from 'react';
import { Project, Transaction, Contributor } from '../types';
import { useAuth } from './AuthContext';
import { useFinance } from './FinanceContext';
import api from '../services/api';

interface ContributionOptions {
    phoneNumber?: string;
}

interface ContributionResult {
    success: boolean;
    message: string;
}

type NewProjectData = Omit<Project, 'id' | 'currentAmount' | 'contributors' | 'updates' | 'endDate'> & {
    durationDays: number;
};

interface ProjectContextType {
    projects: Project[];
    transactions: Transaction[];
    isLoading: boolean;
    handleContribute: (projectId: number, amount: number, options?: ContributionOptions) => Promise<ContributionResult>;
    addProject: (data: NewProjectData) => Promise<void>;
    updateProject: (updatedProject: Project) => Promise<void>;
    deleteProject: (projectId: number) => Promise<void>;
    getProjectById: (id: number) => Project | undefined;
    refreshProjects: () => Promise<void>;
    
    // Stats
    stats: {
        totalRaised: number;
        projectsFunded: number;
        totalContributors: number;
    };

    // Filter and Sort
    categories: string[];
    filterCategory: string;
    setFilterCategory: (category: string) => void;
    sortOption: string;
    setSortOption: (option: string) => void;
    filteredAndSortedProjects: Project[];
}

export const ProjectContext = createContext<ProjectContextType>({} as ProjectContextType);

export const useProjects = () => useContext(ProjectContext);

interface ProjectProviderProps {
    children: ReactNode;
}

// Helper to transform backend project to frontend format
const transformProject = (backendProject: any): Project => {
    return {
        id: backendProject.id,
        title: backendProject.title,
        description: backendProject.description || '',
        longDescription: backendProject.long_description || backendProject.description || '',
        category: backendProject.category || 'General',
        fundingGoal: parseFloat(backendProject.target_amount || backendProject.funding_goal || 0),
        currentAmount: parseFloat(backendProject.current_amount || 0),
        featuredImage: backendProject.image_url || backendProject.featured_image || 'https://picsum.photos/600/400',
        endDate: backendProject.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        organizer: backendProject.organizer || 'UET JKUAT',
        impactStatement: backendProject.impact_statement || backendProject.description || '',
        updates: backendProject.updates || [],
        contributors: backendProject.contributors || [],
    };
};

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortOption, setSortOption] = useState('default');
    const { user } = useAuth();
    const { transactions, initiateProjectContribution, refreshTransactions } = useFinance();

    // Load projects from API
    const loadProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.projects.getAll();
            if (response.success && response.data) {
                const transformedProjects = response.data.map(transformProject);
                setProjects(transformedProjects);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load projects on mount
    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const stats = useMemo(() => {
        const totalRaised = projects.reduce((sum, project) => sum + project.currentAmount, 0);
        const projectsFunded = projects.filter(p => p.currentAmount >= p.fundingGoal).length;
        const totalContributors = new Set(projects.flatMap(p => p.contributors.map(c => c.name))).size;
        return { totalRaised, projectsFunded, totalContributors };
    }, [projects]);

    const categories = useMemo(
        () => ['All', ...new Set(projects.map(p => p.category))],
        [projects]
    );

    const filteredAndSortedProjects = useMemo(() => {
        let visibleProjects = projects.filter(
            p => filterCategory === 'All' || p.category === filterCategory
        );

        visibleProjects = [...visibleProjects];

        switch (sortOption) {
            case 'raised_desc':
                visibleProjects.sort((a, b) => b.currentAmount - a.currentAmount);
                break;
            case 'raised_asc':
                visibleProjects.sort((a, b) => a.currentAmount - b.currentAmount);
                break;
            case 'ending_soon':
                visibleProjects.sort((a, b) => {
                    const dateA = new Date(a.endDate).getTime();
                    const dateB = new Date(b.endDate).getTime();
                    const now = Date.now();
                    const aEnded = dateA < now || a.currentAmount >= a.fundingGoal;
                    const bEnded = dateB < now || b.currentAmount >= b.fundingGoal;
                    if (aEnded && !bEnded) return 1;
                    if (!aEnded && bEnded) return -1;
                    return dateA - dateB;
                });
                break;
            default:
                visibleProjects.sort((a, b) => a.id - b.id);
                break;
        }
        return visibleProjects;
    }, [filterCategory, sortOption, projects]);

    const handleContribute = useCallback(
        async (projectId: number, amount: number, options?: ContributionOptions): Promise<ContributionResult> => {
            const project = projects.find(p => p.id === projectId);

            if (!project) {
                return { success: false, message: 'Project not found.' };
            }

            const phoneNumber =
                options?.phoneNumber ??
                user?.phoneNumber ??
                '254700000000';

            const result = await initiateProjectContribution({
                projectId,
                projectTitle: project.title,
                amount,
                phoneNumber,
                userId: user?.id,
                donorName: user?.name,
            });

            if (!result.success) {
                    return { 
                    success: false,
                    message: result.message || 'The M-Pesa transaction did not complete. Please try again.',
                };
            }

            // Refresh projects to get updated amounts
            await loadProjects();
            await refreshTransactions();

            return {
                success: true,
                message: `Successfully contributed KES ${amount.toLocaleString()} to ${project.title}.`,
            };
        },
        [projects, user, initiateProjectContribution, loadProjects, refreshTransactions]
    );

    const getProjectById = useCallback((id: number) => {
        return projects.find(p => p.id === id);
    }, [projects]);

    const addProject = useCallback(async (data: NewProjectData) => {
        try {
        const getFutureDate = (days: number) => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date.toISOString();
            };

            const projectData = {
                title: data.title,
                description: data.description,
                long_description: data.longDescription,
                category: data.category,
                target_amount: data.fundingGoal,
                end_date: getFutureDate(data.durationDays),
                image_url: data.featuredImage,
                organizer: data.organizer,
                impact_statement: data.impactStatement,
            };

            const response = await api.projects.create(projectData);
            if (response.success) {
                await loadProjects();
            }
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }, [loadProjects]);
    
    const updateProject = useCallback(async (updatedProject: Project) => {
        try {
            const projectData = {
                title: updatedProject.title,
                description: updatedProject.description,
                long_description: updatedProject.longDescription,
                category: updatedProject.category,
                target_amount: updatedProject.fundingGoal,
                current_amount: updatedProject.currentAmount,
                end_date: updatedProject.endDate,
                image_url: updatedProject.featuredImage,
                organizer: updatedProject.organizer,
                impact_statement: updatedProject.impactStatement,
            };

            const response = await api.projects.update(updatedProject.id, projectData);
            if (response.success) {
                await loadProjects();
            }
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    }, [loadProjects]);

    const deleteProject = useCallback(async (projectId: number) => {
        try {
            const response = await api.projects.delete(projectId);
            if (response.success) {
                await loadProjects();
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }, [loadProjects]);

    const refreshProjects = useCallback(async () => {
        await loadProjects();
    }, [loadProjects]);

    const value = {
        projects,
        transactions,
        isLoading,
        handleContribute,
        getProjectById,
        addProject,
        updateProject,
        deleteProject,
        refreshProjects,
        stats,
        categories,
        filterCategory,
        setFilterCategory,
        sortOption,
        setSortOption,
        filteredAndSortedProjects,
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};
