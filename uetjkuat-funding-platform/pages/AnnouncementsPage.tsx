import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  Bell,
  Calendar,
  AlertTriangle,
  Info,
  AlertCircle,
  RefreshCw,
  Filter,
  Clock,
  ChevronRight,
  Megaphone,
  Search
} from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  active: boolean;
  expires_at?: string;
  created_at: string;
}

// Skeleton components
const AnnouncementCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-secondary rounded-lg"></div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-1/3 bg-secondary rounded"></div>
          <div className="h-5 w-16 bg-secondary rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-secondary rounded"></div>
          <div className="h-4 w-3/4 bg-secondary rounded"></div>
        </div>
        <div className="h-4 w-24 bg-secondary rounded"></div>
      </div>
    </div>
  </div>
);

const FeaturedAnnouncementSkeleton: React.FC = () => (
  <div className="bg-card rounded-2xl border border-border p-8 animate-pulse">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-14 h-14 bg-secondary rounded-xl"></div>
      <div className="space-y-2">
        <div className="h-7 w-48 bg-secondary rounded"></div>
        <div className="h-4 w-32 bg-secondary rounded"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 w-full bg-secondary rounded"></div>
      <div className="h-4 w-full bg-secondary rounded"></div>
      <div className="h-4 w-2/3 bg-secondary rounded"></div>
    </div>
  </div>
);

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await api.announcements.getAll({ active: 'true' });
      if (response.success && response.data) {
        setAnnouncements(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnnouncements();
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || announcement.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  // Separate high priority announcements
  const featuredAnnouncements = filteredAnnouncements.filter(a => a.priority === 'high');
  const otherAnnouncements = filteredAnnouncements.filter(a => a.priority !== 'high');

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: AlertTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          label: 'Urgent'
        };
      case 'medium':
        return {
          icon: AlertCircle,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          label: 'Important'
        };
      default:
        return {
          icon: Info,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          label: 'Info'
        };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Announcements
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-xl">
              Important updates and notices from UET JKUAT leadership
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {['all', 'high', 'medium', 'low'].map(priority => (
              <button
                key={priority}
                onClick={() => setSelectedPriority(priority)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedPriority === priority
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{announcements.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {announcements.filter(a => a.priority === 'high').length}
                </p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {announcements.filter(a => a.priority === 'medium').length}
                </p>
                <p className="text-xs text-muted-foreground">Important</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {announcements.filter(a => a.priority === 'low').length}
                </p>
                <p className="text-xs text-muted-foreground">General</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <FeaturedAnnouncementSkeleton />
            <div className="grid gap-4">
              {[1, 2, 3, 4].map(i => (
                <AnnouncementCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAnnouncements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Megaphone className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Announcements</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery || selectedPriority !== 'all'
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'There are no active announcements at the moment. Check back later!'}
            </p>
            {(searchQuery || selectedPriority !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPriority('all');
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Featured/Urgent Announcements */}
        {!isLoading && featuredAnnouncements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Urgent Announcements
            </h2>
            <div className="space-y-4">
              {featuredAnnouncements.map(announcement => {
                const config = getPriorityConfig(announcement.priority);
                const Icon = config.icon;
                const isExpanded = expandedId === announcement.id;

                return (
                  <div
                    key={announcement.id}
                    className={`bg-card rounded-2xl border-2 ${config.borderColor} p-6 hover:shadow-lg transition-all cursor-pointer`}
                    onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 ${config.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-7 h-7 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{announcement.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badge} flex-shrink-0`}>
                            {config.label}
                          </span>
                        </div>
                        <p className={`text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {announcement.message}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(announcement.created_at)}
                          </span>
                          {announcement.expires_at && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                            </span>
                          )}
                          <span className={`flex items-center gap-1 ${config.color}`}>
                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            {isExpanded ? 'Show less' : 'Read more'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Announcements */}
        {!isLoading && otherAnnouncements.length > 0 && (
          <div>
            {featuredAnnouncements.length > 0 && (
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                All Announcements
              </h2>
            )}
            <div className="grid gap-4">
              {otherAnnouncements.map(announcement => {
                const config = getPriorityConfig(announcement.priority);
                const Icon = config.icon;
                const isExpanded = expandedId === announcement.id;

                return (
                  <div
                    key={announcement.id}
                    className="bg-card rounded-xl border border-border hover:border-primary/30 p-5 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${config.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {announcement.title}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge} flex-shrink-0`}>
                            {config.label}
                          </span>
                        </div>
                        <p className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {announcement.message}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(announcement.created_at)}
                          </span>
                          {announcement.expires_at && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-all flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
