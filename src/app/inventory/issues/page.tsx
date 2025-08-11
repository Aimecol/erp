'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, CheckCircle, Package, Send, Calendar } from 'lucide-react';
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
import { GoodsIssueNote } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function GoodsIssuesPage() {
  const { canRead, canCreate, canUpdate, isStoreManager, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('month');

  // Check permissions
  if (!canRead('inventory')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view goods issues.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['inventory', 'issues', { 
      search: searchTerm, 
      status: selectedStatus, 
      type: selectedType,
      warehouse: selectedWarehouse,
      dateRange 
    }],
    queryFn: () => api.get('/v1/inventory/issues', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        warehouse: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
        dateRange,
      }
    }),
  });

  const { data: issueStats } = useQuery({
    queryKey: ['inventory', 'issue-stats', dateRange],
    queryFn: () => api.get('/v1/inventory/issues/stats', {
      params: { dateRange }
    }),
  });

  const issues = issuesData?.data || [];
  const stats = issueStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      approved: 'secondary',
      issued: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      department: 'default',
      project: 'secondary',
      maintenance: 'outline',
      consumption: 'destructive',
      transfer: 'default',
      other: 'outline'
    };
    return variants[type] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued':
        return <Send className="h-4 w-4 text-green-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <Package className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'ginNumber',
      header: 'GIN Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.ginNumber}</div>
      ),
    },
    {
      accessorKey: 'issueType',
      header: 'Issue Type',
      cell: ({ row }: any) => (
        <Badge variant={getTypeBadge(row.original.issueType)}>
          {row.original.issueType.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'requestedBy',
      header: 'Requested By',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.requestedBy}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.departmentId && `Dept: ${row.original.departmentId}`}
            {row.original.projectId && `Project: ${row.original.projectId}`}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.warehouse?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.warehouse?.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.issueDate)}</div>
      ),
    },
    {
      accessorKey: 'totalValue',
      header: 'Total Value',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.totalValue)}</div>
      ),
    },
    {
      accessorKey: 'itemCount',
      header: 'Items',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.lines?.length || 0} items</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <Badge variant={getStatusBadge(row.original.status)}>
            {row.original.status.toUpperCase()}
          </Badge>
        </div>
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
          {canUpdate('inventory') && row.original.status === 'approved' && (
            <Button variant="ghost" size="sm" title="Issue Items">
              <Send className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Goods Issue Notes</h1>
              <p className="text-muted-foreground">
                Track and manage outgoing inventory issues
              </p>
            </div>
            {canCreate('inventory') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create GIN
              </Button>
            )}
          </div>

          {/* Issue Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <Send className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalIssues || 89}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Package className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalValue || 45000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Goods issued
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingApproval || 12}</div>
                <p className="text-xs text-muted-foreground">
                  Need approval
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Department Issues</CardTitle>
                <Package className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.departmentIssues || 65}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.departmentIssues || 65) / (stats.totalIssues || 89) * 100).toFixed(0)}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle>Goods Issue Notes</CardTitle>
              <CardDescription>
                View and manage all goods issue transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Issue Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="consumption">Consumption</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    <SelectItem value="main">Main Store</SelectItem>
                    <SelectItem value="lab">Lab Store</SelectItem>
                    <SelectItem value="admin">Admin Store</SelectItem>
                    <SelectItem value="library">Library Store</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={issues}
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
