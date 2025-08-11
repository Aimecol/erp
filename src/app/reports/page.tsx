'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, FileText, BarChart3, TrendingUp, Calendar, DollarSign } from 'lucide-react';
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
import { FinancialReport } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function FinancialReportsPage() {
  const { canRead, canCreate, canUpdate, canApprove, isAdmin, isBursar, isAuditor } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('all');

  // Check permissions
  if (!canRead('reports')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view financial reports.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports', 'financial', { 
      search: searchTerm, 
      type: selectedType, 
      status: selectedStatus,
      period: selectedPeriod 
    }],
    queryFn: () => api.get('/v1/reports/financial', {
      params: {
        search: searchTerm,
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        period: selectedPeriod !== 'all' ? selectedPeriod : undefined,
      }
    }),
  });

  const { data: reportStats } = useQuery({
    queryKey: ['reports', 'dashboard-stats'],
    queryFn: () => api.get('/v1/reports/dashboard-stats'),
  });

  const reports = reportsData?.data || [];
  const stats = reportStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      generated: 'secondary',
      reviewed: 'default',
      approved: 'default',
      published: 'default'
    };
    return variants[status] || 'outline';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      income_statement: 'default',
      balance_sheet: 'secondary',
      cash_flow: 'outline',
      trial_balance: 'destructive',
      budget_variance: 'secondary',
      custom: 'outline'
    };
    return variants[type] || 'outline';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income_statement':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'balance_sheet':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'cash_flow':
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      case 'trial_balance':
        return <BarChart3 className="h-4 w-4 text-orange-500" />;
      case 'budget_variance':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'reportName',
      header: 'Report Name',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(row.original.reportType)}
          <div>
            <div className="font-medium">{row.original.reportName}</div>
            <div className="text-sm text-muted-foreground">{row.original.description}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'reportType',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant={getTypeBadge(row.original.reportType)}>
          {row.original.reportType.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'period',
      header: 'Period',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">
            {formatDate(row.original.periodStart)} - {formatDate(row.original.periodEnd)}
          </div>
          <div className="text-sm text-muted-foreground">{row.original.periodType}</div>
        </div>
      ),
    },
    {
      accessorKey: 'generatedAt',
      header: 'Generated',
      cell: ({ row }: any) => (
        <div>
          <div className="text-sm">{formatDate(row.original.generatedAt)}</div>
          <div className="text-sm text-muted-foreground">by {row.original.generatedBy}</div>
        </div>
      ),
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
      accessorKey: 'approvals',
      header: 'Approvals',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.reviewedBy && (
            <div>Reviewed: {row.original.reviewedBy}</div>
          )}
          {row.original.approvedBy && (
            <div>Approved: {row.original.approvedBy}</div>
          )}
          {!row.original.reviewedBy && !row.original.approvedBy && (
            <div className="text-muted-foreground">Pending</div>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Report">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Download Report">
            <Download className="h-4 w-4" />
          </Button>
          {canApprove('reports') && row.original.status === 'generated' && (
            <Button variant="ghost" size="sm" title="Approve Report">
              <FileText className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Comprehensive Financial Reporting</h1>
              <p className="text-muted-foreground">
                Generate and manage financial statements and reports for INES-Ruhengeri
              </p>
            </div>
            {canCreate('reports') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            )}
          </div>

          {/* Report Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalReports || 156}</div>
                <p className="text-xs text-muted-foreground">
                  Generated this year
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Reports</CardTitle>
                <Calendar className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.monthlyReports || 12}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingApproval || 8}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published Reports</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.publishedReports || 142}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.publishedReports || 142) / (stats.totalReports || 156) * 100).toFixed(0)}% published
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Report Generation */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Income Statement</CardTitle>
                <CardDescription>
                  Revenue and expense summary
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Balance Sheet</CardTitle>
                <CardDescription>
                  Assets, liabilities, and equity
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <DollarSign className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Cash Flow</CardTitle>
                <CardDescription>
                  Cash inflows and outflows
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <TrendingUp className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Budget Variance</CardTitle>
                <CardDescription>
                  Budget vs actual analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>
                View and manage all generated financial reports and statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income_statement">Income Statement</SelectItem>
                    <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                    <SelectItem value="cash_flow">Cash Flow</SelectItem>
                    <SelectItem value="trial_balance">Trial Balance</SelectItem>
                    <SelectItem value="budget_variance">Budget Variance</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
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
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="current_month">Current Month</SelectItem>
                    <SelectItem value="current_quarter">Current Quarter</SelectItem>
                    <SelectItem value="current_year">Current Year</SelectItem>
                    <SelectItem value="previous_year">Previous Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={reports}
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
