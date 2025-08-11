'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, CheckCircle, Package, Truck, Calendar } from 'lucide-react';
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
import { GoodsReceiptNote } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function GoodsReceiptsPage() {
  const { canRead, canCreate, canUpdate, isStoreManager, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('month');

  // Check permissions
  if (!canRead('inventory')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view goods receipts.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: receiptsData, isLoading } = useQuery({
    queryKey: ['inventory', 'receipts', { 
      search: searchTerm, 
      status: selectedStatus, 
      warehouse: selectedWarehouse,
      dateRange 
    }],
    queryFn: () => api.get('/v1/inventory/receipts', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        warehouse: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
        dateRange,
      }
    }),
  });

  const { data: receiptStats } = useQuery({
    queryKey: ['inventory', 'receipt-stats', dateRange],
    queryFn: () => api.get('/v1/inventory/receipts/stats', {
      params: { dateRange }
    }),
  });

  const receipts = receiptsData?.data || [];
  const stats = receiptStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      received: 'secondary',
      posted: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'received':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <Package className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'grnNumber',
      header: 'GRN Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.grnNumber}</div>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.supplier?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.supplier?.code}</div>
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
      accessorKey: 'receiptDate',
      header: 'Receipt Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.receiptDate)}</div>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.totalAmount)}</div>
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
      accessorKey: 'receivedBy',
      header: 'Received By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.receivedBy}</div>
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
          {canUpdate('inventory') && row.original.status === 'received' && (
            <Button variant="ghost" size="sm" title="Post to Inventory">
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
              <h1 className="text-3xl font-bold tracking-tight">Goods Receipt Notes</h1>
              <p className="text-muted-foreground">
                Track and manage incoming inventory receipts
              </p>
            </div>
            {canCreate('inventory') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create GRN
              </Button>
            )}
          </div>

          {/* Receipt Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReceipts || 156}</div>
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
                  {formatCurrency(stats.totalValue || 125000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Goods received
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Posting</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingPosting || 8}</div>
                <p className="text-xs text-muted-foreground">
                  Need to be posted
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Processing</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgProcessingTime || 2.5}</div>
                <p className="text-xs text-muted-foreground">
                  Days to process
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Receipts List */}
          <Card>
            <CardHeader>
              <CardTitle>Goods Receipt Notes</CardTitle>
              <CardDescription>
                View and manage all goods receipt transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search receipts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
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
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={receipts}
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
