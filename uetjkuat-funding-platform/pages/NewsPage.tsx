
import React, { useState } from 'react';
import { useNews } from '../contexts/NewsContext';
import { Calendar, User, ArrowRight, Clock, Tag, RefreshCw, Newspaper, TrendingUp, Filter, Search } from 'lucide-react';

// Skeleton components
const NewsCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
    <div className="h-52 bg-secondary"></div>
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 bg-secondary rounded-full"></div>
        <div className="h-4 w-24 bg-secondary rounded"></div>
      </div>
      <div className="h-6 bg-secondary rounded w-3/4"></div>
      <div className="h-4 bg-secondary rounded w-full"></div>
      <div className="h-4 bg-secondary rounded w-2/3"></div>
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="w-8 h-8 bg-secondary rounded-full"></div>
        <div className="h-4 w-24 bg-secondary rounded"></div>
      </div>
    </div>
  </div>
);

const FeaturedSkeleton: React.FC = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="h-80 lg:h-96 bg-secondary"></div>
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-secondary rounded-full"></div>
          <div className="h-5 w-32 bg-secondary rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-secondary rounded w-full"></div>
          <div className="h-8 bg-secondary rounded w-3/4"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-secondary rounded w-full"></div>
          <div className="h-4 bg-secondary rounded w-full"></div>
          <div className="h-4 bg-secondary rounded w-2/3"></div>
        </div>
        <div className="flex items-center gap-3 pt-4">
          <div className="w-10 h-10 bg-secondary rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-secondary rounded"></div>
            <div className="h-3 w-20 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NewsPage: React.FC = () => {
  const { articles, isLoading, refreshArticles } = useNews();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get unique categories from articles
  const categories = ['all', ...new Set(articles.map(a => a.category).filter(Boolean))];

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = filteredArticles[0];
  const otherArticles = filteredArticles.slice(1);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshArticles();
    setIsRefreshing(false);
  };

  // Format date for better display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return dateStr;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                News & Updates
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-xl">
              Stay informed with the latest happenings from the UET JKUAT community
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
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{articles.length}</p>
                <p className="text-xs text-muted-foreground">Total Articles</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{categories.length - 1}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {articles.filter(a => {
                    const date = new Date(a.date);
                    const now = new Date();
                    return (now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(articles.map(a => a.author)).size}
                </p>
                <p className="text-xs text-muted-foreground">Authors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <>
            <FeaturedSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && filteredArticles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Newspaper className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Articles Found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'There are no news articles published yet. Check back soon for updates!'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Featured Article */}
        {!isLoading && featuredArticle && (
          <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-80 lg:h-auto overflow-hidden">
                <img
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full shadow-lg">
                    Featured Story
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 lg:hidden">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                    <Tag className="w-3 h-3" />
                    {featuredArticle.category}
                  </span>
                </div>
              </div>
              <div className="p-6 lg:p-8 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    <Tag className="w-3 h-3" />
                    {featuredArticle.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDate(featuredArticle.date)}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {featuredArticle.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{featuredArticle.author}</p>
                      <p className="text-xs text-muted-foreground">Author</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm group/btn">
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && otherArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherArticles.map(article => (
              <article
                key={article.id}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg flex flex-col"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      <Tag className="w-3 h-3" />
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(article.date)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/80 to-primary/40 rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {article.author.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{article.author}</span>
                    </div>
                    <button className="text-primary hover:text-primary/80 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Load More / Pagination could go here */}
        {!isLoading && otherArticles.length >= 6 && (
          <div className="flex justify-center mt-10">
            <button className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-medium transition-colors">
              Load More Articles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;