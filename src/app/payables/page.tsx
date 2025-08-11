'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, DollarSign, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
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
import { AccountsPayable } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountsPayablePage() {
  const { canRead, canCreate, canUpdate, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedVendor, setSelectedVendor] = React.useState('all');
  const [ageingPeriod, setAgeingPeriod] = React.useState('all');

  // Check permissions
  if (!canRead('payables')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view accounts payable.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: payablesData, isLoading } = useQuery({
    queryKey: ['payables', 'list', { 
      search: searchTerm, 
      status: selectedStatus, 
      vendor: selectedVendor,
      ageing: ageingPeriod 
    }],
    queryFn: () => api.get('/v1/payables', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        vendor: selectedVendor !== 'all' ? selectedVendor : undefined,
        ageing: ageingPeriod !== 'all' ? ageingPeriod : undefined,
      }
    }),
  });

  const { data: payablesStats } = useQuery({
    queryKey: ['payables', 'dashboard-stats'],
    queryFn: () => api.get('/v1/payables/dashboard-stats'),
  });

  const payables = payablesData?.data || [];
  const stats = payablesStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'outline',
      approved: 'secondary',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getAgeingBadge = (daysOverdue: number) => {
    if (daysOverdue <= 0) return 'default';
    if (daysOverdue <= 30) return 'secondary';
    if (daysOverdue <= 60) return 'destructive';
    return 'destructive';
  };

  const columns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.invoiceNumber}</div>
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
      accessorKey: 'invoiceDate',
      header: 'Invoice Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.invoiceDate)}</div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => {
        const dueDate = new Date(row.original.dueDate);
        const isOverdue = dueDate < new Date() && row.original.status !== 'paid';
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
            {formatDate(row.original.dueDate)}
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
      accessorKey: 'paidAmount',
      header: 'Paid Amount',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">{formatCurrency(row.original.paidAmount || 0)}</div>
      ),
    },
    {
      accessorKey: 'balanceAmount',
      header: 'Balance',
      cell: ({ row }: any) => {
        const balance = row.original.totalAmount - (row.original.paidAmount || 0);
        return (
          <div className={`font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(balance)}
          </div>
        );
      },
    },
    {
      accessorKey: 'daysOverdue',
      header: 'Days Overdue',
      cell: ({ row }: any) => {
        const daysOverdue = row.original.daysOverdue || 0;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{daysOverdue > 0 ? daysOverdue : 0}</span>
            {daysOverdue > 0 && (
              <Badge variant={getAgeingBadge(daysOverdue)} className="text-xs">
                {daysOverdue <= 30 ? '0-30' : daysOverdue <= 60 ? '31-60' : '60+'}
              </Badge>
            )}
          </div>
        );
      },
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
          <Button variant="ghost" size="sm" title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('payables') && row.original.status === 'approved' && (
            <Button variant="ghost" size="sm" title="Record Payment">
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
              <h1 className="text-3xl font-bold tracking-tight">Accounts Payable</h1>
              <p className="text-muted-foreground">
                Manage vendor invoices, payments, and outstanding balances
              </p>
            </div>
            {canCreate('payables') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Invoice
              </Button>
            )}
          </div>

          {/* Payables Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalOutstanding || 125000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.outstandingInvoices || 45} invoices
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(stats.overdueAmount || 25000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueInvoices || 8} overdue
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyPaid || 85000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.monthlyPayments || 32} payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.dueThisWeek || 15000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.dueThisWeekCount || 6} invoices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payables List */}
          <Card>
            <CardHeader>
              <CardTitle>Accounts Payable</CardTitle>
              <CardDescription>
                View and manage all vendor invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
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

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ageingPeriod} onValueChange={setAgeingPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Ageing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="0-30">0-30 Days</SelectItem>
                    <SelectItem value="31-60">31-60 Days</SelectItem>
                    <SelectItem value="60+">60+ Days</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={payables}
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
