'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, Filter, Download, Eye, DollarSign, AlertTriangle, Calendar,
  CheckCircle, Clock, Users, TrendingUp, BarChart3, PieChart, CreditCard,
  Receipt, Mail, Phone, FileText, Target, Activity
} from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { AccountsPayable } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountsPayablePage() {
  const { canRead, canCreate, canUpdate, canApprove, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedVendor, setSelectedVendor] = React.useState('all');
  const [ageingPeriod, setAgeingPeriod] = React.useState('all');
  const [selectedCustomer, setSelectedCustomer] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current_month');

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

  const { data: receivablesData, isLoading: receivablesLoading } = useQuery({
    queryKey: ['receivables', 'list', { customer: selectedCustomer, status: selectedStatus }],
    queryFn: () => api.get('/v1/receivables', {
      params: {
        customer: selectedCustomer !== 'all' ? selectedCustomer : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: agingData, isLoading: agingLoading } = useQuery({
    queryKey: ['aging-analysis', selectedPeriod],
    queryFn: () => api.get('/v1/aging-analysis', {
      params: { period: selectedPeriod }
    }),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['customer-payments', selectedPeriod],
    queryFn: () => api.get('/v1/customer-payments', {
      params: { period: selectedPeriod }
    }),
  });

  const payables = payablesData?.data || [];
  const stats = payablesStats?.data || {};
  const receivables = receivablesData?.data || [];
  const aging = agingData?.data || [];
  const payments = paymentsData?.data || [];

  // Mock receivables data
  const mockReceivables = [
    {
      id: 'ar-001',
      customerName: 'Ministry of Education',
      customerEmail: 'finance@mineduc.gov.rw',
      invoiceNumber: 'INV-2024-001',
      amount: 15000000,
      dueDate: new Date('2024-02-15'),
      issueDate: new Date('2024-01-15'),
      status: 'outstanding',
      daysOverdue: 5,
      category: 'Training Services',
      description: 'Professional development training program',
      paymentTerms: 'Net 30'
    },
    {
      id: 'ar-002',
      customerName: 'Rwanda Development Board',
      customerEmail: 'procurement@rdb.rw',
      invoiceNumber: 'INV-2024-002',
      amount: 8500000,
      dueDate: new Date('2024-02-20'),
      issueDate: new Date('2024-01-20'),
      status: 'paid',
      daysOverdue: 0,
      category: 'Consultancy',
      description: 'Business development consultancy',
      paymentTerms: 'Net 30'
    },
    {
      id: 'ar-003',
      customerName: 'Private Sector Federation',
      customerEmail: 'finance@psf.org.rw',
      invoiceNumber: 'INV-2024-003',
      amount: 12000000,
      dueDate: new Date('2024-03-01'),
      issueDate: new Date('2024-02-01'),
      status: 'outstanding',
      daysOverdue: 0,
      category: 'Research Services',
      description: 'Market research and analysis',
      paymentTerms: 'Net 30'
    }
  ];

  // Mock aging analysis data
  const mockAgingAnalysis = [
    {
      id: 'age-001',
      customerName: 'Ministry of Education',
      current: 5000000,
      days30: 8000000,
      days60: 2000000,
      days90: 0,
      over90: 0,
      total: 15000000
    },
    {
      id: 'age-002',
      customerName: 'Private Sector Federation',
      current: 12000000,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 12000000
    },
    {
      id: 'age-003',
      customerName: 'University of Rwanda',
      current: 0,
      days30: 3500000,
      days60: 1500000,
      days90: 2000000,
      over90: 1000000,
      total: 8000000
    }
  ];

  // Mock customer payments data
  const mockCustomerPayments = [
    {
      id: 'pay-001',
      customerName: 'Rwanda Development Board',
      paymentDate: new Date('2024-02-18'),
      amount: 8500000,
      paymentMethod: 'Bank Transfer',
      reference: 'TXN-2024-001',
      invoiceNumber: 'INV-2024-002',
      status: 'cleared'
    },
    {
      id: 'pay-002',
      customerName: 'Ministry of Health',
      paymentDate: new Date('2024-02-15'),
      amount: 6200000,
      paymentMethod: 'Check',
      reference: 'CHK-2024-001',
      invoiceNumber: 'INV-2024-004',
      status: 'pending'
    }
  ];

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

  const receivablesColumns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.invoiceNumber}</div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          <div className="text-sm text-muted-foreground">{row.original.customerEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.description}</div>
          <div className="text-sm text-muted-foreground">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => {
        const isOverdue = row.original.daysOverdue > 0;
        return (
          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {formatDate(row.original.dueDate)}
            {isOverdue && <div className="text-xs">({row.original.daysOverdue} days overdue)</div>}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'paid' ? 'default' :
                      status === 'outstanding' ? 'destructive' :
                      status === 'partial' ? 'secondary' : 'outline';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <CreditCard className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const agingColumns = [
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.customerName}</div>
      ),
    },
    {
      accessorKey: 'current',
      header: 'Current',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">
          {formatCurrency(row.original.current)}
        </div>
      ),
    },
    {
      accessorKey: 'days30',
      header: '1-30 Days',
      cell: ({ row }: any) => (
        <div className="font-medium text-yellow-600">
          {formatCurrency(row.original.days30)}
        </div>
      ),
    },
    {
      accessorKey: 'days60',
      header: '31-60 Days',
      cell: ({ row }: any) => (
        <div className="font-medium text-orange-600">
          {formatCurrency(row.original.days60)}
        </div>
      ),
    },
    {
      accessorKey: 'days90',
      header: '61-90 Days',
      cell: ({ row }: any) => (
        <div className="font-medium text-red-600">
          {formatCurrency(row.original.days90)}
        </div>
      ),
    },
    {
      accessorKey: 'over90',
      header: '90+ Days',
      cell: ({ row }: any) => (
        <div className="font-medium text-red-800">
          {formatCurrency(row.original.over90)}
        </div>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }: any) => (
        <div className="font-bold">
          {formatCurrency(row.original.total)}
        </div>
      ),
    },
  ];

  const paymentsColumns = [
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.customerName}</div>
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
        <div className="font-medium text-green-600">
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.paymentMethod}</div>
          <div className="text-sm text-muted-foreground">{row.original.reference}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'cleared' ? 'default' :
                      status === 'pending' ? 'secondary' : 'outline';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
  ];

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
              <h1 className="text-3xl font-bold tracking-tight">Accounts Payable & Receivable</h1>
              <p className="text-muted-foreground">
                Manage vendor invoices, customer receivables, payments, and aging analysis
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

          <Tabs defaultValue="receivables" className="space-y-6">
            <TabsList>
              <TabsTrigger value="receivables">Accounts Receivable</TabsTrigger>
              <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
              <TabsTrigger value="payments">Customer Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="receivables" className="space-y-6">
              {/* Receivables Summary */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
                    <Receipt className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(35500000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Outstanding invoices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(15000000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      1 customer overdue
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month Collections</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(8500000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      1 payment received
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Days to Pay</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">28</div>
                    <p className="text-xs text-muted-foreground">
                      Days average
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Accounts Receivable
                  </CardTitle>
                  <CardDescription>
                    Track customer invoices and payment collection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search receivables..."
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="mineduc">Ministry of Education</SelectItem>
                        <SelectItem value="rdb">Rwanda Development Board</SelectItem>
                        <SelectItem value="psf">Private Sector Federation</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="outstanding">Outstanding</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                    {canCreate('payables') && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Invoice
                      </Button>
                    )}
                  </div>

                  <DataTable
                    columns={receivablesColumns}
                    data={mockReceivables}
                    loading={receivablesLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aging" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Aging Analysis Report
                  </CardTitle>
                  <CardDescription>
                    Analyze outstanding receivables by aging periods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(17000000)}</div>
                        <div className="text-sm text-muted-foreground">Current</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{formatCurrency(8000000)}</div>
                        <div className="text-sm text-muted-foreground">1-30 Days</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{formatCurrency(3500000)}</div>
                        <div className="text-sm text-muted-foreground">31-60 Days</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(2000000)}</div>
                        <div className="text-sm text-muted-foreground">61-90 Days</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-800">{formatCurrency(1000000)}</div>
                        <div className="text-sm text-muted-foreground">90+ Days</div>
                      </div>
                    </div>
                  </div>

                  <DataTable
                    columns={agingColumns}
                    data={mockAgingAnalysis}
                    loading={agingLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Customer Payments
                  </CardTitle>
                  <CardDescription>
                    Track and manage customer payment receipts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current_month">Current Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="current_quarter">Current Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                    {canCreate('payables') && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Record Payment
                      </Button>
                    )}
                  </div>

                  <DataTable
                    columns={paymentsColumns}
                    data={mockCustomerPayments}
                    loading={paymentsLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
