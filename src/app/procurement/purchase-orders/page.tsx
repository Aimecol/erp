'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, Send, Truck, CheckCircle, Clock } from 'lucide-react';
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
import { PurchaseOrder } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PurchaseOrdersPage() {
  const { canRead, canCreate, canUpdate, canApprove, isAdmin, isStoreManager } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedVendor, setSelectedVendor] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('month');

  // Check permissions
  if (!canRead('procurement')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view purchase orders.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['procurement', 'purchase-orders', { 
      search: searchTerm, 
      status: selectedStatus, 
      vendor: selectedVendor,
      dateRange 
    }],
    queryFn: () => api.get('/v1/procurement/purchase-orders', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        vendor: selectedVendor !== 'all' ? selectedVendor : undefined,
        dateRange,
      }
    }),
  });

  const { data: orderStats } = useQuery({
    queryKey: ['procurement', 'purchase-order-stats', dateRange],
    queryFn: () => api.get('/v1/procurement/purchase-orders/stats', {
      params: { dateRange }
    }),
  });

  const orders = ordersData?.data || [];
  const stats = orderStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      sent: 'secondary',
      acknowledged: 'default',
      partially_received: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'acknowledged':
      case 'partially_received':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-orange-500" />;
      case 'cancelled':
        return <CheckCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'orderNumber',
      header: 'Order Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.orderNumber}</div>
      ),
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.orderDate)}</div>
      ),
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.vendor?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.vendor?.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'deliveryDate',
      header: 'Delivery Date',
      cell: ({ row }: any) => {
        const deliveryDate = new Date(row.original.deliveryDate);
        const isOverdue = deliveryDate < new Date() && !['completed', 'cancelled'].includes(row.original.status);
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
            {formatDate(row.original.deliveryDate)}
            {isOverdue && <div className="text-xs text-red-500">Overdue</div>}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.totalAmount)}</div>
      ),
    },
    {
      accessorKey: 'vatAmount',
      header: 'VAT Amount',
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{formatCurrency(row.original.vatAmount)}</div>
      ),
    },
    {
      accessorKey: 'grandTotal',
      header: 'Grand Total',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">{formatCurrency(row.original.grandTotal)}</div>
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
      accessorKey: 'createdBy',
      header: 'Created By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.createdBy}</div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Order">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('procurement') && row.original.status === 'draft' && (
            <Button variant="ghost" size="sm" title="Edit Order">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canUpdate('procurement') && row.original.status === 'draft' && (
            <Button variant="ghost" size="sm" title="Send Order">
              <Send className="h-4 w-4" />
            </Button>
          )}
          {canUpdate('procurement') && ['sent', 'acknowledged', 'partially_received'].includes(row.original.status) && (
            <Button variant="ghost" size="sm" title="Receive Goods">
              <Truck className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
              <p className="text-muted-foreground">
                Manage purchase orders and track deliveries
              </p>
            </div>
            {canCreate('procurement') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            )}
          </div>

          {/* Purchase Order Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Send className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalOrders || 189}</div>
                <p className="text-xs text-muted-foreground">
                  This year
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Delivery</CardTitle>
                <Truck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingDelivery || 23}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting delivery
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalValue || 985000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All orders
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.completedOrders || 156}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.completedOrders || 156) / (stats.totalOrders || 189) * 100).toFixed(0)}% completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                View and manage all purchase orders and delivery tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    <SelectItem value="vendor-1">TechSupply Rwanda</SelectItem>
                    <SelectItem value="vendor-2">Office Solutions</SelectItem>
                    <SelectItem value="vendor-3">Lab Equipment Co</SelectItem>
                    <SelectItem value="vendor-4">Construction Materials Ltd</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="partially_received">Partially Received</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
                data={orders}
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
