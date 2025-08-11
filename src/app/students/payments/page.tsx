'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Receipt, CreditCard, Undo2, Eye } from 'lucide-react';
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
import { StudentPayment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function StudentPaymentsPage() {
  const { canRead, canCreate, canUpdate, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('today');

  // Check permissions
  if (!canRead('students')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view student payments.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['students', 'payments', { 
      search: searchTerm, 
      method: selectedMethod, 
      status: selectedStatus,
      dateRange 
    }],
    queryFn: () => api.get('/v1/students/payments', {
      params: {
        search: searchTerm,
        paymentMethod: selectedMethod !== 'all' ? selectedMethod : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        dateRange,
      }
    }),
  });

  const { data: paymentStats } = useQuery({
    queryKey: ['students', 'payment-stats', dateRange],
    queryFn: () => api.get('/v1/students/payments/stats', {
      params: { dateRange }
    }),
  });

  const payments = paymentsData?.data || [];
  const stats = paymentStats?.data || {};

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, any> = {
      cash: 'default',
      bank_transfer: 'secondary',
      mobile_money: 'outline',
      cheque: 'destructive',
      card: 'default'
    };
    return variants[method] || 'outline';
  };

  const columns = [
    {
      accessorKey: 'receiptNumber',
      header: 'Receipt #',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.receiptNumber}</div>
      ),
    },
    {
      accessorKey: 'student',
      header: 'Student',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.student?.firstName} {row.original.student?.lastName}</div>
          <div className="text-sm text-muted-foreground">{row.original.student?.studentId}</div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">{formatCurrency(row.original.amount)}</div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }: any) => (
        <Badge variant={getPaymentMethodBadge(row.original.paymentMethod)}>
          {row.original.paymentMethod.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'paymentReference',
      header: 'Reference',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.paymentReference || '-'}</div>
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
      accessorKey: 'receivedBy',
      header: 'Received By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.receivedBy}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const isReversed = row.original.isReversed;
        return (
          <Badge variant={isReversed ? 'destructive' : 'default'}>
            {isReversed ? 'Reversed' : 'Active'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Receipt">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Print Receipt">
            <Receipt className="h-4 w-4" />
          </Button>
          {canUpdate('students') && !row.original.isReversed && (
            <Button variant="ghost" size="sm" title="Reverse Payment">
              <Undo2 className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Student Payments</h1>
              <p className="text-muted-foreground">
                Record and manage student fee payments and receipts
              </p>
            </div>
            {canCreate('students') && (
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
                <CardTitle className="text-sm font-medium">Today's Collections</CardTitle>
                <CreditCard className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.todayCollections || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.todayPayments || 0} payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.weekCollections || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.weekPayments || 0} payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.monthCollections || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.monthPayments || 0} payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reversed Payments</CardTitle>
                <Undo2 className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.reversedAmount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.reversedPayments || 0} reversed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payments List */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>
                View and manage all student payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student name, ID, or receipt number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="reversed">Reversed</SelectItem>
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
