import React, { useState, useEffect, useMemo } from 'react';
import { FolderPlus, Download, RefreshCw, Eye, Edit, Trash2, Target, Calendar, DollarSign, TrendingUp, Image as ImageIcon, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { Project, ProjectCreateRequest, Category, ApiResponse } from '../../types/backend';
import { DataTable, Column } from './shared/DataTable';
import { StatCard } from './shared/StatCard';
import { FilterBar } from './shared/FilterBar';
import { useNotification } from '../../contexts/NotificationContext';
import { useAI } from '../../contexts/AIContext';

const ProjectManagementNew: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchCategories()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response: ApiResponse<Project[]> = await api.projects.getAll();
      if (response.success && response.data) {
        setProjects(Array.isArray(response.data) ? response.data : []);
      } else {
        showError(response.message || response.error || 'Failed to fetch projects');
        setProjects([]);
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      showError(error.message || 'Failed to fetch projects');
      setProjects([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.categories.getAll();
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    showSuccess('Projects refreshed successfully');
  };

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Category', 'Target', 'Current', 'Progress %', 'Status', 'End Date', 'Organizer'];
    const rows = filteredProjects.map(p => [
      p.id.toString(),
      p.name || p.title,
      p.category?.name || 'N/A',
      p.target_amount.toString(),
      p.current_amount.toString(),
      ((Number(p.current_amount) / Number(p.target_amount)) * 100).toFixed(2),
      p.status,
      p.end_date,
      p.organizer || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccess('Projects exported successfully');
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.name || project.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.projects.delete(project.id);
      if (response.success) {
        showSuccess('Project deleted successfully');
        fetchProjects();
      } else {
        showError(response.error || 'Failed to delete project');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to delete project');
    }
  };

  // Filter projects locally
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name || p.title)?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.organizer?.toLowerCase().includes(query) ||
        p.account_reference?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category_id?.toString() === categoryFilter);
    }

    return filtered;
  }, [projects, searchQuery, statusFilter, categoryFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalTarget = projects.reduce((sum, p) => sum + Number(p.target_amount), 0);
    const totalRaised = projects.reduce((sum, p) => sum + Number(p.current_amount), 0);
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    return {
      totalTarget,
      totalRaised,
      activeProjects,
      completedProjects,
      totalProjects: projects.length,
      overallProgress: totalTarget > 0 ? (totalRaised / totalTarget) * 100 : 0,
    };
  }, [projects]);

  // Define table columns
  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Project Name',
      sortable: true,
      render: (p) => (
        <div className="flex items-start gap-3">
          {(p.featured_image || p.image_url) && (
            <img
              src={p.featured_image || p.image_url}
              alt={p.name || p.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <div className="font-semibold text-foreground">{p.name || p.title}</div>
            <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
            {p.account_reference && (
              <div className="text-xs text-primary font-mono mt-0.5">{p.account_reference}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (p) => (
        <span className="text-sm text-foreground">
          {p.category?.name || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'target_amount',
      header: 'Target / Raised',
      sortable: true,
      render: (p) => {
        const progress = Number(p.target_amount) > 0 ? (Number(p.current_amount) / Number(p.target_amount)) * 100 : 0;
        return (
          <div>
            <div className="text-sm font-semibold text-foreground">
              KES {Number(p.current_amount).toLocaleString()} / {Number(p.target_amount).toLocaleString()}
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{progress.toFixed(1)}% funded</div>
          </div>
        );
      },
    },
    {
      key: 'end_date',
      header: 'End Date',
      sortable: true,
      render: (p) => {
        const endDate = new Date(p.end_date);
        const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <div>
            <div className="text-sm text-foreground">
              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className={`text-xs mt-0.5 ${daysLeft < 0 ? 'text-red-500' : daysLeft < 7 ? 'text-orange-500' : 'text-muted-foreground'}`}>
              {daysLeft < 0 ? `Ended ${Math.abs(daysLeft)} days ago` : `${daysLeft} days left`}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          p.status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : p.status === 'completed'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        }`}>
          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProject(p);
            }}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProject(p);
              setShowEditModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit project"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(p);
            }}
            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <FolderPlus className="w-7 h-7 text-primary" />
          Project Management
        </h2>
        <p className="text-muted-foreground mt-1">Create and manage fundraising projects with automatic account creation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          subtitle={`${stats.activeProjects} active, ${stats.completedProjects} completed`}
          icon={FolderPlus}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Total Target"
          value={`KES ${stats.totalTarget.toLocaleString()}`}
          subtitle="All projects combined"
          icon={Target}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Total Raised"
          value={`KES ${stats.totalRaised.toLocaleString()}`}
          subtitle={`${stats.overallProgress.toFixed(1)}% of target`}
          icon={TrendingUp}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          subtitle="Currently accepting donations"
          icon={DollarSign}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search projects by name, description, or account reference..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'All Status', value: '' },
          { label: 'Active', value: 'active' },
          { label: 'Completed', value: 'completed' },
          { label: 'Paused', value: 'paused' },
        ]}
        filterLabel="Filter by Status"
        onExport={handleExport}
        onRefresh={handleRefresh}
        onCreate={() => setShowCreateModal(true)}
        createLabel="New Project"
        isRefreshing={refreshing}
        customFilters={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground cursor-pointer min-w-[150px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        }
      />

      {/* Projects Table */}
      <DataTable
        data={filteredProjects}
        columns={columns}
        keyExtractor={(p) => p.id.toString()}
        loading={loading}
        emptyMessage="No projects found. Create your first fundraising project to get started."
        itemsPerPage={10}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchProjects();
            showSuccess('Project and account created successfully!');
          }}
          categories={categories}
        />
      )}

      {showEditModal && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedProject(null);
            fetchProjects();
            showSuccess('Project updated successfully');
          }}
          categories={categories}
        />
      )}

      {selectedProject && !showEditModal && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

// Create Project Modal
const CreateProjectModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}> = ({ onClose, onSuccess, categories }) => {
  const [formData, setFormData] = useState<Partial<ProjectCreateRequest>>({
    title: '',
    name: '',
    description: '',
    long_description: '',
    target_amount: 0,
    end_date: '',
    organizer: '',
    impact_statement: '',
    duration_days: 30,
    visibility: 'public',
    allow_donations: true,
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const { isGenerating, generateContent } = useAI();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, featured_image: reader.result as string });
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleAIGenerate = async (field: 'description' | 'long_description' | 'impact_statement') => {
    if (!formData.title && !formData.name) {
      setError('Please enter a project title first');
      return;
    }

    const projectName = formData.title || formData.name || '';
    const prompts = {
      description: `Write a brief, compelling 1-2 sentence description for a fundraising project called "${projectName}". Make it engaging and clear.`,
      long_description: `Write a detailed description (3-4 paragraphs) for a fundraising project called "${projectName}". Include what the project is about, why it's important, and what the funds will be used for.`,
      impact_statement: `Write a powerful impact statement (2-3 sentences) explaining the positive change that "${projectName}" will bring to the community or beneficiaries.`,
    };

    try {
      const content = await generateContent(prompts[field]);
      setFormData({ ...formData, [field]: content });
    } catch (err) {
      setError('Failed to generate content with AI');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.target_amount || !formData.end_date || !formData.organizer) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare request matching backend expectations
      const projectRequest: ProjectCreateRequest = {
        title: formData.title,
        name: formData.name || formData.title,
        description: formData.description,
        long_description: formData.long_description || formData.description,
        target_amount: Number(formData.target_amount),
        current_amount: 0,
        end_date: formData.end_date,
        organizer: formData.organizer,
        impact_statement: formData.impact_statement || '',
        duration_days: formData.duration_days,
        visibility: formData.visibility,
        allow_donations: formData.allow_donations,
        ...(formData.featured_image && { featured_image: formData.featured_image }),
        ...(formData.category_id && { category_id: formData.category_id }),
      };

      const response = await api.projects.create(projectRequest);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to create project');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full p-6 border border-border animate-slide-up my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create New Project</h2>
            <p className="text-sm text-muted-foreground mt-1">Account will be auto-created for this project</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Project Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g., Community Library Renovation"
                required
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-foreground">
                  Short Description <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleAIGenerate('description')}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Generate
                </button>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Brief description of the project..."
                rows={2}
                required
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-foreground">Long Description</label>
                <button
                  type="button"
                  onClick={() => handleAIGenerate('long_description')}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Generate
                </button>
              </div>
              <textarea
                value={formData.long_description}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Detailed description of what the project entails..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Target Amount (KES) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                min="1"
                step="0.01"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="100000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                End Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Organizer <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Your name or organization"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-foreground">Impact Statement</label>
                <button
                  type="button"
                  onClick={() => handleAIGenerate('impact_statement')}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Generate
                </button>
              </div>
              <textarea
                value={formData.impact_statement}
                onChange={(e) => setFormData({ ...formData, impact_statement: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Describe the impact this project will have..."
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">Featured Image</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="project-image"
                />
                <label
                  htmlFor="project-image"
                  className="flex items-center gap-2 px-4 py-3 border border-input rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  {uploadingImage ? 'Uploading...' : 'Choose Image'}
                </label>
                {formData.featured_image && (
                  <img src={formData.featured_image} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-input rounded-lg font-semibold text-foreground hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Project & Account...
                </span>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Project Modal (similar structure, update instead of create)
const EditProjectModal: React.FC<{
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}> = ({ project, onClose, onSuccess, categories }) => {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    long_description: project.long_description || '',
    target_amount: Number(project.target_amount),
    end_date: project.end_date.split('T')[0],
    organizer: project.organizer || '',
    status: project.status,
    category_id: project.category_id,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await api.projects.update(project.id, formData);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to update project');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-border animate-slide-up my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Edit Project</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground resize-none"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Target Amount</label>
              <input
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-input rounded-lg font-semibold text-foreground hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Project Details Modal
const ProjectDetailsModal: React.FC<{
  project: Project;
  onClose: () => void;
}> = ({ project, onClose }) => {
  const progress = Number(project.target_amount) > 0 ? (Number(project.current_amount) / Number(project.target_amount)) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full p-6 border border-border animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{project.name || project.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">Created {new Date(project.created_at).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Project Image */}
          {(project.featured_image || project.image_url) && (
            <img
              src={project.featured_image || project.image_url}
              alt={project.name || project.title}
              className="w-full h-64 rounded-xl object-cover"
            />
          )}

          {/* Progress */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-90 font-medium">Fundraising Progress</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
                {project.status.toUpperCase()}
              </span>
            </div>
            <div className="text-4xl font-bold mb-2">
              KES {Number(project.current_amount).toLocaleString()} / {Number(project.target_amount).toLocaleString()}
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="text-sm opacity-90">{progress.toFixed(1)}% funded</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Organizer</p>
              <p className="font-semibold text-foreground">{project.organizer || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Category</p>
              <p className="font-semibold text-foreground">{project.category?.name || 'Uncategorized'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">End Date</p>
              <p className="font-semibold text-foreground">
                {new Date(project.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Reference</p>
              <p className="font-mono font-semibold text-primary">{project.account_reference || 'N/A'}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-foreground">{project.description}</p>
          </div>

          {/* Long Description */}
          {project.long_description && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Detailed Information</h3>
              <p className="text-foreground whitespace-pre-wrap">{project.long_description}</p>
            </div>
          )}

          {/* Impact Statement */}
          {project.impact_statement && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Impact Statement</h3>
              <p className="text-foreground">{project.impact_statement}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagementNew;
