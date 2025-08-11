'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, Eye, Send, FileText, Users, DollarSign, Calendar } from 'lucide-react';
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
import { Payslip } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PayslipsPage() {
  const { canRead, canUpdate, canSend, isAdmin, isHR } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current');
  const [selectedDepartment, setSelectedDepartment] = React.useState('all');

  // Check permissions
  if (!canRead('payroll')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view payslips.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: payslipsData, isLoading } = useQuery({
    queryKey: ['payroll', 'payslips', { 
      search: searchTerm, 
      status: selectedStatus, 
      period: selectedPeriod,
      department: selectedDepartment 
    }],
    queryFn: () => api.get('/v1/payroll/payslips', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        period: selectedPeriod,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      }
    }),
  });

  const { data: payslipStats } = useQuery({
    queryKey: ['payroll', 'payslip-stats', selectedPeriod],
    queryFn: () => api.get('/v1/payroll/payslips/stats', {
      params: { period: selectedPeriod }
    }),
  });

  const payslips = payslipsData?.data || [];
  const stats = payslipStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      generated: 'secondary',
      sent: 'default',
      acknowledged: 'default'
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'acknowledged':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'generated':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'employee',
      header: 'Employee',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">
            {row.original.employee?.firstName} {row.original.employee?.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.employee?.employeeNumber}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.employee?.department?.name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.employee?.position?.title}
          </div>
        </div>
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
      accessorKey: 'basicSalary',
      header: 'Basic Salary',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.basicSalary)}</div>
      ),
    },
    {
      accessorKey: 'grossPay',
      header: 'Gross Pay',
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{formatCurrency(row.original.grossPay)}</div>
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
      accessorKey: 'netPay',
      header: 'Net Pay',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">{formatCurrency(row.original.netPay)}</div>
      ),
    },
    {
      accessorKey: 'paye',
      header: 'PAYE',
      cell: ({ row }: any) => (
        <div className="font-medium text-orange-600">{formatCurrency(row.original.paye)}</div>
      ),
    },
    {
      accessorKey: 'rssb',
      header: 'RSSB',
      cell: ({ row }: any) => (
        <div className="font-medium text-purple-600">{formatCurrency(row.original.rssb)}</div>
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Payslip">
            <Eye className="h-4 w-4" />
          </Button>
          {canSend('payroll') && row.original.status === 'generated' && (
            <Button variant="ghost" size="sm" title="Send Payslip">
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
              <h1 className="text-3xl font-bold tracking-tight">Payslips</h1>
              <p className="text-muted-foreground">
                View and manage employee payslips and salary statements
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Bulk Download
              </Button>
              {canSend('payroll') && (
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send All
                </Button>
              )}
            </div>
          </div>

          {/* Payslip Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payslips</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalPayslips || 148}</div>
                <p className="text-xs text-muted-foreground">
                  Current period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalGrossPay || 285000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Before deductions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.totalNetPay || 214350000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  After deductions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sent Payslips</CardTitle>
                <Send className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.sentPayslips || 142}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.sentPayslips || 142) / (stats.totalPayslips || 148) * 100).toFixed(0)}% sent
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payslips List */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Payslips</CardTitle>
              <CardDescription>
                View and manage all employee payslips and salary statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payslips..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="academic">Academic Affairs</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="it">IT Services</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="generated">Generated</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
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
                data={payslips}
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
