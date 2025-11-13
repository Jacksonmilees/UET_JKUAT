
import React, { createContext, useState, useCallback, ReactNode, useContext, useEffect } from 'react';
import { NewsArticle } from '../types';
import api from '../services/api';

type NewArticleData = Omit<NewsArticle, 'id' | 'date'>;

interface NewsContextType {
    articles: NewsArticle[];
    isLoading: boolean;
    addArticle: (data: NewArticleData) => Promise<void>;
    updateArticle: (updatedArticle: NewsArticle) => Promise<void>;
    deleteArticle: (articleId: number) => Promise<void>;
    refreshArticles: () => Promise<void>;
}

export const NewsContext = createContext<NewsContextType>({} as NewsContextType);

export const useNews = () => useContext(NewsContext);

interface NewsProviderProps {
    children: ReactNode;
}

// Transform backend article to frontend format
const transformArticle = (backendArticle: any): NewsArticle => {
    return {
        id: backendArticle.id,
        title: backendArticle.title,
        excerpt: backendArticle.excerpt || backendArticle.description || '',
        imageUrl: backendArticle.image_url || backendArticle.image || 'https://picsum.photos/600/400',
        author: backendArticle.author || 'UET JKUAT',
        date: backendArticle.created_at 
            ? new Date(backendArticle.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        category: backendArticle.category || 'General',
    };
};

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadArticles = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.news.getAll();
            if (response.success && response.data) {
                const transformed = response.data.map(transformArticle);
                setArticles(transformed);
            }
        } catch (error) {
            console.error('Error loading news articles:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    const addArticle = useCallback(async (data: NewArticleData) => {
        try {
            const articleData = {
                title: data.title,
                excerpt: data.excerpt,
                description: data.excerpt,
                image_url: data.imageUrl,
                author: data.author,
                category: data.category,
            };

            const response = await api.news.create(articleData);
            if (response.success) {
                await loadArticles();
            }
        } catch (error) {
            console.error('Error creating article:', error);
            throw error;
        }
    }, [loadArticles]);
    
    const updateArticle = useCallback(async (updatedArticle: NewsArticle) => {
        try {
            const articleData = {
                title: updatedArticle.title,
                excerpt: updatedArticle.excerpt,
                description: updatedArticle.excerpt,
                image_url: updatedArticle.imageUrl,
                author: updatedArticle.author,
                category: updatedArticle.category,
            };

            const response = await api.news.update(updatedArticle.id, articleData);
            if (response.success) {
                await loadArticles();
            }
        } catch (error) {
            console.error('Error updating article:', error);
            throw error;
        }
    }, [loadArticles]);

    const deleteArticle = useCallback(async (articleId: number) => {
        try {
            const response = await api.news.delete(articleId);
            if (response.success) {
                await loadArticles();
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            throw error;
        }
    }, [loadArticles]);

    const refreshArticles = useCallback(async () => {
        await loadArticles();
    }, [loadArticles]);

    return (
        <NewsContext.Provider value={{ 
            articles, 
            isLoading,
            addArticle, 
            updateArticle, 
            deleteArticle,
            refreshArticles,
        }}>
            {children}
        </NewsContext.Provider>
    );
};
