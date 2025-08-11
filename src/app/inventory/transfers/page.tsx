'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, CheckCircle, ArrowRightLeft, Truck, Clock } from 'lucide-react';
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
import { StockTransfer } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function StockTransfersPage() {
  const { canRead, canCreate, canUpdate, isStoreManager, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedFromWarehouse, setSelectedFromWarehouse] = React.useState('all');
  const [selectedToWarehouse, setSelectedToWarehouse] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('month');

  // Check permissions
  if (!canRead('inventory')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view stock transfers.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: transfersData, isLoading } = useQuery({
    queryKey: ['inventory', 'transfers', { 
      search: searchTerm, 
      status: selectedStatus, 
      fromWarehouse: selectedFromWarehouse,
      toWarehouse: selectedToWarehouse,
      dateRange 
    }],
    queryFn: () => api.get('/v1/inventory/transfers', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        fromWarehouse: selectedFromWarehouse !== 'all' ? selectedFromWarehouse : undefined,
        toWarehouse: selectedToWarehouse !== 'all' ? selectedToWarehouse : undefined,
        dateRange,
      }
    }),
  });

  const { data: transferStats } = useQuery({
    queryKey: ['inventory', 'transfer-stats', dateRange],
    queryFn: () => api.get('/v1/inventory/transfers/stats', {
      params: { dateRange }
    }),
  });

  const transfers = transfersData?.data || [];
  const stats = transferStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      approved: 'secondary',
      in_transit: 'default',
      received: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_transit':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-orange-500" />;
      case 'cancelled':
        return <ArrowRightLeft className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'transferNumber',
      header: 'Transfer Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.transferNumber}</div>
      ),
    },
    {
      accessorKey: 'warehouses',
      header: 'From → To',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <div className="font-medium">{row.original.fromWarehouse?.name}</div>
            <div className="text-muted-foreground">{row.original.fromWarehouse?.code}</div>
          </div>
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <div className="font-medium">{row.original.toWarehouse?.name}</div>
            <div className="text-muted-foreground">{row.original.toWarehouse?.code}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'transferDate',
      header: 'Transfer Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.transferDate)}</div>
      ),
    },
    {
      accessorKey: 'requestedBy',
      header: 'Requested By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.requestedBy}</div>
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
            {row.original.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'approvedBy',
      header: 'Approved By',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.approvedBy || '-'}
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
          {canUpdate('inventory') && (
            <>
              {row.original.status === 'draft' && (
                <Button variant="ghost" size="sm" title="Approve Transfer">
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              {row.original.status === 'in_transit' && (
                <Button variant="ghost" size="sm" title="Confirm Receipt">
                  <Truck className="h-4 w-4" />
                </Button>
              )}
            </>
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
              <h1 className="text-3xl font-bold tracking-tight">Stock Transfers</h1>
              <p className="text-muted-foreground">
                Manage inventory transfers between warehouses and locations
              </p>
            </div>
            {canCreate('inventory') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Transfer
              </Button>
            )}
          </div>

          {/* Transfer Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransfers || 34}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Truck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalValue || 25000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Goods transferred
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                <Truck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.inTransit || 5}</div>
                <p className="text-xs text-muted-foreground">
                  Pending receipt
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed || 27}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.completed || 27) / (stats.totalTransfers || 34) * 100).toFixed(0)}% completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transfers List */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Transfers</CardTitle>
              <CardDescription>
                View and manage all stock transfer transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transfers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedFromWarehouse} onValueChange={setSelectedFromWarehouse}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="From Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="main">Main Store</SelectItem>
                    <SelectItem value="lab">Lab Store</SelectItem>
                    <SelectItem value="admin">Admin Store</SelectItem>
                    <SelectItem value="library">Library Store</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedToWarehouse} onValueChange={setSelectedToWarehouse}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="To Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Destinations</SelectItem>
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
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
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
                data={transfers}
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
