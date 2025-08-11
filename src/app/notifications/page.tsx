'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, Bell, MessageSquare, Mail, Smartphone } from 'lucide-react';
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
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const { canRead, canCreate, canUpdate, isAdmin, isBursar } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Check permissions
  if (!canRead('notifications')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view notifications.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', 'list', { 
      search: searchTerm, 
      type: selectedType, 
      status: selectedStatus 
    }],
    queryFn: () => api.get('/v1/notifications', {
      params: {
        search: searchTerm,
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: notificationStats } = useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: () => api.get('/v1/notifications/stats'),
  });

  const { data: smsTemplates } = useQuery({
    queryKey: ['notifications', 'sms-templates'],
    queryFn: () => api.get('/v1/notifications/sms-templates'),
  });

  const notifications = notificationsData?.data || [];
  const stats = notificationStats?.data || {};
  const templates = smsTemplates?.data || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      sent: 'secondary',
      delivered: 'default',
      failed: 'destructive',
      read: 'default'
    };
    return variants[status] || 'outline';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      sms: 'default',
      email: 'secondary',
      push: 'outline',
      in_app: 'destructive'
    };
    return variants[type] || 'outline';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'push':
        return <Smartphone className="h-4 w-4 text-purple-500" />;
      case 'in_app':
        return <Bell className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'title',
      header: 'Notification',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(row.original.type)}
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-sm text-muted-foreground">{row.original.message}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant={getTypeBadge(row.original.type)}>
          {row.original.type.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'recipients',
      header: 'Recipients',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.recipientCount || 0} recipients
        </div>
      ),
    },
    {
      accessorKey: 'scheduledAt',
      header: 'Scheduled',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.scheduledAt ? formatDate(row.original.scheduledAt) : 'Immediate'}
        </div>
      ),
    },
    {
      accessorKey: 'sentAt',
      header: 'Sent',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.sentAt ? formatDate(row.original.sentAt) : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={getStatusBadge(row.original.status)}>
          {row.original.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Notification">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('notifications') && row.original.status === 'draft' && (
            <Button variant="ghost" size="sm" title="Edit Notification">
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
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
              <h1 className="text-3xl font-bold tracking-tight">Notifications & Alerts</h1>
              <p className="text-muted-foreground">
                Manage SMS alerts, email notifications, and mobile push notifications
              </p>
            </div>
            {canCreate('notifications') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            )}
          </div>

          {/* Notification Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Bell className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalSent || 2456}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMS Alerts</CardTitle>
                <MessageSquare className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.smsSent || 1234}</div>
                <p className="text-xs text-muted-foreground">
                  Fee reminders sent
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Notifications</CardTitle>
                <Mail className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.emailSent || 987}</div>
                <p className="text-xs text-muted-foreground">
                  Reports and updates
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                <Smartphone className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.deliveryRate || 98.5}%</div>
                <p className="text-xs text-muted-foreground">
                  Success rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="notifications" className="space-y-4">
            <TabsList>
              <TabsTrigger value="notifications">All Notifications</TabsTrigger>
              <TabsTrigger value="sms-templates">SMS Templates</TabsTrigger>
              <TabsTrigger value="fee-reminders">Fee Reminders</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification History</CardTitle>
                  <CardDescription>
                    View and manage all sent notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search notifications..."
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
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                        <SelectItem value="in_app">In-App</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <DataTable
                    columns={columns}
                    data={notifications}
                    loading={isLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sms-templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SMS Templates</CardTitle>
                  <CardDescription>
                    Manage SMS templates for automated notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {templates.map((template: any) => (
                      <Card key={template.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-sm">{template.content}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">{template.category}</Badge>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fee-reminders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Reminder Settings</CardTitle>
                  <CardDescription>
                    Configure automated fee reminder notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">First Reminder</CardTitle>
                          <CardDescription>7 days before due date</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">SMS Enabled</span>
                              <Badge variant="default">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Email Enabled</span>
                              <Badge variant="default">Active</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                              Configure
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Final Notice</CardTitle>
                          <CardDescription>1 day after due date</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">SMS Enabled</span>
                              <Badge variant="default">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Email Enabled</span>
                              <Badge variant="default">Active</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                              Configure
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure notification channels and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">SMS Configuration</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">SMS Provider</label>
                          <Select defaultValue="mtn">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mtn">MTN Rwanda</SelectItem>
                              <SelectItem value="airtel">Airtel Rwanda</SelectItem>
                              <SelectItem value="tigo">Tigo Rwanda</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Sender ID</label>
                          <Input defaultValue="INES-RU" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Email Configuration</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">SMTP Server</label>
                          <Input defaultValue="smtp.ines.ac.rw" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">From Email</label>
                          <Input defaultValue="noreply@ines.ac.rw" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>Save Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
