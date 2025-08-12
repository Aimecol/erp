'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, RefreshCw, Database, Shield, Bell, Globe, Palette, Monitor, Users, Key, AlertTriangle, Send } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { toast } from '@/components/ui/toast';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  
  const [systemSettings, setSystemSettings] = React.useState({
    siteName: 'IKIGUGU ERP',
    siteDescription: 'Enterprise Resource Planning System',
    contactEmail: 'admin@ikigugu.rw',
    supportPhone: '+250 788 123 456',
    address: 'Kigali, Rwanda',
    timezone: 'Africa/Kigali',
    currency: 'RWF',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    fiscalYearStart: '01/01',
    backupFrequency: 'daily',
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordMinLength: '8',
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    twoFactorRequired: false,
    emailVerificationRequired: true,
    maintenanceMode: false,
    registrationEnabled: true,
    guestAccessEnabled: false,
    auditLogging: true,
    errorLogging: true,
    performanceMonitoring: true,
  });

  const [emailSettings, setEmailSettings] = React.useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    fromEmail: '',
    fromName: '',
    replyToEmail: '',
  });

  const [notificationSettings, setNotificationSettings] = React.useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    slackIntegration: false,
    webhookUrl: '',
    notifyOnLogin: true,
    notifyOnFailedLogin: true,
    notifyOnSystemError: true,
    notifyOnBackup: false,
    notifyOnUpdate: true,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<ApiResponse<any>>('/v1/settings'),
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => api.get<ApiResponse<any>>('/v1/system/health'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => api.put('/v1/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: () => api.post('/v1/settings/test-email'),
    onSuccess: () => {
      toast.success('Test email sent successfully');
    },
    onError: () => {
      toast.error('Failed to send test email');
    },
  });

  const backupSystemMutation = useMutation({
    mutationFn: () => api.post('/v1/system/backup'),
    onSuccess: () => {
      toast.success('System backup initiated');
    },
    onError: () => {
      toast.error('Failed to initiate backup');
    },
  });

  React.useEffect(() => {
    if (settings?.data) {
      const data = settings.data;
      setSystemSettings(prev => ({ ...prev, ...data.system }));
      setEmailSettings(prev => ({ ...prev, ...data.email }));
      setNotificationSettings(prev => ({ ...prev, ...data.notifications }));
    }
  }, [settings]);

  const handleSaveSettings = (section: string) => {
    const data = {
      system: systemSettings,
      email: emailSettings,
      notifications: notificationSettings,
    };
    updateSettingsMutation.mutate(data);
  };

  const health = systemHealth?.data;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
              <p className="text-muted-foreground">
                Configure system-wide settings and preferences
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => backupSystemMutation.mutate()}>
                <Database className="h-4 w-4 mr-2" />
                Backup System
              </Button>
            </div>
          </div>

          {/* System Health Status */}
          {health && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${health.database ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Database</span>
                    <Badge variant={health.database ? 'default' : 'destructive'}>
                      {health.database ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${health.redis ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Cache</span>
                    <Badge variant={health.redis ? 'default' : 'destructive'}>
                      {health.redis ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${health.storage ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Storage</span>
                    <Badge variant={health.storage ? 'default' : 'destructive'}>
                      {health.storage ? 'Available' : 'Full'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${health.email ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Email</span>
                    <Badge variant={health.email ? 'default' : 'destructive'}>
                      {health.email ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure basic system information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Site Name</label>
                      <Input
                        value={systemSettings.siteName}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                        placeholder="Enter site name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Email</label>
                      <Input
                        type="email"
                        value={systemSettings.contactEmail}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="Enter contact email"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Support Phone</label>
                      <Input
                        value={systemSettings.supportPhone}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                        placeholder="Enter support phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Address</label>
                      <Input
                        value={systemSettings.address}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter address"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timezone</label>
                      <Select
                        value={systemSettings.timezone}
                        onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Africa/Kigali">Africa/Kigali</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Currency</label>
                      <Select
                        value={systemSettings.currency}
                        onValueChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RWF">RWF - Rwandan Franc</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Site Description</label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                      value={systemSettings.siteDescription}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                      placeholder="Enter site description"
                    />
                  </div>

                  <Button onClick={() => handleSaveSettings('general')} disabled={updateSettingsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure authentication and security policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Session Timeout (minutes)</label>
                      <Input
                        type="number"
                        value={systemSettings.sessionTimeout}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                        placeholder="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Login Attempts</label>
                      <Input
                        type="number"
                        value={systemSettings.maxLoginAttempts}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
                        placeholder="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password Min Length</label>
                      <Input
                        type="number"
                        value={systemSettings.passwordMinLength}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, passwordMinLength: e.target.value }))}
                        placeholder="8"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Require Special Characters</p>
                        <p className="text-sm text-muted-foreground">
                          Passwords must contain special characters
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.passwordRequireSpecial}
                        onCheckedChange={(checked) =>
                          setSystemSettings(prev => ({ ...prev, passwordRequireSpecial: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Require Numbers</p>
                        <p className="text-sm text-muted-foreground">
                          Passwords must contain numbers
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.passwordRequireNumbers}
                        onCheckedChange={(checked) =>
                          setSystemSettings(prev => ({ ...prev, passwordRequireNumbers: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication Required</p>
                        <p className="text-sm text-muted-foreground">
                          Require 2FA for all users
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.twoFactorRequired}
                        onCheckedChange={(checked) =>
                          setSystemSettings(prev => ({ ...prev, twoFactorRequired: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings('security')} disabled={updateSettingsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>
                    Configure SMTP settings for email notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">SMTP Host</label>
                      <Input
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">SMTP Port</label>
                      <Input
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                        placeholder="587"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        value={emailSettings.smtpUsername}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                        placeholder="your-email@domain.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From Email</label>
                      <Input
                        value={emailSettings.fromEmail}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                        placeholder="noreply@ikigugu.rw"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From Name</label>
                      <Input
                        value={emailSettings.fromName}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                        placeholder="IKIGUGU ERP"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={() => handleSaveSettings('email')} disabled={updateSettingsMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Email Settings
                    </Button>
                    <Button variant="outline" onClick={() => testEmailMutation.mutate()} disabled={testEmailMutation.isPending}>
                      <Send className="h-4 w-4 mr-2" />
                      Test Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure system notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Send notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Send notifications via SMS
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notify on Failed Login</p>
                        <p className="text-sm text-muted-foreground">
                          Alert administrators of failed login attempts
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.notifyOnFailedLogin}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, notifyOnFailedLogin: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings('notifications')} disabled={updateSettingsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Backup & Recovery</CardTitle>
                  <CardDescription>
                    Manage system backups and data recovery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Backup Frequency</label>
                      <Select
                        value={systemSettings.backupFrequency}
                        onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={() => handleSaveSettings('backup')} disabled={updateSettingsMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Backup Settings
                    </Button>
                    <Button variant="outline" onClick={() => backupSystemMutation.mutate()} disabled={backupSystemMutation.isPending}>
                      <Database className="h-4 w-4 mr-2" />
                      Create Backup Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>
                    Advanced system configuration options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Maintenance Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Put system in maintenance mode
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) =>
                          setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Audit Logging</p>
                        <p className="text-sm text-muted-foreground">
                          Enable comprehensive audit logging
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.auditLogging}
                        onCheckedChange={(checked) =>
                          setSystemSettings(prev => ({ ...prev, auditLogging: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings('advanced')} disabled={updateSettingsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Advanced Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
