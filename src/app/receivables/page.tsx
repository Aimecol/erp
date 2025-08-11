'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, DollarSign, AlertTriangle, Calendar, CheckCircle, Users } from 'lucide-react';
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
import { AccountsReceivable } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountsReceivablePage() {
  const { canRead, canCreate, canUpdate, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedCustomerType, setSelectedCustomerType] = React.useState('all');
  const [ageingPeriod, setAgeingPeriod] = React.useState('all');

  // Check permissions
  if (!canRead('receivables')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view accounts receivable.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: receivablesData, isLoading } = useQuery({
    queryKey: ['receivables', 'list', { 
      search: searchTerm, 
      status: selectedStatus, 
      customerType: selectedCustomerType,
      ageing: ageingPeriod 
    }],
    queryFn: () => api.get('/v1/receivables', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        customerType: selectedCustomerType !== 'all' ? selectedCustomerType : undefined,
        ageing: ageingPeriod !== 'all' ? ageingPeriod : undefined,
      }
    }),
  });

  const { data: receivablesStats } = useQuery({
    queryKey: ['receivables', 'dashboard-stats'],
    queryFn: () => api.get('/v1/receivables/dashboard-stats'),
  });

  const receivables = receivablesData?.data || [];
  const stats = receivablesStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'outline',
      invoiced: 'secondary',
      paid: 'default',
      overdue: 'destructive',
      written_off: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getCustomerTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      student: 'default',
      government: 'secondary',
      corporate: 'outline',
      individual: 'destructive'
    };
    return variants[type] || 'outline';
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
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.customer?.name}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getCustomerTypeBadge(row.original.customer?.type)} className="text-xs">
              {row.original.customer?.type.toUpperCase()}
            </Badge>
          </div>
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
          {row.original.status.replace('_', ' ').toUpperCase()}
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
          {canUpdate('receivables') && row.original.status === 'invoiced' && (
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
              <h1 className="text-3xl font-bold tracking-tight">Accounts Receivable</h1>
              <p className="text-muted-foreground">
                Manage customer invoices, payments, and outstanding balances
              </p>
            </div>
            {canCreate('receivables') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </div>

          {/* Receivables Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalOutstanding || 185000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.outstandingInvoices || 125} invoices
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
                  {formatCurrency(stats.overdueAmount || 45000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueInvoices || 25} overdue
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month Collected</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyCollected || 165000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.monthlyPayments || 89} payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Student Receivables</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.studentReceivables || 125000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((stats.studentReceivables || 125000000) / (stats.totalOutstanding || 185000000) * 100).toFixed(0)}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Receivables List */}
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable</CardTitle>
              <CardDescription>
                View and manage all customer invoices and payments
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
                
                <Select value={selectedCustomerType} onValueChange={setSelectedCustomerType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Customer Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="invoiced">Invoiced</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="written_off">Written Off</SelectItem>
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
                data={receivables}
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
