'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, Settings, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function IntegrationsPage() {
  const { canRead, canCreate, canUpdate, isAdmin, isBursar } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Check permissions
  if (!canRead('integrations')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view integrations.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: integrationsData, isLoading } = useQuery({
    queryKey: ['integrations', 'list', { 
      search: searchTerm, 
      type: selectedType, 
      status: selectedStatus 
    }],
    queryFn: () => api.get('/v1/integrations', {
      params: {
        search: searchTerm,
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: integrationStats } = useQuery({
    queryKey: ['integrations', 'stats'],
    queryFn: () => api.get('/v1/integrations/stats'),
  });

  const { data: syncLogs } = useQuery({
    queryKey: ['integrations', 'sync-logs'],
    queryFn: () => api.get('/v1/integrations/sync-logs'),
  });

  const integrations = integrationsData?.data || [];
  const stats = integrationStats?.data || {};
  const logs = syncLogs?.data || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
      testing: 'outline'
    };
    return variants[status] || 'outline';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      api: 'default',
      webhook: 'secondary',
      file_sync: 'outline',
      database: 'destructive',
      sso: 'secondary'
    };
    return variants[type] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Activity className="h-4 w-4 text-orange-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Integration',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.provider}</div>
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
      accessorKey: 'lastSync',
      header: 'Last Sync',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.lastSync ? formatDate(row.original.lastSync) : 'Never'}
        </div>
      ),
    },
    {
      accessorKey: 'nextSync',
      header: 'Next Sync',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.nextSync ? formatDate(row.original.nextSync) : 'Manual'}
        </div>
      ),
    },
    {
      accessorKey: 'errorCount',
      header: 'Errors',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.errorCount > 0 ? (
            <Badge variant="destructive">{row.original.errorCount}</Badge>
          ) : (
            <span className="text-green-600">0</span>
          )}
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
          <Button variant="ghost" size="sm" title="View Integration">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('integrations') && (
            <Button variant="ghost" size="sm" title="Configure Integration">
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" title="Test Connection">
            <Activity className="h-4 w-4" />
          </Button>
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
              <h1 className="text-3xl font-bold tracking-tight">External System Integrations</h1>
              <p className="text-muted-foreground">
                Manage integrations with RRA, banks, payment gateways, and other external systems
              </p>
            </div>
            {canCreate('integrations') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            )}
          </div>

          {/* Integration Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                <Settings className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalIntegrations || 12}</div>
                <p className="text-xs text-muted-foreground">
                  Configured systems
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeIntegrations || 10}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.activeIntegrations || 10) / (stats.totalIntegrations || 12) * 100).toFixed(0)}% uptime
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Operations</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.syncOperations || 1456}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.errorRate || 2.1}%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="integrations" className="space-y-4">
            <TabsList>
              <TabsTrigger value="integrations">All Integrations</TabsTrigger>
              <TabsTrigger value="rra">RRA Integration</TabsTrigger>
              <TabsTrigger value="banking">Banking & Payments</TabsTrigger>
              <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Integrations</CardTitle>
                  <CardDescription>
                    View and manage all external system integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search integrations..."
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
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="file_sync">File Sync</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="sso">SSO</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <DataTable
                    columns={columns}
                    data={integrations}
                    loading={isLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rra" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>RRA Tax Integration</CardTitle>
                    <CardDescription>
                      Rwanda Revenue Authority tax compliance integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Connection Status</span>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Sync</span>
                        <span className="text-sm text-muted-foreground">2 hours ago</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">VAT Returns Submitted</span>
                        <span className="text-sm font-medium">12</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Invoices Validated</span>
                        <span className="text-sm font-medium">2,456</span>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure RRA Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Electronic Billing</CardTitle>
                    <CardDescription>
                      RRA-compliant electronic billing system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">EBM Integration</span>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Invoices Generated</span>
                        <span className="text-sm font-medium">1,234</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Success Rate</span>
                        <span className="text-sm font-medium">99.2%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Compliance Score</span>
                          <span>98%</span>
                        </div>
                        <Progress value={98} className="h-2" />
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View EBM Dashboard
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="banking" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Bank of Kigali</CardTitle>
                    <CardDescription>
                      Primary banking integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Account Balance</span>
                        <span className="text-sm font-medium">RWF 850M</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Transactions Today</span>
                        <span className="text-sm font-medium">45</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Statements
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>MTN Mobile Money</CardTitle>
                    <CardDescription>
                      Mobile payment integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Payments Received</span>
                        <span className="text-sm font-medium">234</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Success Rate</span>
                        <span className="text-sm font-medium">97.8%</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Configure API
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Airtel Money</CardTitle>
                    <CardDescription>
                      Alternative mobile payment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <Badge variant="secondary">Testing</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Test Transactions</span>
                        <span className="text-sm font-medium">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Configuration</span>
                        <span className="text-sm font-medium">80%</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Complete Setup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sync-logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Synchronization Logs</CardTitle>
                  <CardDescription>
                    Recent sync operations and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {logs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(log.status)}
                          <div>
                            <div className="font-medium text-sm">{log.integration}</div>
                            <div className="text-xs text-muted-foreground">{log.operation}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatDate(log.timestamp)}</div>
                          <div className="text-xs text-muted-foreground">{log.duration}ms</div>
                        </div>
                      </div>
                    ))}
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
