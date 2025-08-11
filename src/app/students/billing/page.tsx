'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Receipt, AlertTriangle, Calendar, DollarSign } from 'lucide-react';
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
import { StudentBilling } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function StudentBillingPage() {
  const { canRead, canCreate, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTerm, setSelectedTerm] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedYear, setSelectedYear] = React.useState('2024');

  // Check permissions
  if (!canRead('students')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view student billing.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: billingData, isLoading } = useQuery({
    queryKey: ['students', 'billing', { 
      search: searchTerm, 
      term: selectedTerm, 
      status: selectedStatus,
      year: selectedYear 
    }],
    queryFn: () => api.get('/v1/students/billing', {
      params: {
        search: searchTerm,
        term: selectedTerm !== 'all' ? selectedTerm : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        academicYear: selectedYear,
      }
    }),
  });

  const { data: billingStats } = useQuery({
    queryKey: ['students', 'billing-stats', selectedYear],
    queryFn: () => api.get('/v1/students/billing/stats', {
      params: { academicYear: selectedYear }
    }),
  });

  const billings = billingData?.data || [];
  const stats = billingStats?.data || {};

  const columns = [
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
      accessorKey: 'program',
      header: 'Program',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.student?.program?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.student?.level}</div>
        </div>
      ),
    },
    {
      accessorKey: 'term',
      header: 'Term',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.term.toUpperCase()}</div>
          <div className="text-sm text-muted-foreground">{row.original.academicYear}</div>
        </div>
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
      accessorKey: 'paidAmount',
      header: 'Paid Amount',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">{formatCurrency(row.original.paidAmount)}</div>
      ),
    },
    {
      accessorKey: 'balanceAmount',
      header: 'Balance',
      cell: ({ row }: any) => {
        const balance = row.original.balanceAmount;
        return (
          <div className={`font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(balance)}
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
                      status === 'partial' ? 'secondary' : 
                      status === 'overdue' ? 'destructive' : 'outline';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.dueDate)}</div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Details">
            <Receipt className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Record Payment">
            <DollarSign className="h-4 w-4" />
          </Button>
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
              <h1 className="text-3xl font-bold tracking-tight">Student Billing</h1>
              <p className="text-muted-foreground">
                Manage student billing, invoices, and payment tracking
              </p>
            </div>
            {canCreate('students') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Bills
              </Button>
            )}
          </div>

          {/* Billing Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
                <Receipt className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalBilled || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalBills || 0} bills generated
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collections</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalCollected || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.collectionRate || 0}% collection rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalOutstanding || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.outstandingBills || 0} unpaid bills
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <Calendar className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalOverdue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueBills || 0} overdue bills
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Billing List */}
          <Card>
            <CardHeader>
              <CardTitle>Student Bills</CardTitle>
              <CardDescription>
                View and manage all student billing records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Terms</SelectItem>
                    <SelectItem value="term1">Term 1</SelectItem>
                    <SelectItem value="term2">Term 2</SelectItem>
                    <SelectItem value="term3">Term 3</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={billings}
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
