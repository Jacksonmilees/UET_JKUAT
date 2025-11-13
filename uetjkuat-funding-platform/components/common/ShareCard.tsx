
import React, { useState } from 'react';
import { Project } from '../../types';
import { IconTwitter, IconFacebook, IconLink, IconCheck } from '../icons';

interface ShareCardProps {
    project: Project;
}

const ShareCard: React.FC<ShareCardProps> = ({ project }) => {
    const [copied, setCopied] = useState(false);
    const url = window.location.href;
    const text = `Support the project "${project.title}" on the UETJKUAT Funding Platform!`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Share this project</h3>
            <div className="flex items-center space-x-3 mb-4">
                <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 text-center bg-blue-400 text-white py-2 rounded-md hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                    aria-label="Share on Twitter"
                >
                    <IconTwitter className="w-5 h-5"/>
                    <span>Tweet</span>
                </a>
                <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-blue-800 text-white py-2 rounded-md hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
                    aria-label="Share on Facebook"
                >
                    <IconFacebook className="w-5 h-5"/>
                    <span>Share</span>
                </a>
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    value={url} 
                    readOnly 
                    className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-600 pr-24"
                />
                <button 
                    onClick={copyToClipboard}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center gap-1"
                >
                    {copied ? (
                        <>
                            <IconCheck className="w-4 h-4" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <IconLink className="w-4 h-4" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ShareCard;