import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Upload, 
  User, 
  Image as ImageIcon, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import api from '../../services/api';

interface SystemSettings {
  chair_name: string;
  chair_title: string;
  chair_image: string | null;
  organization_name: string;
  organization_tagline: string;
  visible_modules: {
    news: boolean;
    announcements: boolean;
    merchandise: boolean;
    projects: boolean;
    finance: boolean;
    tickets: boolean;
  };
}

const SettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
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
      tickets: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get<SystemSettings>('/settings');
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setSettings(prev => ({
          ...prev,
          ...data,
          visible_modules: data.visible_modules || prev.visible_modules
        }));
        if (data.chair_image) {
          setPreviewImage(data.chair_image);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use defaults if settings don't exist
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setNotification({ type: 'error', message: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({ type: 'error', message: 'Image must be less than 5MB' });
      return;
    }

    try {
      setUploadingImage(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server using the uploads API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'chair');
      
      const response = await api.uploads.uploadImage(formData);

      if (response.success && response.data?.url) {
        setSettings(prev => ({ ...prev, chair_image: response.data!.url }));
        setPreviewImage(response.data.url);
        setNotification({ type: 'success', message: 'Image uploaded successfully' });
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setNotification({ 
        type: 'error', 
        message: error.message || 'Failed to upload image' 
      });
      // Revert preview if upload failed
      setPreviewImage(settings.chair_image);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setSaving(true);
      const response = await api.delete('/settings/chair-image');
      if (response.data.success) {
        setSettings(prev => ({ ...prev, chair_image: null }));
        setPreviewImage(null);
        setNotification({ type: 'success', message: 'Image removed successfully' });
      } else {
        throw new Error(response.data.error || 'Failed to remove image');
      }
    } catch (error: any) {
      setNotification({ 
        type: 'error', 
        message: error.message || 'Failed to remove image' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await api.put('/settings', settings);
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Settings saved successfully' });
      } else {
        throw new Error(response.data.error || 'Failed to save settings');
      }
    } catch (error: any) {
      setNotification({ 
        type: 'error', 
        message: error.message || 'Failed to save settings' 
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (module: keyof SystemSettings['visible_modules']) => {
    setSettings(prev => ({
      ...prev,
      visible_modules: {
        ...prev.visible_modules,
        [module]: !prev.visible_modules[module]
      }
    }));
  };

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-secondary rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-secondary rounded-xl"></div>
          <div className="h-64 bg-secondary rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            System Settings
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure system-wide settings and appearance
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          notification.type === 'success' 
            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
            : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chair Image Section */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            Chair Information
          </h3>
          
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Chair" 
                    className="w-full h-full object-cover rounded-full border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center border-4 border-dashed border-border">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                {uploadingImage && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </button>
                
                {previewImage && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <p className="text-xs text-muted-foreground mt-2">
                Max size: 5MB. Supported: JPG, PNG, GIF
              </p>
            </div>

            {/* Chair Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Chair Name
              </label>
              <input
                type="text"
                value={settings.chair_name}
                onChange={(e) => setSettings(prev => ({ ...prev, chair_name: e.target.value }))}
                placeholder="Enter chairperson name"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Chair Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Chair Title
              </label>
              <input
                type="text"
                value={settings.chair_title}
                onChange={(e) => setSettings(prev => ({ ...prev, chair_title: e.target.value }))}
                placeholder="e.g., Chairperson, President"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Organization Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-primary" />
            Organization Details
          </h3>
          
          <div className="space-y-4">
            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={settings.organization_name}
                onChange={(e) => setSettings(prev => ({ ...prev, organization_name: e.target.value }))}
                placeholder="Enter organization name"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={settings.organization_tagline}
                onChange={(e) => setSettings(prev => ({ ...prev, organization_tagline: e.target.value }))}
                placeholder="Enter organization tagline"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Module Visibility Settings */}
        <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            Module Visibility
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Control which modules are visible to regular users in the public dashboard
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(settings.visible_modules).map(([module, isVisible]) => (
              <button
                key={module}
                onClick={() => toggleModule(module as keyof SystemSettings['visible_modules'])}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isVisible 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border bg-secondary/50'
                }`}
              >
                <span className="capitalize font-medium text-foreground">{module}</span>
                {isVisible ? (
                  <ToggleRight className="w-6 h-6 text-primary" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
