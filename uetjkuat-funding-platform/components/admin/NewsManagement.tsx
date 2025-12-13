import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from './shared/DataTable';
import { StatCard } from './shared/StatCard';
import { FilterBar } from './shared/FilterBar';
import { NewsArticle, Announcement, ApiResponse } from '../../types/backend';
import {
  Plus, X, Eye, Edit2, Trash2, FileText, Bell, Calendar,
  Tag, User, Globe, Check, Clock, Archive, AlertCircle
} from 'lucide-react';
import api from '../../services/api';

interface NewsManagementProps {
  className?: string;
}

export function NewsManagement({ className = '' }: NewsManagementProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'announcements'>('news');

  // News state
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [newsStatusFilter, setNewsStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [newsFormData, setNewsFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    category_id: '',
    tags: [] as string[],
  });

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementSearchQuery, setAnnouncementSearchQuery] = useState('');
  const [announcementTypeFilter, setAnnouncementTypeFilter] = useState<'all' | 'info' | 'warning' | 'success' | 'error'>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    priority: 'medium' as 'low' | 'medium' | 'high',
    is_active: true,
    start_date: '',
    end_date: '',
    target_audience: '',
  });

  useEffect(() => {
    fetchNews();
    fetchAnnouncements();
  }, []);

  // ==================== NEWS FUNCTIONS ====================
  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      // Pass 'all=true' to get all news items (including drafts) for admin
      const response: ApiResponse<NewsArticle[]> = await api.news.getAll({ all: 'true' });
      if (response.success && response.data) {
        setNews(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleCreateNews = async () => {
    try {
      const response: ApiResponse<NewsArticle> = await api.news.create({
        ...newsFormData,
        category_id: newsFormData.category_id ? parseInt(newsFormData.category_id) : undefined,
      });

      if (response.success) {
        await fetchNews();
        setShowNewsModal(false);
        resetNewsForm();
      }
    } catch (error) {
      console.error('Error creating news:', error);
    }
  };

  const handleUpdateNews = async () => {
    if (!selectedNews) return;

    try {
      const response: ApiResponse<NewsArticle> = await api.news.update(selectedNews.id, {
        ...newsFormData,
        category_id: newsFormData.category_id ? parseInt(newsFormData.category_id) : undefined,
      });

      if (response.success) {
        await fetchNews();
        setShowNewsModal(false);
        resetNewsForm();
      }
    } catch (error) {
      console.error('Error updating news:', error);
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const response: ApiResponse = await api.news.delete(id);
      if (response.success) {
        await fetchNews();
      }
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const handlePublishNews = async (article: NewsArticle) => {
    try {
      const response: ApiResponse<NewsArticle> = await api.news.update(article.id, {
        status: 'published',
        published_at: new Date().toISOString(),
      });

      if (response.success) {
        await fetchNews();
      }
    } catch (error) {
      console.error('Error publishing news:', error);
    }
  };

  const resetNewsForm = () => {
    setNewsFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      status: 'draft',
      category_id: '',
      tags: [],
    });
    setSelectedNews(null);
    setIsCreatingNews(false);
  };

  const openNewsCreateModal = () => {
    resetNewsForm();
    setIsCreatingNews(true);
    setShowNewsModal(true);
  };

  const openNewsEditModal = (article: NewsArticle) => {
    setSelectedNews(article);
    setNewsFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      content: article.content,
      featured_image: article.featured_image || '',
      status: article.status,
      category_id: article.category_id?.toString() || '',
      tags: article.tags || [],
    });
    setIsCreatingNews(false);
    setShowNewsModal(true);
  };

  const openNewsViewModal = (article: NewsArticle) => {
    setSelectedNews(article);
    setIsCreatingNews(false);
    setShowNewsModal(true);
  };

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // ==================== ANNOUNCEMENTS FUNCTIONS ====================
  const fetchAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true);
      // Pass 'all=true' to get all announcements (including inactive) for admin
      const response: ApiResponse<Announcement[]> = await api.announcements.getAll({ all: 'true' });
      if (response.success && response.data) {
        setAnnouncements(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      const response: ApiResponse<Announcement> = await api.announcements.create(announcementFormData);

      if (response.success) {
        await fetchAnnouncements();
        setShowAnnouncementModal(false);
        resetAnnouncementForm();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      const response: ApiResponse<Announcement> = await api.announcements.update(
        selectedAnnouncement.id,
        announcementFormData
      );

      if (response.success) {
        await fetchAnnouncements();
        setShowAnnouncementModal(false);
        resetAnnouncementForm();
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const handleToggleAnnouncementActive = async (id: number) => {
    try {
      const response: ApiResponse<Announcement> = await api.announcements.toggleActive(id);
      if (response.success) {
        await fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error toggling announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response: ApiResponse = await api.announcements.delete(id);
      if (response.success) {
        await fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const resetAnnouncementForm = () => {
    setAnnouncementFormData({
      title: '',
      content: '',
      type: 'info',
      priority: 'medium',
      is_active: true,
      start_date: '',
      end_date: '',
      target_audience: '',
    });
    setSelectedAnnouncement(null);
    setIsCreatingAnnouncement(false);
  };

  const openAnnouncementCreateModal = () => {
    resetAnnouncementForm();
    setIsCreatingAnnouncement(true);
    setShowAnnouncementModal(true);
  };

  const openAnnouncementEditModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      is_active: announcement.is_active,
      start_date: announcement.start_date || '',
      end_date: announcement.end_date || '',
      target_audience: announcement.target_audience || '',
    });
    setIsCreatingAnnouncement(false);
    setShowAnnouncementModal(true);
  };

  // ==================== FILTERED DATA ====================
  const filteredNews = useMemo(() => {
    let filtered = [...news];

    // Search filter
    if (newsSearchQuery) {
      const query = newsSearchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt?.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (newsStatusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === newsStatusFilter);
    }

    return filtered;
  }, [news, newsSearchQuery, newsStatusFilter]);

  const filteredAnnouncements = useMemo(() => {
    let filtered = [...announcements];

    // Search filter
    if (announcementSearchQuery) {
      const query = announcementSearchQuery.toLowerCase();
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(query) ||
        announcement.content.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (announcementTypeFilter !== 'all') {
      filtered = filtered.filter(announcement => announcement.type === announcementTypeFilter);
    }

    return filtered;
  }, [announcements, announcementSearchQuery, announcementTypeFilter]);

  // ==================== STATS ====================
  const newsStats = {
    total: news.length,
    published: news.filter(a => a.status === 'published').length,
    drafts: news.filter(a => a.status === 'draft').length,
    archived: news.filter(a => a.status === 'archived').length,
  };

  const announcementStats = {
    total: announcements.length,
    active: announcements.filter(a => a.is_active).length,
    highPriority: announcements.filter(a => a.priority === 'high' && a.is_active).length,
    inactive: announcements.filter(a => !a.is_active).length,
  };

  // ==================== TABLE COLUMNS ====================
  const newsColumns = [
    {
      key: 'title',
      header: 'Title',
      render: (article: NewsArticle) => (
        <div className="flex items-start space-x-3">
          {article.featured_image && (
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{article.title}</div>
            {article.excerpt && (
              <div className="text-sm text-gray-500 mt-1 line-clamp-1">{article.excerpt}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (article: NewsArticle) => {
        const statusColors = {
          draft: 'bg-gray-100 text-gray-800',
          published: 'bg-green-100 text-green-800',
          archived: 'bg-orange-100 text-orange-800',
        };
        const status = article.status || 'draft';
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors] || statusColors.draft}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'published_at',
      header: 'Published',
      render: (article: NewsArticle) => article.published_at
        ? new Date(article.published_at).toLocaleDateString()
        : '-'
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (article: NewsArticle) => article.tags && article.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
              {tag}
            </span>
          ))}
          {article.tags.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              +{article.tags.length - 2}
            </span>
          )}
        </div>
      ) : '-'
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (article: NewsArticle) => new Date(article.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (article: NewsArticle) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openNewsViewModal(article)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openNewsEditModal(article)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {article.status === 'draft' && (
            <button
              onClick={() => handlePublishNews(article)}
              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
              title="Publish"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteNews(article.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const announcementColumns = [
    {
      key: 'title',
      header: 'Title',
      render: (announcement: Announcement) => (
        <div>
          <div className="font-medium text-gray-900">{announcement.title}</div>
          <div className="text-sm text-gray-500 mt-1 line-clamp-1">{announcement.content}</div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (announcement: Announcement) => {
        const typeColors = {
          info: 'bg-blue-100 text-blue-800',
          warning: 'bg-yellow-100 text-yellow-800',
          success: 'bg-green-100 text-green-800',
          error: 'bg-red-100 text-red-800',
        };
        const TypeIcon = {
          info: AlertCircle,
          warning: AlertCircle,
          success: Check,
          error: X,
        }[announcement.type];

        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${typeColors[announcement.type]}`}>
            <TypeIcon className="w-3 h-3" />
            {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (announcement: Announcement) => {
        const priorityColors = {
          low: 'bg-gray-100 text-gray-800',
          medium: 'bg-blue-100 text-blue-800',
          high: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[announcement.priority]}`}>
            {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (announcement: Announcement) => (
        <button
          onClick={() => handleToggleAnnouncementActive(announcement.id)}
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            announcement.is_active
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {announcement.is_active ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'start_date',
      header: 'Period',
      render: (announcement: Announcement) => {
        if (!announcement.start_date && !announcement.end_date) return 'Permanent';
        return (
          <div className="text-sm">
            {announcement.start_date && new Date(announcement.start_date).toLocaleDateString()}
            {announcement.start_date && announcement.end_date && ' - '}
            {announcement.end_date && new Date(announcement.end_date).toLocaleDateString()}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (announcement: Announcement) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openAnnouncementEditModal(announcement)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteAnnouncement(announcement.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News & Announcements</h1>
          <p className="text-sm text-gray-600 mt-1">Manage news articles and system announcements</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('news')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'news'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-5 h-5 inline-block mr-2" />
            News Articles
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'announcements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bell className="w-5 h-5 inline-block mr-2" />
            Announcements
          </button>
        </nav>
      </div>

      {/* NEWS TAB */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Articles"
              value={newsStats.total.toString()}
              icon={FileText}
              gradient="blue"
              loading={newsLoading}
            />
            <StatCard
              title="Published"
              value={newsStats.published.toString()}
              icon={Globe}
              gradient="green"
              loading={newsLoading}
            />
            <StatCard
              title="Drafts"
              value={newsStats.drafts.toString()}
              icon={Edit2}
              gradient="orange"
              loading={newsLoading}
            />
            <StatCard
              title="Archived"
              value={newsStats.archived.toString()}
              icon={Archive}
              gradient="gray"
              loading={newsLoading}
            />
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchQuery={newsSearchQuery}
            onSearchChange={setNewsSearchQuery}
            searchPlaceholder="Search articles..."
            filters={[
              {
                label: 'Status',
                value: newsStatusFilter,
                onChange: (value) => setNewsStatusFilter(value as typeof newsStatusFilter),
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'draft', label: 'Drafts' },
                  { value: 'published', label: 'Published' },
                  { value: 'archived', label: 'Archived' },
                ],
              },
            ]}
            onRefresh={fetchNews}
            onCreate={openNewsCreateModal}
            createLabel="New Article"
          />

          {/* News Table */}
          <div className="bg-white rounded-lg shadow">
            <DataTable
              data={filteredNews}
              columns={newsColumns}
              keyExtractor={(article) => article.id.toString()}
              loading={newsLoading}
              emptyMessage="No news articles found"
              itemsPerPage={15}
            />
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Announcements"
              value={announcementStats.total.toString()}
              icon={Bell}
              gradient="blue"
              loading={announcementsLoading}
            />
            <StatCard
              title="Active"
              value={announcementStats.active.toString()}
              icon={Check}
              gradient="green"
              loading={announcementsLoading}
            />
            <StatCard
              title="High Priority"
              value={announcementStats.highPriority.toString()}
              icon={AlertCircle}
              gradient="red"
              loading={announcementsLoading}
            />
            <StatCard
              title="Inactive"
              value={announcementStats.inactive.toString()}
              icon={Clock}
              gradient="gray"
              loading={announcementsLoading}
            />
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchQuery={announcementSearchQuery}
            onSearchChange={setAnnouncementSearchQuery}
            searchPlaceholder="Search announcements..."
            filters={[
              {
                label: 'Type',
                value: announcementTypeFilter,
                onChange: (value) => setAnnouncementTypeFilter(value as typeof announcementTypeFilter),
                options: [
                  { value: 'all', label: 'All Types' },
                  { value: 'info', label: 'Info' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'success', label: 'Success' },
                  { value: 'error', label: 'Error' },
                ],
              },
            ]}
            onRefresh={fetchAnnouncements}
            onCreate={openAnnouncementCreateModal}
            createLabel="New Announcement"
          />

          {/* Announcements Table */}
          <div className="bg-white rounded-lg shadow">
            <DataTable
              data={filteredAnnouncements}
              columns={announcementColumns}
              keyExtractor={(announcement) => announcement.id.toString()}
              loading={announcementsLoading}
              emptyMessage="No announcements found"
              itemsPerPage={15}
            />
          </div>
        </div>
      )}

      {/* NEWS MODAL */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreatingNews ? 'Create News Article' : selectedNews ? 'News Article Details' : 'Edit News Article'}
              </h2>
              <button
                onClick={() => {
                  setShowNewsModal(false);
                  resetNewsForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isCreatingNews || (!isCreatingNews && selectedNews) ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newsFormData.title}
                      onChange={(e) => {
                        setNewsFormData({
                          ...newsFormData,
                          title: e.target.value,
                          slug: generateSlug(e.target.value)
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter article title"
                      disabled={!isCreatingNews && !selectedNews}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL-friendly) *
                    </label>
                    <input
                      type="text"
                      value={newsFormData.slug}
                      onChange={(e) => setNewsFormData({ ...newsFormData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="article-url-slug"
                      disabled={!isCreatingNews && !selectedNews}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Excerpt (Short summary)
                    </label>
                    <textarea
                      value={newsFormData.excerpt}
                      onChange={(e) => setNewsFormData({ ...newsFormData, excerpt: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief summary (optional)"
                      disabled={!isCreatingNews && !selectedNews}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={newsFormData.content}
                      onChange={(e) => setNewsFormData({ ...newsFormData, content: e.target.value })}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="Article content (supports Markdown)"
                      disabled={!isCreatingNews && !selectedNews}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Featured Image URL
                      </label>
                      <input
                        type="text"
                        value={newsFormData.featured_image}
                        onChange={(e) => setNewsFormData({ ...newsFormData, featured_image: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                        disabled={!isCreatingNews && !selectedNews}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={newsFormData.status}
                        onChange={(e) => setNewsFormData({ ...newsFormData, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={!isCreatingNews && !selectedNews}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {(isCreatingNews || selectedNews) && (
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        onClick={() => {
                          setShowNewsModal(false);
                          resetNewsForm();
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={isCreatingNews ? handleCreateNews : handleUpdateNews}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {isCreatingNews ? 'Create Article' : 'Update Article'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                selectedNews && (
                  <div className="space-y-4">
                    {selectedNews.featured_image && (
                      <img
                        src={selectedNews.featured_image}
                        alt={selectedNews.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedNews.title}</h3>
                      {selectedNews.excerpt && (
                        <p className="text-gray-600 mt-2">{selectedNews.excerpt}</p>
                      )}
                    </div>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{selectedNews.content}</p>
                    </div>
                    {selectedNews.tags && selectedNews.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedNews.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 font-medium">{selectedNews.status}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2 font-medium">{new Date(selectedNews.created_at).toLocaleString()}</span>
                      </div>
                      {selectedNews.published_at && (
                        <div>
                          <span className="text-gray-500">Published:</span>
                          <span className="ml-2 font-medium">{new Date(selectedNews.published_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreatingAnnouncement ? 'Create Announcement' : 'Edit Announcement'}
              </h2>
              <button
                onClick={() => {
                  setShowAnnouncementModal(false);
                  resetAnnouncementForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={announcementFormData.title}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={announcementFormData.content}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Announcement content"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={announcementFormData.type}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={announcementFormData.priority}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={announcementFormData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, is_active: e.target.value === 'active' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={announcementFormData.start_date}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={announcementFormData.end_date}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience (Optional)
                </label>
                <input
                  type="text"
                  value={announcementFormData.target_audience}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, target_audience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., All Users, Admins, Students"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    resetAnnouncementForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={isCreatingAnnouncement ? handleCreateAnnouncement : handleUpdateAnnouncement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isCreatingAnnouncement ? 'Create Announcement' : 'Update Announcement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
