'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, FileText, CheckCircle, Send, AlertTriangle } from 'lucide-react';
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
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InvoicingPage() {
  const { canRead, canCreate, canUpdate, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedCustomer, setSelectedCustomer] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('month');

  // Check permissions
  if (!canRead('invoicing')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view invoicing.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoicing', 'invoices', { 
      search: searchTerm, 
      status: selectedStatus, 
      type: selectedType,
      customer: selectedCustomer,
      dateRange 
    }],
    queryFn: () => api.get('/v1/invoicing/invoices', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        customer: selectedCustomer !== 'all' ? selectedCustomer : undefined,
        dateRange,
      }
    }),
  });

  const { data: invoicingStats } = useQuery({
    queryKey: ['invoicing', 'dashboard-stats', dateRange],
    queryFn: () => api.get('/v1/invoicing/dashboard-stats', {
      params: { dateRange }
    }),
  });

  const invoices = invoicesData?.data || [];
  const stats = invoicingStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      sent: 'secondary',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      tuition: 'default',
      training: 'secondary',
      consultancy: 'outline',
      other: 'destructive'
    };
    return variants[type] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
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
          <div className="text-sm text-muted-foreground">{row.original.customer?.code}</div>
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
      accessorKey: 'invoiceType',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant={getTypeBadge(row.original.invoiceType)}>
          {row.original.invoiceType.toUpperCase()}
        </Badge>
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
      accessorKey: 'vatAmount',
      header: 'VAT Amount',
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{formatCurrency(row.original.vatAmount || 0)}</div>
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
      accessorKey: 'rraCompliant',
      header: 'RRA Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isRRACompliant ? 'default' : 'destructive'}>
          {row.original.isRRACompliant ? 'COMPLIANT' : 'PENDING'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Invoice">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('invoicing') && row.original.status === 'draft' && (
            <Button variant="ghost" size="sm" title="Send Invoice">
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
              <h1 className="text-3xl font-bold tracking-tight">Billing, Invoicing & Receipting</h1>
              <p className="text-muted-foreground">
                RRA-compliant invoicing system for INES-Ruhengeri
              </p>
            </div>
            {canCreate('invoicing') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </div>

          {/* Invoicing Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalInvoiced || 485000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.invoiceCount || 234} invoices
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.vatCollected || 87300000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  18% VAT on services
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.outstanding || 125000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.outstandingCount || 45} unpaid invoices
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RRA Compliance</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {((stats.rraCompliantCount || 220) / (stats.invoiceCount || 234) * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.rraCompliantCount || 220} compliant invoices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Manage all invoices and ensure RRA compliance
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
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Invoice Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="consultancy">Consultancy</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
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
                data={invoices}
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
