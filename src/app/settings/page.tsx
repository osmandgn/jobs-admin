'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Database,
  Save,
  RefreshCw,
  Check,
  Loader2,
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
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);

  // Default settings state
  const defaultSettings = {
    // General
    siteName: 'GigHub UK',
    siteDescription: 'UK Gig Economy Platform',
    supportEmail: 'support@gighub.uk',
    contactPhone: '+44 20 1234 5678',
    timezone: 'Europe/London',
    currency: 'GBP',

    // Jobs
    jobApprovalRequired: true,
    maxImagesPerJob: 5,
    jobExpiryDays: 30,
    featuredJobPrice: 9.99,
    minPayAmount: 10,
    maxPayAmount: 10000,

    // Users
    emailVerificationRequired: true,
    phoneVerificationRequired: false,
    profilePhotoRequired: false,
    maxProfilePhotoSize: 5,
    allowSocialLogin: true,

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    weeklyDigest: true,

    // Security
    twoFactorEnabled: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChars: true,

    // Payments
    stripeEnabled: true,
    paypalEnabled: false,
    platformFeePercent: 10,
    minimumWithdrawal: 50,
    withdrawalProcessingDays: 3,

    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
  };

  const [settings, setSettings] = useState(defaultSettings);

  // Load settings from API
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsAPI.getAll,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Record<string, any>) => settingsAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  // Update local settings when API data loads
  useEffect(() => {
    if (settingsData) {
      const apiSettings = (settingsData as any)?.data || settingsData;
      if (apiSettings && typeof apiSettings === 'object') {
        setSettings((prev) => ({ ...prev, ...apiSettings }));
      }
    }
  }, [settingsData]);

  const sections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General',
      icon: <Globe className="w-5 h-5" />,
      description: 'Basic site configuration',
    },
    {
      id: 'jobs',
      title: 'Jobs',
      icon: <Database className="w-5 h-5" />,
      description: 'Job posting settings',
    },
    {
      id: 'users',
      title: 'Users',
      icon: <Shield className="w-5 h-5" />,
      description: 'User account settings',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Email and push notifications',
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Security and authentication',
    },
    {
      id: 'payments',
      title: 'Payments',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Payment gateway settings',
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      icon: <Settings className="w-5 h-5" />,
      description: 'Maintenance mode settings',
    },
  ];

  const handleSave = async () => {
    updateMutation.mutate(settings);
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
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Site Name"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
              <Input
                label="Site Description"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              />
              <Input
                label="Support Email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
              <Input
                label="Contact Phone"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New York (EST)</option>
                  <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="GBP">British Pound (£)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'jobs':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Job Approval Required</p>
                <p className="text-sm text-gray-500">New jobs require admin approval before going live</p>
              </div>
              <ToggleSwitch
                enabled={settings.jobApprovalRequired}
                onChange={(value) => setSettings({ ...settings, jobApprovalRequired: value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Max Images Per Job"
                type="number"
                value={settings.maxImagesPerJob.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, maxImagesPerJob: parseInt(e.target.value) })
                }
              />
              <Input
                label="Job Expiry (Days)"
                type="number"
                value={settings.jobExpiryDays.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, jobExpiryDays: parseInt(e.target.value) })
                }
              />
              <Input
                label="Featured Job Price (£)"
                type="number"
                step="0.01"
                value={settings.featuredJobPrice.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, featuredJobPrice: parseFloat(e.target.value) })
                }
              />
              <Input
                label="Minimum Pay Amount (£)"
                type="number"
                value={settings.minPayAmount.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, minPayAmount: parseInt(e.target.value) })
                }
              />
              <Input
                label="Maximum Pay Amount (£)"
                type="number"
                value={settings.maxPayAmount.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, maxPayAmount: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Email Verification Required</p>
                <p className="text-sm text-gray-500">Users must verify email before accessing features</p>
              </div>
              <ToggleSwitch
                enabled={settings.emailVerificationRequired}
                onChange={(value) => setSettings({ ...settings, emailVerificationRequired: value })}
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Phone Verification Required</p>
                <p className="text-sm text-gray-500">Users must verify phone number</p>
              </div>
              <ToggleSwitch
                enabled={settings.phoneVerificationRequired}
                onChange={(value) => setSettings({ ...settings, phoneVerificationRequired: value })}
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Profile Photo Required</p>
                <p className="text-sm text-gray-500">Users must upload a profile photo</p>
              </div>
              <ToggleSwitch
                enabled={settings.profilePhotoRequired}
                onChange={(value) => setSettings({ ...settings, profilePhotoRequired: value })}
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Allow Social Login</p>
                <p className="text-sm text-gray-500">Enable Google and Apple sign-in</p>
              </div>
              <ToggleSwitch
                enabled={settings.allowSocialLogin}
                onChange={(value) => setSettings({ ...settings, allowSocialLogin: value })}
              />
            </div>
            <Input
              label="Max Profile Photo Size (MB)"
              type="number"
              value={settings.maxProfilePhotoSize.toString()}
              onChange={(e) =>
                setSettings({ ...settings, maxProfilePhotoSize: parseInt(e.target.value) })
              }
            />
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Send email notifications to users</p>
              </div>
              <ToggleSwitch
                enabled={settings.emailNotifications}
                onChange={(value) => setSettings({ ...settings, emailNotifications: value })}
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Send push notifications to mobile devices</p>
              </div>
              <ToggleSwitch
                enabled={settings.pushNotifications}
                onChange={(value) => setSettings({ ...settings, pushNotifications: value })}
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Send SMS notifications for important updates</p>
              </div>
              <ToggleSwitch
                enabled={settings.smsNotifications}
                onChange={(value) => setSettings({ ...settings, smsNotifications: value })}
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Marketing Emails</p>
                <p className="text-sm text-gray-500">Send promotional and marketing emails</p>
              </div>
              <ToggleSwitch
                enabled={settings.marketingEmails}
                onChange={(value) => setSettings({ ...settings, marketingEmails: value })}
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Weekly Digest</p>
                <p className="text-sm text-gray-500">Send weekly summary emails to users</p>
              </div>
              <ToggleSwitch
                enabled={settings.weeklyDigest}
                onChange={(value) => setSettings({ ...settings, weeklyDigest: value })}
              />
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
              </div>
              <ToggleSwitch
                enabled={settings.twoFactorEnabled}
                onChange={(value) => setSettings({ ...settings, twoFactorEnabled: value })}
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Require Special Characters</p>
                <p className="text-sm text-gray-500">Passwords must contain special characters</p>
              </div>
              <ToggleSwitch
                enabled={settings.requireSpecialChars}
                onChange={(value) => setSettings({ ...settings, requireSpecialChars: value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Session Timeout (minutes)"
                type="number"
                value={settings.sessionTimeout.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                }
              />
              <Input
                label="Max Login Attempts"
                type="number"
                value={settings.maxLoginAttempts.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })
                }
              />
              <Input
                label="Minimum Password Length"
                type="number"
                value={settings.passwordMinLength.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">Stripe Payments</p>
                <p className="text-sm text-gray-500">Enable Stripe payment processing</p>
              </div>
              <ToggleSwitch
                enabled={settings.stripeEnabled}
                onChange={(value) => setSettings({ ...settings, stripeEnabled: value })}
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium text-gray-900">PayPal Payments</p>
                <p className="text-sm text-gray-500">Enable PayPal payment processing</p>
              </div>
              <ToggleSwitch
                enabled={settings.paypalEnabled}
                onChange={(value) => setSettings({ ...settings, paypalEnabled: value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Platform Fee (%)"
                type="number"
                value={settings.platformFeePercent.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, platformFeePercent: parseInt(e.target.value) })
                }
              />
              <Input
                label="Minimum Withdrawal (£)"
                type="number"
                value={settings.minimumWithdrawal.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, minimumWithdrawal: parseInt(e.target.value) })
                }
              />
              <Input
                label="Withdrawal Processing (Days)"
                type="number"
                value={settings.withdrawalProcessingDays.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, withdrawalProcessingDays: parseInt(e.target.value) })
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
                enabled={settings.maintenanceMode}
                onChange={(value) => setSettings({ ...settings, maintenanceMode: value })}
              />
            </div>
            {settings.maintenanceMode && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 font-medium">⚠️ Maintenance Mode is Active</p>
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
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Enter maintenance message..."
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
          <Button variant="primary" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
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
