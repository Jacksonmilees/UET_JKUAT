
import React from 'react';
import { useNews } from '../contexts/NewsContext';

const NewsPage: React.FC = () => {
  const { articles } = useNews();
  
  return (
    <div className="bg-secondary-50">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-secondary-900">News & Updates</h1>
          <p className="text-lg text-secondary-600 mt-2">Stay informed with the latest happenings from the UETJKUAT community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
                <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col group border border-secondary-200/50">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-56 object-cover" />
                    <div className="p-6 flex-grow flex flex-col">
                        <div className="mb-3">
                            <span className="text-xs font-semibold text-primary-700 bg-primary-100 px-2 py-1 rounded-full self-start">{article.category}</span>
                        </div>
                        <h2 className="text-xl font-serif font-bold text-secondary-800 mb-2 flex-grow">{article.title}</h2>
                        <p className="text-secondary-600 text-sm mb-4">{article.excerpt}</p>
                        <div className="mt-auto text-xs text-secondary-500">
                            <span>By {article.author}</span> &bull; <span>{article.date}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;