'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Zap, Building, FileText, TrendingUp, Search, Filter, Download, Eye, Plus,
  AlertCircle, Wifi, Droplets, Phone, DollarSign, Calendar, Clock, CheckCircle,
  XCircle, Users, Receipt, CreditCard, Banknote, Target, BarChart3
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
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DepartmentExpense {
  id: string;
  department: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  reference: string;
  vendor: string;
  createdAt: string;
}

interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  vendorEmail: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'pending' | 'approved' | 'paid' | 'overdue';
  category: string;
  department: string;
  description: string;
  paymentTerms: string;
  createdAt: string;
}

interface UtilityBill {
  id: string;
  utilityType: 'electricity' | 'water' | 'gas' | 'internet' | 'phone' | 'waste';
  provider: string;
  accountNumber: string;
  amount: number;
  billingPeriod: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  consumption: number;
  unit: string;
  rate: number;
  previousReading: number;
  currentReading: number;
  createdAt: string;
}

export default function UtilitiesPage() {
  const { canRead, canCreate } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDepartment, setSelectedDepartment] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedDepartment, setSelectedDepartment] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current_month');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  // Check permissions
  if (!canRead('utilities')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view utility accounts.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', { search: searchTerm, department: selectedDepartment, status: selectedStatus, category: selectedCategory }],
    queryFn: () => api.get<ApiResponse<DepartmentExpense[]>>('/v1/expenses', {
      search: searchTerm,
      department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
    }),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get<ApiResponse<VendorInvoice[]>>('/v1/invoices'),
  });

  const { data: utilitiesData } = useQuery({
    queryKey: ['utilities'],
    queryFn: () => api.get<ApiResponse<UtilityBill[]>>('/v1/utilities'),
  });

  const { data: statsData } = useQuery({
    queryKey: ['utilities', 'stats'],
    queryFn: () => api.get<ApiResponse<any>>('/v1/utilities/stats'),
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get<ApiResponse<any[]>>('/v1/departments'),
  });

  const expenses = expensesData?.data || [];
  const invoices = invoicesData?.data || [];
  const utilities = utilitiesData?.data || [];
  const stats = statsData?.data || {};
  const departments = departmentsData?.data || [];

  // Mock department expenses data
  const mockDepartmentExpenses: DepartmentExpense[] = [
    {
      id: 'exp-001',
      department: 'Computer Science',
      category: 'Office Supplies',
      description: 'Stationery and printing materials',
      amount: 250000,
      date: '2024-01-15',
      approvedBy: 'Dr. Jean NKURUNZIZA',
      status: 'approved',
      reference: 'REF-2024-001',
      vendor: 'Office Supplies Rwanda',
      createdAt: '2024-01-10'
    },
    {
      id: 'exp-002',
      department: 'Business Administration',
      category: 'Equipment Maintenance',
      description: 'Projector repair and maintenance',
      amount: 180000,
      date: '2024-01-20',
      approvedBy: 'Prof. Marie UWIMANA',
      status: 'pending',
      reference: 'REF-2024-002',
      vendor: 'Tech Solutions Ltd',
      createdAt: '2024-01-18'
    },
    {
      id: 'exp-003',
      department: 'Engineering',
      category: 'Software Licenses',
      description: 'AutoCAD license renewal',
      amount: 850000,
      date: '2024-01-25',
      approvedBy: 'Dr. Paul KAGAME',
      status: 'approved',
      reference: 'REF-2024-003',
      vendor: 'Autodesk Rwanda',
      createdAt: '2024-01-22'
    },
    {
      id: 'exp-004',
      department: 'Administration',
      category: 'Travel & Transport',
      description: 'Conference travel expenses',
      amount: 450000,
      date: '2024-01-28',
      approvedBy: 'Director General',
      status: 'paid',
      reference: 'REF-2024-004',
      vendor: 'Travel Agency Rwanda',
      createdAt: '2024-01-25'
    }
  ];

  // Mock vendor invoices data
  const mockVendorInvoices: VendorInvoice[] = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2024-001',
      vendor: 'Rwanda Energy Group',
      vendorEmail: 'billing@reg.rw',
      amount: 2500000,
      dueDate: '2024-02-15',
      issueDate: '2024-01-15',
      status: 'pending',
      category: 'Utilities',
      department: 'Administration',
      description: 'Electricity bill - January 2024',
      paymentTerms: 'Net 30',
      createdAt: '2024-01-15'
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2024-002',
      vendor: 'Water and Sanitation Corporation',
      vendorEmail: 'billing@wasac.rw',
      amount: 450000,
      dueDate: '2024-02-10',
      issueDate: '2024-01-10',
      status: 'approved',
      category: 'Utilities',
      department: 'Administration',
      description: 'Water bill - January 2024',
      paymentTerms: 'Net 30',
      createdAt: '2024-01-10'
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2024-003',
      vendor: 'MTN Rwanda',
      vendorEmail: 'corporate@mtn.rw',
      amount: 320000,
      dueDate: '2024-01-25',
      issueDate: '2023-12-25',
      status: 'overdue',
      category: 'Telecommunications',
      department: 'IT Services',
      description: 'Internet and phone services - December 2023',
      paymentTerms: 'Net 30',
      createdAt: '2023-12-25'
    },
    {
      id: 'inv-004',
      invoiceNumber: 'INV-2024-004',
      vendor: 'Cleaning Services Ltd',
      vendorEmail: 'info@cleaningservices.rw',
      amount: 680000,
      dueDate: '2024-02-20',
      issueDate: '2024-01-20',
      status: 'paid',
      category: 'Maintenance',
      department: 'Administration',
      description: 'Cleaning services - January 2024',
      paymentTerms: 'Net 30',
      createdAt: '2024-01-20'
    }
  ];

  const expenseColumns = [
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('reference')}</div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('department')}</div>
          <div className="text-sm text-muted-foreground">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate">{row.getValue('description')}</div>
      ),
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('vendor')}</div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => formatCurrency(row.getValue('amount')),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={
            status === 'paid' ? 'default' :
            status === 'approved' ? 'secondary' :
            status === 'pending' ? 'outline' :
            status === 'rejected' ? 'destructive' : 'outline'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: any) => formatDate(row.getValue('date')),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const invoiceColumns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('invoiceNumber')}</div>
      ),
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('vendor')}</div>
          <div className="text-sm text-muted-foreground">{row.original.vendorEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('description')}</div>
          <div className="text-sm text-muted-foreground">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">
          {formatCurrency(row.getValue('amount'))}
        </div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => {
        const dueDate = new Date(row.getValue('dueDate'));
        const isOverdue = dueDate < new Date() && row.original.status !== 'paid';
        return (
          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {formatDate(row.getValue('dueDate'))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={
            status === 'paid' ? 'default' :
            status === 'approved' ? 'secondary' :
            status === 'pending' ? 'outline' :
            status === 'overdue' ? 'destructive' : 'outline'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <CreditCard className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Utility Management</h1>
              <p className="text-muted-foreground">
                Manage department expenses, vendor invoices, and utility bills
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalExpenses || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingInvoices || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.pendingAmount || 0)} total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utility Bills</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.utilityBills || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdueCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.overdueAmount || 0)} total
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="expenses" className="space-y-4">
            <TabsList>
              <TabsTrigger value="expenses">Department Expenses</TabsTrigger>
              <TabsTrigger value="invoices">Vendor Invoices</TabsTrigger>
              <TabsTrigger value="utilities">Utility Bills</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Department Expenses</CardTitle>
                  <CardDescription>
                    Track and manage departmental expenses and approvals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search expenses..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DataTable
                    columns={expenseColumns}
                    data={mockDepartmentExpenses}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              {/* Vendor Invoices Summary */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                    <Receipt className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(2950000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      2 invoices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(320000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      1 invoice
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(680000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      1 invoice
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Vendor Invoices
                  </CardTitle>
                  <CardDescription>
                    Manage vendor invoices and payment processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search invoices..."
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="telecommunications">Telecommunications</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[180px]">
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
                    {canCreate('utilities') && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Invoice
                      </Button>
                    )}
                  </div>

                  <DataTable
                    columns={invoiceColumns}
                    data={mockVendorInvoices}
                    loading={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="utilities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Utility Bills Management
                  </CardTitle>
                  <CardDescription>
                    Track electricity, water, internet and other utility expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Electricity</CardTitle>
                        <Zap className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                          {formatCurrency(2500000)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          January 2024
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Water</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(450000)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          January 2024
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Internet & Phone</CardTitle>
                        <Wifi className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(320000)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          December 2023 (Overdue)
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Expense Trends
                    </CardTitle>
                    <CardDescription>Monthly expense trends by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>Expense trend chart would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Budget vs Actual
                    </CardTitle>
                    <CardDescription>Budget utilization by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4" />
                      <p>Budget comparison chart would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
