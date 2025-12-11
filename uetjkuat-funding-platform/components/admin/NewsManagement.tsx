import React, { useState } from 'react';
import { useNews as useNewsQuery, useCreateNews } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { useAI } from '../../contexts/AIContext';
import { Edit2, Sparkles, Trash2, Newspaper, Image as ImageIcon, User, Tag, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Type } from '@google/genai';
import { NewsArticle } from '../../types';

interface NewsManagementProps {
    onArticleEdit: (article: NewsArticle) => void;
    onArticleDelete: (article: NewsArticle) => void;
}

const NewsManagement: React.FC<NewsManagementProps> = ({ onArticleEdit, onArticleDelete }) => {
    const { data: articles = [], isLoading, error } = useNewsQuery();
    const createNewsMutation = useCreateNews();
    const { user } = useAuth();
    const { addNotification } = React.useContext(NotificationContext);
    const { isGenerating, generateContent } = useAI();
    const [aiTopic, setAITopic] = useState('');
    const [isUploading, setIsUploading] = useState(false);

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

    // Convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const base64 = await fileToBase64(file);
            setFormData(prev => ({ ...prev, imageUrl: base64 }));
            addNotification('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            addNotification('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.excerpt) {
            addNotification("Please fill all required fields.");
            return;
        }

        try {
            await createNewsMutation.mutateAsync(formData);
            addNotification(`Article "${formData.title}" published successfully!`);
            setFormData({
                title: '',
                excerpt: '',
                imageUrl: 'https://picsum.photos/seed/new_article/600/400',
                author: user?.name || 'Admin',
                category: 'Announcements',
            });
        } catch (error: any) {
            addNotification(`Failed to create article: ${error.message}`);
        }
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
        <div className="space-y-8">
            <div className="flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">News Management</h2>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Generate with AI
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">
                    Stuck on writing an update? Provide a topic and let AI draft it for you.
                </p>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={aiTopic}
                        onChange={(e) => setAITopic(e.target.value)}
                        placeholder="e.g., Results of recent bake sale"
                        className="flex-grow block w-full rounded-lg border-indigo-200 dark:border-indigo-800 bg-white dark:bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2"
                    />
                    <button
                        type="button"
                        onClick={handleGenerateNewsContent}
                        disabled={isGenerating}
                        className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-all"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-6">Publish New Article</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                            placeholder="Enter article title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Excerpt / Short Summary</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                            placeholder="Brief summary of the article..."
                        ></textarea>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            Image
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl.startsWith('data:') ? 'Image uploaded' : formData.imageUrl}
                                onChange={handleChange}
                                disabled={formData.imageUrl.startsWith('data:')}
                                className="flex-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm disabled:bg-secondary"
                                placeholder="Image URL or upload"
                            />
                            <label className="inline-flex items-center justify-center py-2 px-4 border border-border shadow-sm text-sm font-medium rounded-lg text-foreground bg-secondary hover:bg-secondary/80 cursor-pointer transition-all">
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {formData.imageUrl && (
                            <img src={formData.imageUrl} alt="Preview" className="mt-2 w-32 h-20 object-cover rounded-lg" />
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                Author
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-muted-foreground" />
                                Category
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 transition-all">
                            Publish Article
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-bold text-foreground mb-4">Published Articles ({articles.length})</h3>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-3 text-muted-foreground">Loading articles...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        <div>
                            <p className="font-medium text-destructive">Failed to load articles</p>
                            <p className="text-sm text-destructive/80">{error.message}</p>
                        </div>
                    </div>
                )}

                {/* Articles List */}
                {!isLoading && !error && (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {articles.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No articles published yet</p>
                            </div>
                        ) : (
                            articles.map(article => (
                                <div key={article.id} className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 flex-grow">
                                        <img src={article.imageUrl} alt={article.title} className="w-20 h-16 object-cover rounded-lg bg-secondary" />
                                        <div>
                                            <p className="font-bold text-foreground line-clamp-1">{article.title}</p>
                                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                                <span className="font-medium text-primary">{article.author}</span>
                                                <span>•</span>
                                                <span>{article.date}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">{article.category}</span>
                                        <div className="flex items-center gap-1 ml-2 border-l border-border pl-3">
                                            <button onClick={() => onArticleEdit(article)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onArticleDelete(article)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsManagement;