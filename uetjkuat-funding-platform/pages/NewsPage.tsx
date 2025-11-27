
import React from 'react';
import { useNews } from '../contexts/NewsContext';

const NewsPage: React.FC = () => {
  const { articles } = useNews();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-6xl">📰</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              News & Updates
            </span>
          </h1>
          <p className="text-xl text-gray-700 mt-4 max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest happenings from the UET JKUAT community. 📢
          </p>
        </div>

        {/* Featured Article (First one) */}
        {articles.length > 0 && (
          <div className="mb-12 bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative overflow-hidden h-96 lg:h-auto">
                <img 
                  src={articles[0].imageUrl} 
                  alt={articles[0].title} 
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-6 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  Featured Story
                </div>
              </div>
              <div className="p-10 flex flex-col justify-center bg-gradient-to-br from-white to-blue-50">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full self-start mb-4">
                  {articles[0].category}
                </span>
                <h2 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
                  {articles[0].title}
                </h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">{articles[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {articles[0].author.charAt(0)}
                    </div>
                    <span className="font-semibold">{articles[0].author}</span>
                  </div>
                  <span>•</span>
                  <span>{articles[0].date}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map(article => (
                <div key={article.id} className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 flex flex-col group border-2 border-transparent hover:border-indigo-200">
                    <div className="relative overflow-hidden">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                        {article.category}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col bg-gradient-to-b from-white to-indigo-50">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex-grow group-hover:text-indigo-600 transition-colors leading-tight">
                          {article.title}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{article.excerpt}</p>
                        <div className="mt-auto pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {article.author.charAt(0)}
                              </div>
                              <span className="font-semibold">{article.author}</span>
                            </div>
                            <span>{article.date}</span>
                          </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 shadow-2xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Never Miss an Update! 📬</h2>
          <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest news, events, and updates delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-6 py-4 rounded-xl text-gray-800 font-semibold focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg">
              Subscribe ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;