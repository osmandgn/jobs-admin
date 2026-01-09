'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Database,
  Save,
  RefreshCw,
  Check,
  Loader2,
  Smartphone,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { settingsAPI } from '@/services/api';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('jobs');
  const [saved, setSaved] = useState(false);

  // Default settings state - only settings that exist in backend
  const defaultSettings = {
    // Jobs (snake_case to match backend)
    job_requires_approval: true,
    max_images_per_job: 5,
    job_expiry_days: 30,
    featured_job_price: 9.99,
    min_pay_amount: 10,
    max_pay_amount: 10000,

    // Maintenance
    maintenance_mode: false,
    maintenance_message: 'We are currently performing maintenance. Please check back soon.',

    // App Version
    min_app_version_ios: '1.0.0',
    min_app_version_android: '1.0.0',
    force_update_message: 'A new version of GigHub is available. Please update to continue using the app.',
    app_store_url: 'https://apps.apple.com/app/gighub-uk/id123456789',
    play_store_url: 'https://play.google.com/store/apps/details?id=uk.gighub.app',
  };

  const [settings, setSettings] = useState(defaultSettings);

  // Load settings from API
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsAPI.getAll,
  });

  // Update mutation for general settings
  const updateMutation = useMutation({
    mutationFn: (data: Record<string, any>) => settingsAPI.updateMultiple(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  // Separate mutation for maintenance mode
  const maintenanceMutation = useMutation({
    mutationFn: ({ enabled, message }: { enabled: boolean; message?: string }) =>
      settingsAPI.toggleMaintenance(enabled, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  // Update local settings when API data loads
  useEffect(() => {
    if (settingsData) {
      // Handle both array format (from backend) and object format
      const apiData = (settingsData as any)?.data || settingsData;
      let settingsMap: Record<string, any> = {};

      if (apiData?.settings && Array.isArray(apiData.settings)) {
        // Backend returns { settings: [{ key, value, ... }] }
        for (const setting of apiData.settings) {
          settingsMap[setting.key] = setting.value;
        }
      } else if (apiData && typeof apiData === 'object' && !Array.isArray(apiData)) {
        settingsMap = apiData;
      }

      if (Object.keys(settingsMap).length > 0) {
        setSettings((prev) => ({ ...prev, ...settingsMap }));
      }
    }
  }, [settingsData]);

  const sections: SettingsSection[] = [
    {
      id: 'jobs',
      title: 'Jobs',
      icon: <Database className="w-5 h-5" />,
      description: 'Job posting settings',
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      icon: <Settings className="w-5 h-5" />,
      description: 'Maintenance mode settings',
    },
    {
      id: 'appversion',
      title: 'App Version',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Force update settings',
    },
  ];

  const handleSave = async () => {
    if (activeSection === 'maintenance') {
      // Use separate maintenance endpoint
      maintenanceMutation.mutate({
        enabled: settings.maintenance_mode,
        message: settings.maintenance_message,
      });
    } else if (activeSection === 'jobs') {
      // Only update job-related settings
      const jobSettings = {
        job_requires_approval: settings.job_requires_approval,
        max_images_per_job: settings.max_images_per_job,
        job_expiry_days: settings.job_expiry_days,
        featured_job_price: settings.featured_job_price,
        min_pay_amount: settings.min_pay_amount,
        max_pay_amount: settings.max_pay_amount,
      };
      updateMutation.mutate(jobSettings);
    } else if (activeSection === 'appversion') {
      // Only update app version settings
      const appVersionSettings = {
        min_app_version_ios: settings.min_app_version_ios,
        min_app_version_android: settings.min_app_version_android,
        force_update_message: settings.force_update_message,
        app_store_url: settings.app_store_url,
        play_store_url: settings.play_store_url,
      };
      updateMutation.mutate(appVersionSettings);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  const ToggleSwitch = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'jobs':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Job Approval Required</p>
                <p className="text-sm text-gray-500">New jobs require admin approval before going live</p>
              </div>
              <ToggleSwitch
                enabled={settings.job_requires_approval}
                onChange={(value) => setSettings({ ...settings, job_requires_approval: value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Max Images Per Job"
                type="number"
                value={settings.max_images_per_job.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, max_images_per_job: parseInt(e.target.value) })
                }
              />
              <Input
                label="Job Expiry (Days)"
                type="number"
                value={settings.job_expiry_days.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, job_expiry_days: parseInt(e.target.value) })
                }
              />
              <Input
                label="Featured Job Price (£)"
                type="number"
                step="0.01"
                value={settings.featured_job_price.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, featured_job_price: parseFloat(e.target.value) })
                }
              />
              <Input
                label="Minimum Pay Amount (£)"
                type="number"
                value={settings.min_pay_amount.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, min_pay_amount: parseInt(e.target.value) })
                }
              />
              <Input
                label="Maximum Pay Amount (£)"
                type="number"
                value={settings.max_pay_amount.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, max_pay_amount: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-sm text-gray-500">
                  Enable maintenance mode to temporarily disable the platform
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.maintenance_mode}
                onChange={(value) => setSettings({ ...settings, maintenance_mode: value })}
              />
            </div>
            {settings.maintenance_mode && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 font-medium">Maintenance Mode is Active</p>
                <p className="text-amber-600 text-sm mt-1">
                  Users will see the maintenance message instead of the platform.
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maintenance Message
              </label>
              <textarea
                value={settings.maintenance_message}
                onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Enter maintenance message..."
              />
            </div>
          </div>
        );

      case 'appversion':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">Force Update Configuration</p>
              <p className="text-blue-600 text-sm mt-1">
                Set minimum required app versions. Users with older versions will be forced to update.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Minimum iOS Version"
                value={settings.min_app_version_ios}
                onChange={(e) => setSettings({ ...settings, min_app_version_ios: e.target.value })}
                placeholder="1.0.0"
              />
              <Input
                label="Minimum Android Version"
                value={settings.min_app_version_android}
                onChange={(e) => setSettings({ ...settings, min_app_version_android: e.target.value })}
                placeholder="1.0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Force Update Message
              </label>
              <textarea
                value={settings.force_update_message}
                onChange={(e) => setSettings({ ...settings, force_update_message: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Message shown to users who need to update..."
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Input
                label="App Store URL (iOS)"
                value={settings.app_store_url}
                onChange={(e) => setSettings({ ...settings, app_store_url: e.target.value })}
                placeholder="https://apps.apple.com/app/..."
              />
              <Input
                label="Play Store URL (Android)"
                value={settings.play_store_url}
                onChange={(e) => setSettings({ ...settings, play_store_url: e.target.value })}
                placeholder="https://play.google.com/store/apps/..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage platform configuration</p>
          </div>
          <Button variant="primary" onClick={handleSave} disabled={updateMutation.isPending || maintenanceMutation.isPending}>
            {updateMutation.isPending || maintenanceMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {section.icon}
                      <div>
                        <p className="font-medium text-sm">{section.title}</p>
                        <p className="text-xs text-gray-500">{section.description}</p>
                      </div>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {sections.find((s) => s.id === activeSection)?.title} Settings
                </CardTitle>
              </CardHeader>
              <CardContent>{renderSettingsContent()}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
