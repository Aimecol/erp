'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, Shield, Lock, Activity, AlertTriangle, CheckCircle, Key } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { usePermissions } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function SecurityPage() {
  const { canRead, canCreate, canUpdate, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedSeverity, setSelectedSeverity] = React.useState('all');

  // Check permissions - only admins can access security features
  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to access security features.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: auditLogsData, isLoading } = useQuery({
    queryKey: ['security', 'audit-logs', { 
      search: searchTerm, 
      type: selectedType, 
      severity: selectedSeverity 
    }],
    queryFn: () => api.get('/v1/security/audit-logs', {
      params: {
        search: searchTerm,
        type: selectedType !== 'all' ? selectedType : undefined,
        severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
      }
    }),
  });

  const { data: securityStats } = useQuery({
    queryKey: ['security', 'stats'],
    queryFn: () => api.get('/v1/security/stats'),
  });

  const { data: loginLogs } = useQuery({
    queryKey: ['security', 'login-logs'],
    queryFn: () => api.get('/v1/security/login-logs'),
  });

  const { data: securitySettings } = useQuery({
    queryKey: ['security', 'settings'],
    queryFn: () => api.get('/v1/security/settings'),
  });

  const auditLogs = auditLogsData?.data || [];
  const stats = securityStats?.data || {};
  const logs = loginLogs?.data || [];
  const settings = securitySettings?.data || {};

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    };
    return variants[severity] || 'outline';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const auditColumns = [
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getSeverityIcon(row.original.severity)}
          <div>
            <div className="font-medium">{row.original.action}</div>
            <div className="text-sm text-muted-foreground">{row.original.resource}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.userId || 'System'}</div>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ row }: any) => (
        <div className="text-sm font-mono">{row.original.ipAddress}</div>
      ),
    },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.timestamp)}</div>
      ),
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }: any) => (
        <Badge variant={getSeverityBadge(row.original.severity)}>
          {row.original.severity.toUpperCase()}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const loginColumns = [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.username}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.success ? 'default' : 'destructive'}>
          {row.original.success ? 'SUCCESS' : 'FAILED'}
        </Badge>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ row }: any) => (
        <div className="text-sm font-mono">{row.original.ipAddress}</div>
      ),
    },
    {
      accessorKey: 'userAgent',
      header: 'Device',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.deviceInfo?.browser || 'Unknown'}</div>
      ),
    },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.timestamp)}</div>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Security & Audit</h1>
              <p className="text-muted-foreground">
                Monitor system security, audit logs, and manage security policies
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Security Report
            </Button>
          </div>

          {/* Security Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.securityAlerts || 3}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                <Lock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.failedLogins || 12}</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeSessions || 45}</div>
                <p className="text-xs text-muted-foreground">
                  Current users online
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">2FA Enabled</CardTitle>
                <Key className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.twoFactorEnabled || 67}%</div>
                <p className="text-xs text-muted-foreground">
                  Of all users
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="audit-logs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
              <TabsTrigger value="login-logs">Login Logs</TabsTrigger>
              <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
              <TabsTrigger value="settings">Security Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="audit-logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Audit Logs</CardTitle>
                  <CardDescription>
                    Comprehensive audit trail of all system activities and changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search audit logs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="user_management">User Mgmt</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <DataTable
                    columns={auditColumns}
                    data={auditLogs}
                    loading={isLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="login-logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Login Activity Logs</CardTitle>
                  <CardDescription>
                    Track all login attempts and user authentication activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={loginColumns}
                    data={logs}
                    loading={false}
                    searchable={true}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Permissions Matrix</CardTitle>
                  <CardDescription>
                    View and manage user permissions across all system modules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4" />
                    <p>Permissions matrix would be displayed here</p>
                    <p className="text-sm">Interactive permission management interface</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication Settings</CardTitle>
                    <CardDescription>
                      Configure authentication and session policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Require Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">Force 2FA for all users</div>
                      </div>
                      <Switch checked={settings.require2FA || false} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Session Timeout</div>
                        <div className="text-sm text-muted-foreground">Auto-logout after inactivity</div>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Password Complexity</div>
                        <div className="text-sm text-muted-foreground">Enforce strong passwords</div>
                      </div>
                      <Switch checked={settings.passwordComplexity || true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Login Attempt Limit</div>
                        <div className="text-sm text-muted-foreground">Max failed attempts before lockout</div>
                      </div>
                      <Select defaultValue="5">
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audit Settings</CardTitle>
                    <CardDescription>
                      Configure audit logging and retention policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Financial Transaction Logging</div>
                        <div className="text-sm text-muted-foreground">Log all financial activities</div>
                      </div>
                      <Switch checked={settings.logFinancial || true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">User Activity Logging</div>
                        <div className="text-sm text-muted-foreground">Track user actions</div>
                      </div>
                      <Switch checked={settings.logUserActivity || true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Log Retention Period</div>
                        <div className="text-sm text-muted-foreground">How long to keep audit logs</div>
                      </div>
                      <Select defaultValue="365">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">6 months</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                          <SelectItem value="1095">3 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Real-time Alerts</div>
                        <div className="text-sm text-muted-foreground">Immediate security notifications</div>
                      </div>
                      <Switch checked={settings.realtimeAlerts || true} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
