'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, Eye, CheckCircle, AlertTriangle, Clock, Package } from 'lucide-react';
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
import { ReorderAlert, ExpiryAlert } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InventoryAlertsPage() {
  const { canRead, canUpdate, isStoreManager, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPriority, setSelectedPriority] = React.useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Check permissions
  if (!canRead('inventory')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view inventory alerts.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: reorderAlertsData, isLoading: reorderLoading } = useQuery({
    queryKey: ['inventory', 'reorder-alerts', { 
      search: searchTerm, 
      priority: selectedPriority, 
      warehouse: selectedWarehouse,
      status: selectedStatus 
    }],
    queryFn: () => api.get('/v1/inventory/alerts/reorder', {
      params: {
        search: searchTerm,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        warehouse: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: expiryAlertsData, isLoading: expiryLoading } = useQuery({
    queryKey: ['inventory', 'expiry-alerts', { 
      search: searchTerm, 
      priority: selectedPriority, 
      warehouse: selectedWarehouse,
      status: selectedStatus 
    }],
    queryFn: () => api.get('/v1/inventory/alerts/expiry', {
      params: {
        search: searchTerm,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        warehouse: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: alertStats } = useQuery({
    queryKey: ['inventory', 'alert-stats'],
    queryFn: () => api.get('/v1/inventory/alerts/stats'),
  });

  const reorderAlerts = reorderAlertsData?.data || [];
  const expiryAlerts = expiryAlertsData?.data || [];
  const stats = alertStats?.data || {};

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      critical: 'destructive'
    };
    return variants[priority] || 'outline';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Package className="h-4 w-4 text-blue-500" />;
    }
  };

  const reorderColumns = [
    {
      accessorKey: 'item',
      header: 'Item',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.item?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.item?.code}</div>
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
      accessorKey: 'stockLevels',
      header: 'Stock Levels',
      cell: ({ row }: any) => (
        <div>
          <div className="text-sm">Current: <span className="font-medium">{row.original.currentStock}</span></div>
          <div className="text-sm text-muted-foreground">Reorder: {row.original.reorderLevel}</div>
        </div>
      ),
    },
    {
      accessorKey: 'suggestedOrderQuantity',
      header: 'Suggested Order',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.suggestedOrderQuantity}</div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getPriorityIcon(row.original.priority)}
          <Badge variant={getPriorityBadge(row.original.priority)}>
            {row.original.priority.toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'alertDate',
      header: 'Alert Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.alertDate)}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === 'resolved' ? 'default' : 'outline'}>
          {row.original.status.toUpperCase()}
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
          {canUpdate('inventory') && row.original.status === 'active' && (
            <Button variant="ghost" size="sm" title="Acknowledge">
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const expiryColumns = [
    {
      accessorKey: 'item',
      header: 'Item',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.item?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.item?.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'batch',
      header: 'Batch',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.batch?.batchNumber}</div>
          <div className="text-sm text-muted-foreground">Qty: {row.original.quantity}</div>
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
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }: any) => (
        <div>
          <div className="text-sm">{formatDate(row.original.expiryDate)}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.daysToExpiry} days remaining
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getPriorityIcon(row.original.priority)}
          <Badge variant={getPriorityBadge(row.original.priority)}>
            {row.original.priority.toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Recommended Action',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.action ? row.original.action.replace('_', ' ').toUpperCase() : 'REVIEW'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === 'disposed' ? 'default' : 'outline'}>
          {row.original.status.toUpperCase()}
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
          {canUpdate('inventory') && row.original.status === 'active' && (
            <Button variant="ghost" size="sm" title="Take Action">
              <CheckCircle className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Inventory Alerts</h1>
              <p className="text-muted-foreground">
                Monitor reorder alerts and expiry notifications
              </p>
            </div>
          </div>

          {/* Alert Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts || 8}</div>
                <p className="text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reorder Alerts</CardTitle>
                <Package className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.reorderAlerts || 45}</div>
                <p className="text-xs text-muted-foreground">
                  Items below reorder level
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiry Alerts</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.expiryAlerts || 12}</div>
                <p className="text-xs text-muted-foreground">
                  Items expiring soon
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resolvedToday || 6}</div>
                <p className="text-xs text-muted-foreground">
                  Alerts addressed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>
                Monitor and manage inventory alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alerts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <Tabs defaultValue="reorder" className="w-full">
                <TabsList>
                  <TabsTrigger value="reorder">Reorder Alerts ({reorderAlerts.length})</TabsTrigger>
                  <TabsTrigger value="expiry">Expiry Alerts ({expiryAlerts.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="reorder">
                  <DataTable
                    columns={reorderColumns}
                    data={reorderAlerts}
                    loading={reorderLoading}
                    searchable={false}
                    filterable={false}
                  />
                </TabsContent>
                
                <TabsContent value="expiry">
                  <DataTable
                    columns={expiryColumns}
                    data={expiryAlerts}
                    loading={expiryLoading}
                    searchable={false}
                    filterable={false}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
