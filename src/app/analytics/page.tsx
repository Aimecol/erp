'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, BarChart3, PieChart, LineChart, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { usePermissions } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { CustomReport } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AnalyticsPage() {
  const { canRead, canCreate, canUpdate, isAdmin, isBursar, isAuditor } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Check permissions
  if (!canRead('analytics')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view analytics.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['analytics', 'reports', { 
      search: searchTerm, 
      category: selectedCategory, 
      type: selectedType,
      status: selectedStatus 
    }],
    queryFn: () => api.get('/v1/analytics/reports', {
      params: {
        search: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: analyticsStats } = useQuery({
    queryKey: ['analytics', 'dashboard-stats'],
    queryFn: () => api.get('/v1/analytics/dashboard-stats'),
  });

  const reports = reportsData?.data || [];
  const stats = analyticsStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      inactive: 'secondary',
      draft: 'outline',
      error: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, any> = {
      financial: 'default',
      academic: 'secondary',
      operational: 'outline',
      compliance: 'destructive',
      custom: 'secondary'
    };
    return variants[category] || 'outline';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chart':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'dashboard':
        return <PieChart className="h-4 w-4 text-green-500" />;
      case 'tabular':
        return <LineChart className="h-4 w-4 text-purple-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'reportName',
      header: 'Report Name',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(row.original.reportType)}
          <div>
            <div className="font-medium">{row.original.reportName}</div>
            <div className="text-sm text-muted-foreground">{row.original.description}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: any) => (
        <Badge variant={getCategoryBadge(row.original.category)}>
          {row.original.category.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'reportType',
      header: 'Type',
      cell: ({ row }: any) => (
        <div className="text-sm capitalize">{row.original.reportType}</div>
      ),
    },
    {
      accessorKey: 'lastRunAt',
      header: 'Last Run',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.lastRunAt ? formatDate(row.original.lastRunAt) : 'Never'}
        </div>
      ),
    },
    {
      accessorKey: 'nextRunAt',
      header: 'Next Run',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.nextRunAt ? formatDate(row.original.nextRunAt) : 'Manual'}
        </div>
      ),
    },
    {
      accessorKey: 'createdBy',
      header: 'Created By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.createdBy}</div>
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
          <Button variant="ghost" size="sm" title="View Report">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('analytics') && (
            <Button variant="ghost" size="sm" title="Edit Report">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" title="Run Report">
            <TrendingUp className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Advanced Reporting & Analytics</h1>
              <p className="text-muted-foreground">
                Create custom reports, dashboards, and data visualizations for INES-Ruhengeri
              </p>
            </div>
            {canCreate('analytics') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            )}
          </div>

          {/* Analytics Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalReports || 89}</div>
                <p className="text-xs text-muted-foreground">
                  Custom reports created
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Dashboards</CardTitle>
                <PieChart className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeDashboards || 23}</div>
                <p className="text-xs text-muted-foreground">
                  Live dashboards
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
                <LineChart className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.scheduledReports || 34}</div>
                <p className="text-xs text-muted-foreground">
                  Automated reports
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Exports</CardTitle>
                <Download className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.dataExports || 156}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Financial Analytics</CardTitle>
                <CardDescription>
                  Revenue, expenses, and profitability
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <PieChart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Academic Analytics</CardTitle>
                <CardDescription>
                  Student performance and enrollment
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <LineChart className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Operational Analytics</CardTitle>
                <CardDescription>
                  Efficiency and resource utilization
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <TrendingUp className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Custom Reports</CardTitle>
                <CardDescription>
                  Build your own reports
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  Create Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports & Analytics</CardTitle>
              <CardDescription>
                View and manage all custom reports, dashboards, and data visualizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="tabular">Tabular</SelectItem>
                    <SelectItem value="chart">Chart</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="pivot">Pivot</SelectItem>
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={reports}
                loading={isLoading}
                searchable={false}
                filterable={false}
              />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
