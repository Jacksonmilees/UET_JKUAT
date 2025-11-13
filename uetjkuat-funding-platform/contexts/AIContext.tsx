

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { NotificationContext } from './NotificationContext';

interface AIContextType {
    isGenerating: boolean;
    aiError: string | null;
    generateContent: (prompt: string, schema: any) => Promise<string | null>;
}

export const AIContext = createContext<AIContextType>({} as AIContextType);

export const useAI = () => useContext(AIContext);

interface AIProviderProps {
    children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAIError] = useState<string | null>(null);
    const { addNotification } = useContext(NotificationContext);

    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        console.error("API_KEY for GoogleGenAI is not set. AI features will be disabled.");
        const disabledValue = {
            isGenerating: false,
            aiError: 'API Key not configured.',
            generateContent: async () => {
                addNotification('AI feature is not configured. Please contact the administrator.');
                return null;
            }
        };
        return <AIContext.Provider value={disabledValue}>{children}</AIContext.Provider>;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const generateContent = async (prompt: string, schema: any): Promise<string | null> => {
        setIsGenerating(true);
        setAIError(null);
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });
            
            setIsGenerating(false);
            return response.text;
        } catch (error) {
            console.error("Error generating content with AI:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown AI error occurred.";
            setAIError(errorMessage);
            addNotification(`AI Error: ${errorMessage}`);
            setIsGenerating(false);
            return null;
        }
    };

    const value = {
        isGenerating,
        aiError,
        generateContent,
    };

    return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};