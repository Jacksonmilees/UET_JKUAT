

import React, { useState, useEffect, useContext } from 'react';
import { NewsArticle } from '../../types';
import { IconClose } from '../icons';
import { useNews } from '../../contexts/NewsContext';
import { NotificationContext } from '../../contexts/NotificationContext';

interface EditNewsModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditNewsModal: React.FC<EditNewsModalProps> = ({ article, isOpen, onClose }) => {
  const [formData, setFormData] = useState<NewsArticle | null>(null);
  const { updateArticle } = useNews();
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    setFormData(article);
  }, [article]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    updateArticle(formData);
    addNotification(`Article "${formData.title}" updated successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-xl w-full relative transform transition-all duration-300 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <IconClose className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit News Article</h2>
        
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
            <div className="pt-4 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditNewsModal;