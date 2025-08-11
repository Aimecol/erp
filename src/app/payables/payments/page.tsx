'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, DollarSign, CheckCircle, Calendar, CreditCard } from 'lucide-react';
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
import { VendorPayment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function VendorPaymentsPage() {
  const { canRead, canCreate, canUpdate, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedMethod, setSelectedMethod] = React.useState('all');
  const [selectedVendor, setSelectedVendor] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('month');

  // Check permissions
  if (!canRead('payables')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view vendor payments.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payables', 'payments', { 
      search: searchTerm, 
      status: selectedStatus, 
      method: selectedMethod,
      vendor: selectedVendor,
      dateRange 
    }],
    queryFn: () => api.get('/v1/payables/payments', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        method: selectedMethod !== 'all' ? selectedMethod : undefined,
        vendor: selectedVendor !== 'all' ? selectedVendor : undefined,
        dateRange,
      }
    }),
  });

  const { data: paymentStats } = useQuery({
    queryKey: ['payables', 'payment-stats', dateRange],
    queryFn: () => api.get('/v1/payables/payments/stats', {
      params: { dateRange }
    }),
  });

  const payments = paymentsData?.data || [];
  const stats = paymentStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'outline',
      approved: 'secondary',
      processed: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getMethodBadge = (method: string) => {
    const variants: Record<string, any> = {
      bank_transfer: 'default',
      cheque: 'secondary',
      mobile_money: 'outline',
      cash: 'destructive'
    };
    return variants[method] || 'outline';
  };

  const columns = [
    {
      accessorKey: 'paymentNumber',
      header: 'Payment Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.paymentNumber}</div>
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
      accessorKey: 'paymentDate',
      header: 'Payment Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.paymentDate)}</div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.amount)}</div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }: any) => (
        <Badge variant={getMethodBadge(row.original.paymentMethod)}>
          {row.original.paymentMethod.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.reference || '-'}</div>
      ),
    },
    {
      accessorKey: 'invoicesCount',
      header: 'Invoices Paid',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.invoices?.length || 0} invoices</div>
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
      accessorKey: 'processedBy',
      header: 'Processed By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.processedBy || '-'}</div>
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
          {canUpdate('payables') && row.original.status === 'pending' && (
            <Button variant="ghost" size="sm" title="Approve Payment">
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
              <h1 className="text-3xl font-bold tracking-tight">Vendor Payments</h1>
              <p className="text-muted-foreground">
                Manage and track all vendor payments and transactions
              </p>
            </div>
            {canCreate('payables') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
          </div>

          {/* Payment Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalPayments || 285000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.paymentCount || 156} payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.pendingApproval || 15000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingCount || 8} payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bank Transfers</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.bankTransfers || 245000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((stats.bankTransfers || 245000000) / (stats.totalPayments || 285000000) * 100).toFixed(0)}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.averagePayment || 1827000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per transaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payments List */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Payments</CardTitle>
              <CardDescription>
                View and manage all vendor payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
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
                  </SelectContent>
                </Select>

                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
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
                data={payments}
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
