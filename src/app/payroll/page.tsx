'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Calculator, Send, Users, DollarSign, Calendar, CheckCircle } from 'lucide-react';
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
import { Payroll } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PayrollPage() {
  const { canRead, canCreate, canUpdate, canApprove, isAdmin, isHR } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current');

  // Check permissions
  if (!canRead('payroll')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view payroll.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: payrollsData, isLoading } = useQuery({
    queryKey: ['payroll', 'list', { 
      search: searchTerm, 
      status: selectedStatus, 
      period: selectedPeriod 
    }],
    queryFn: () => api.get('/v1/payroll', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        period: selectedPeriod,
      }
    }),
  });

  const { data: payrollStats } = useQuery({
    queryKey: ['payroll', 'dashboard-stats'],
    queryFn: () => api.get('/v1/payroll/dashboard-stats'),
  });

  const payrolls = payrollsData?.data || [];
  const stats = payrollStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      calculated: 'secondary',
      approved: 'default',
      paid: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'calculated':
        return <Calculator className="h-4 w-4 text-orange-500" />;
      case 'cancelled':
        return <CheckCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'payrollNumber',
      header: 'Payroll Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.payrollNumber}</div>
      ),
    },
    {
      accessorKey: 'payPeriod',
      header: 'Pay Period',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">
            {formatDate(row.original.payPeriodStart)} - {formatDate(row.original.payPeriodEnd)}
          </div>
          <div className="text-sm text-muted-foreground">
            Pay Date: {formatDate(row.original.payDate)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'totalEmployees',
      header: 'Employees',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.original.totalEmployees}</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalGrossPay',
      header: 'Gross Pay',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.totalGrossPay)}</div>
      ),
    },
    {
      accessorKey: 'totalDeductions',
      header: 'Deductions',
      cell: ({ row }: any) => (
        <div className="font-medium text-red-600">{formatCurrency(row.original.totalDeductions)}</div>
      ),
    },
    {
      accessorKey: 'totalNetPay',
      header: 'Net Pay',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">{formatCurrency(row.original.totalNetPay)}</div>
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
          <Button variant="ghost" size="sm" title="View Payroll">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('payroll') && row.original.status === 'draft' && (
            <Button variant="ghost" size="sm" title="Calculate Payroll">
              <Calculator className="h-4 w-4" />
            </Button>
          )}
          {canApprove('payroll') && row.original.status === 'calculated' && (
            <Button variant="ghost" size="sm" title="Approve Payroll">
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {canUpdate('payroll') && row.original.status === 'approved' && (
            <Button variant="ghost" size="sm" title="Send Payslips">
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
              <h1 className="text-3xl font-bold tracking-tight">Payroll & Salaries</h1>
              <p className="text-muted-foreground">
                Manage employee payroll, salaries, and statutory deductions
              </p>
            </div>
            {canCreate('payroll') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Payroll
              </Button>
            )}
          </div>

          {/* Payroll Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalEmployees || 156}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeEmployees || 148} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyPayroll || 285000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gross salary cost
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PAYE Tax</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.monthlyPAYE || 45000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly PAYE deduction
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RSSB Contributions</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.monthlyRSSB || 25650000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Employee + Employer
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payroll List */}
          <Card>
            <CardHeader>
              <CardTitle>Payroll Runs</CardTitle>
              <CardDescription>
                View and manage all payroll processing runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payrolls..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="calculated">Calculated</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="previous">Previous</SelectItem>
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
                data={payrolls}
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
