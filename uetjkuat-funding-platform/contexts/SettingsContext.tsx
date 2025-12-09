import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface VisibleModules {
  news: boolean;
  announcements: boolean;
  merchandise: boolean;
  projects: boolean;
  finance: boolean;
  tickets: boolean;
}

interface SystemSettings {
  chair_name: string;
  chair_title: string;
  chair_image: string | null;
  organization_name: string;
  organization_tagline: string;
  visible_modules: VisibleModules;
}

interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  error: string | null;
  isModuleVisible: (module: keyof VisibleModules) => boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SystemSettings = {
  chair_name: '',
  chair_title: 'Chairperson',
  chair_image: null,
  organization_name: 'UET JKUAT',
  organization_tagline: 'Empowering Students Through Technology',
  visible_modules: {
    news: true,
    announcements: true,
    merchandise: true,
    projects: true,
    finance: true,
    tickets: true,
  },
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  error: null,
  isModuleVisible: () => true,
  refreshSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<SystemSettings>('/v1/settings/public');
      
      if (response.data.success && response.data.data) {
        setSettings({
          ...defaultSettings,
          ...response.data.data,
          visible_modules: {
            ...defaultSettings.visible_modules,
            ...(response.data.data.visible_modules || {}),
          },
        });
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to fetch settings');
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const isModuleVisible = (module: keyof VisibleModules): boolean => {
    return settings.visible_modules[module] ?? true;
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        isModuleVisible,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
