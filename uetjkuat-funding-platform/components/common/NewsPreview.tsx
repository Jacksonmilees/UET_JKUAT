import React from 'react';
import { useNews } from '../../contexts/NewsContext';
import { Route } from '../../types';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';

interface NewsPreviewProps {
  setRoute: (route: Route) => void;
}

const NewsPreview: React.FC<NewsPreviewProps> = ({ setRoute }) => {
  const { articles } = useNews();
  const latestArticles = articles.slice(0, 3);

  return (
    <section className="bg-secondary-900 py-16 md:py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-secondary-900 to-secondary-800 opacity-50 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Latest News & Updates</h2>
          <div className="h-1 w-24 bg-primary-500 mx-auto rounded-full mb-4"></div>
          <p className="text-lg text-secondary-400 max-w-2xl mx-auto">
            Stay connected with our recent activities, testimonies, and announcements from the UET JKUAT family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestArticles.map((article, index) => (
            <div
              key={article.id}
              className="group bg-secondary-800 rounded-3xl overflow-hidden border border-secondary-700 hover:border-primary-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-secondary-900/20 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-950 bg-primary-500 px-3 py-1.5 rounded-full shadow-lg">
                    <Tag className="w-3 h-3" />
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-4 text-xs text-secondary-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary-500" />
                    {article.author}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-secondary-600"></span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    {article.date}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-secondary-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                  {article.excerpt}
                </p>

                <button
                  onClick={() => setRoute({ page: 'news', params: { id: article.id } })}
                  className="flex items-center gap-2 text-primary-400 font-bold text-sm group/btn self-start hover:text-primary-300 transition-colors"
                >
                  Read Article
                  <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => setRoute({ page: 'news' })}
            className="group relative px-8 py-3 bg-secondary-800 hover:bg-secondary-700 text-white font-bold rounded-xl transition-all duration-300 border border-secondary-700 hover:border-primary-500/50 shadow-lg hover:shadow-glow"
          >
            <span className="relative z-10 flex items-center gap-2">
              View All News <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsPreview;
