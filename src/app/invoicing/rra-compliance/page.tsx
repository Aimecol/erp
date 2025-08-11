'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { usePermissions } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { RRACompliance } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function RRACompliancePage() {
  const { canRead, canUpdate, isBursar, isAdmin, isAuditor } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('month');
  const [selectedReportType, setSelectedReportType] = React.useState('all');

  // Check permissions
  if (!canRead('invoicing')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view RRA compliance.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: complianceData, isLoading } = useQuery({
    queryKey: ['invoicing', 'rra-compliance', { 
      search: searchTerm, 
      status: selectedStatus, 
      period: selectedPeriod,
      reportType: selectedReportType 
    }],
    queryFn: () => api.get('/v1/invoicing/rra-compliance', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        period: selectedPeriod,
        reportType: selectedReportType !== 'all' ? selectedReportType : undefined,
      }
    }),
  });

  const { data: complianceStats } = useQuery({
    queryKey: ['invoicing', 'rra-compliance-stats', selectedPeriod],
    queryFn: () => api.get('/v1/invoicing/rra-compliance/stats', {
      params: { period: selectedPeriod }
    }),
  });

  const compliance = complianceData?.data || [];
  const stats = complianceStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      compliant: 'default',
      pending: 'secondary',
      non_compliant: 'destructive',
      submitted: 'outline'
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'submitted':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'non_compliant':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'reportType',
      header: 'Report Type',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.reportType.replace('_', ' ').toUpperCase()}</div>
      ),
    },
    {
      accessorKey: 'period',
      header: 'Period',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.periodName}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(row.original.periodStart)} - {formatDate(row.original.periodEnd)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'totalSales',
      header: 'Total Sales',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.totalSales)}</div>
      ),
    },
    {
      accessorKey: 'vatAmount',
      header: 'VAT Amount',
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{formatCurrency(row.original.vatAmount)}</div>
      ),
    },
    {
      accessorKey: 'invoiceCount',
      header: 'Invoices',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.invoiceCount} invoices</div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => {
        const dueDate = new Date(row.original.dueDate);
        const isOverdue = dueDate < new Date() && row.original.status !== 'submitted';
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
            {formatDate(row.original.dueDate)}
            {isOverdue && <div className="text-xs text-red-500">Overdue</div>}
          </div>
        );
      },
    },
    {
      accessorKey: 'submittedDate',
      header: 'Submitted',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.submittedDate ? formatDate(row.original.submittedDate) : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <Badge variant={getStatusBadge(row.original.status)}>
            {row.original.status.replace('_', ' ').toUpperCase()}
          </Badge>
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
          {canUpdate('invoicing') && row.original.status === 'pending' && (
            <Button variant="ghost" size="sm" title="Submit to RRA">
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
              <h1 className="text-3xl font-bold tracking-tight">RRA Compliance</h1>
              <p className="text-muted-foreground">
                Rwanda Revenue Authority tax compliance and reporting
              </p>
            </div>
            {canUpdate('invoicing') && (
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            )}
          </div>

          {/* Compliance Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {((stats.compliantReports || 11) / (stats.totalReports || 12) * 100).toFixed(0)}%
                </div>
                <Progress 
                  value={(stats.compliantReports || 11) / (stats.totalReports || 12) * 100} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.compliantReports || 11} of {stats.totalReports || 12} reports
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalVATCollected || 87300000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This fiscal year
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingReports || 1}</div>
                <p className="text-xs text-muted-foreground">
                  Need submission
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-600">
                  {stats.nextDueDate ? formatDate(stats.nextDueDate) : 'No pending'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly VAT return
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RRA Compliance Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>RRA Compliance Requirements</CardTitle>
              <CardDescription>
                Key requirements for Rwanda Revenue Authority compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">VAT Registration</div>
                    <div className="text-sm text-muted-foreground">
                      Valid VAT registration number: 123456789
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Electronic Invoicing</div>
                    <div className="text-sm text-muted-foreground">
                      All invoices issued electronically
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Monthly VAT Returns</div>
                    <div className="text-sm text-muted-foreground">
                      Submitted by 15th of following month
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Record Keeping</div>
                    <div className="text-sm text-muted-foreground">
                      Maintain records for 5 years
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Tax Rates</div>
                    <div className="text-sm text-muted-foreground">
                      18% VAT on taxable services
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Audit Trail</div>
                    <div className="text-sm text-muted-foreground">
                      Complete transaction audit trail
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>
                Track all RRA compliance reports and submissions
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
                
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vat_return">VAT Return</SelectItem>
                    <SelectItem value="income_tax">Income Tax</SelectItem>
                    <SelectItem value="withholding_tax">Withholding Tax</SelectItem>
                    <SelectItem value="annual_return">Annual Return</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Periods</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={compliance}
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
