'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
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
import { ProjectExpense } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ProjectExpensesPage() {
  const { canRead, canCreate, canApprove, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProject, setSelectedProject] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  // Check permissions
  if (!canRead('projects')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view project expenses.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['projects', 'expenses', { 
      search: searchTerm, 
      project: selectedProject, 
      status: selectedStatus,
      category: selectedCategory 
    }],
    queryFn: () => api.get('/v1/projects/expenses', {
      params: {
        search: searchTerm,
        project: selectedProject !== 'all' ? selectedProject : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      }
    }),
  });

  const { data: expenseStats } = useQuery({
    queryKey: ['projects', 'expense-stats'],
    queryFn: () => api.get('/v1/projects/expenses/stats'),
  });

  const expenses = expensesData?.data || [];
  const stats = expenseStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive',
      paid: 'secondary'
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paid':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'project',
      header: 'Project',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.project?.code}</div>
          <div className="text-sm text-muted-foreground">{row.original.project?.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.description}</div>
          <div className="text-sm text-muted-foreground">
            Category: {row.original.budgetCategory?.name}
          </div>
        </div>
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
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.vendor || '-'}</div>
      ),
    },
    {
      accessorKey: 'expenseDate',
      header: 'Expense Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.expenseDate)}</div>
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
          <Button variant="ghost" size="sm" title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          {canApprove('projects') && row.original.status === 'pending' && (
            <>
              <Button variant="ghost" size="sm" title="Approve">
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Reject">
                <XCircle className="h-4 w-4" />
              </Button>
            </>
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
              <h1 className="text-3xl font-bold tracking-tight">Project Expenses</h1>
              <p className="text-muted-foreground">
                Track and manage project expenditures and budget utilization
              </p>
            </div>
            {canCreate('projects') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Expense
              </Button>
            )}
          </div>

          {/* Expense Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalExpenses || 1650000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalExpenseCount || 1250} transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.pendingAmount || 45000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingCount || 25} pending
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.monthlyExpenses || 125000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.monthlyCount || 85} transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.budgetVariance || 5.2}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Over budget
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Expenses List */}
          <Card>
            <CardHeader>
              <CardTitle>Project Expenses</CardTitle>
              <CardDescription>
                View and manage all project expense records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="proj-1">STEM Education</SelectItem>
                    <SelectItem value="proj-2">Digital Library</SelectItem>
                    <SelectItem value="proj-3">Research Lab</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="personnel">Personnel</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="overhead">Overhead</SelectItem>
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
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={expenses}
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
