

import React, { useState } from 'react';
import { useNews } from '../../contexts/NewsContext';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { useAI } from '../../contexts/AIContext';
import { IconEdit, IconSparkles, IconTrash } from '../icons';
import { Type } from '@google/genai';
import { NewsArticle } from '../../types';

interface NewsManagementProps {
    onArticleEdit: (article: NewsArticle) => void;
    onArticleDelete: (article: NewsArticle) => void;
}

const NewsManagement: React.FC<NewsManagementProps> = ({ onArticleEdit, onArticleDelete }) => {
    const { articles, addArticle } = useNews();
    const { user } = useAuth();
    const { addNotification } = React.useContext(NotificationContext);
    const { isGenerating, generateContent } = useAI();
    const [aiTopic, setAITopic] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        imageUrl: 'https://picsum.photos/seed/new_article/600/400',
        author: user?.name || 'Admin',
        category: 'Announcements',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.excerpt) {
            addNotification("Please fill all required fields.");
            return;
        }
        addArticle(formData);
        addNotification(`Article "${formData.title}" published successfully!`);
        setFormData({
            title: '',
            excerpt: '',
            imageUrl: 'https://picsum.photos/seed/new_article/600/400',
            author: user?.name || 'Admin',
            category: 'Announcements',
        });
    };
    
    const handleGenerateNewsContent = async () => {
        if (!aiTopic) {
            addNotification("Please enter a topic for AI generation.");
            return;
        }
        const prompt = `Generate a news article for a university christian union. The topic is "${aiTopic}". The article should be engaging and informative. Provide a catchy title and a short excerpt (around 30-40 words).`;

        const newsSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "The catchy title of the news article." },
                excerpt: { type: Type.STRING, description: "A short summary or excerpt of the article." }
            },
            required: ["title", "excerpt"]
        };

        const result = await generateContent(prompt, newsSchema);
        
        if (result) {
            try {
                const parsedResult = JSON.parse(result);
                setFormData(prev => ({
                    ...prev,
                    title: parsedResult.title || prev.title,
                    excerpt: parsedResult.excerpt || prev.excerpt,
                }));
                addNotification("AI content generated successfully!");
            } catch (e) {
                console.error("Failed to parse AI response:", e);
                addNotification("AI generated content in an unexpected format.");
            }
        }
    };


    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">News Management</h2>

            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg mb-6">
                <h3 className="text-lg font-semibold text-indigo-800 mb-2 flex items-center">
                    <IconSparkles className="w-5 h-5 mr-2 text-indigo-600"/>
                    Generate with AI
                </h3>
                <p className="text-sm text-indigo-700 mb-3">
                    Stuck on writing an update? Provide a topic and let AI draft it for you.
                </p>
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={aiTopic}
                        onChange={(e) => setAITopic(e.target.value)}
                        placeholder="e.g., Results of recent bake sale"
                        className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button 
                        type="button" 
                        onClick={handleGenerateNewsContent}
                        disabled={isGenerating}
                        className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                         <IconSparkles className="w-4 h-4 mr-1.5"/>
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Publish New Article</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Excerpt / Short Summary</label>
                        <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Author</label>
                            <input type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    </div>
                    <div className="text-right">
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            Publish Article
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Published Articles ({articles.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {articles.map(article => (
                        <div key={article.id} className="bg-white p-3 rounded-md shadow-sm border flex justify-between items-center">
                           <div className="flex items-center gap-4 flex-grow">
                               <img src={article.imageUrl} alt={article.title} className="w-16 h-12 object-cover rounded"/>
                               <div>
                                   <p className="font-semibold text-gray-800">{article.title}</p>
                                   <p className="text-sm text-gray-500">{article.author} &bull; {article.date}</p>
                               </div>
                           </div>
                           <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                               <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{article.category}</span>
                               <button onClick={() => onArticleEdit(article)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                   <IconEdit className="w-4 h-4" />
                               </button>
                               <button onClick={() => onArticleDelete(article)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                                   <IconTrash className="w-4 h-4" />
                               </button>
                           </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsManagement;