
import React from 'react';
import { useNews } from '../../contexts/NewsContext';
import { Route } from '../../types';

interface NewsPreviewProps {
  setRoute: (route: Route) => void;
}

const NewsPreview: React.FC<NewsPreviewProps> = ({ setRoute }) => {
  const { articles } = useNews();
  const latestArticles = articles.slice(0, 3);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-secondary-900">Latest News & Updates</h2>
          <p className="text-lg text-secondary-600 mt-2">Stay connected with our recent activities and announcements.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestArticles.map(article => (
            <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col group border border-secondary-200/50">
                <img src={article.imageUrl} alt={article.title} className="w-full h-56 object-cover" />
                <div className="p-6 flex-grow flex flex-col">
                    <div className="mb-3">
                        <span className="text-xs font-semibold text-primary-700 bg-primary-100 px-2 py-1 rounded-full self-start">{article.category}</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-secondary-800 mb-2 flex-grow">{article.title}</h3>
                    <p className="text-secondary-600 text-sm mb-4">{article.excerpt}</p>
                    <div className="mt-auto text-xs text-secondary-500">
                        <span>By {article.author}</span> &bull; <span>{article.date}</span>
                    </div>
                </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
            <button
                onClick={() => setRoute({ page: 'news' })}
                className="bg-primary-600 text-white font-bold py-3 px-8 rounded-md hover:bg-primary-700 transition duration-300 ease-in-out"
            >
                View All News
            </button>
        </div>
      </div>
    </section>
  );
};

export default NewsPreview;
