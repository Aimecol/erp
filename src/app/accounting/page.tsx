'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, Search, Filter, Download, Eye, FileText, Calendar, 
  CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, DollarSign,
  BarChart3, PieChart, Activity, Lock, Unlock, RefreshCw, Target
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { usePermissions } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountingPage() {
  const { canRead, canCreate, canUpdate, canApprove, isAdmin, isBursar, isAuditor } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current_month');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Check permissions
  if (!canRead('accounting')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view accounting records.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: periodClosingData, isLoading: periodClosingLoading } = useQuery({
    queryKey: ['accounting', 'period-closing', selectedPeriod],
    queryFn: () => api.get('/v1/accounting/period-closing', {
      params: { period: selectedPeriod }
    }),
  });

  const { data: reconciliationData, isLoading: reconciliationLoading } = useQuery({
    queryKey: ['accounting', 'reconciliation', selectedPeriod],
    queryFn: () => api.get('/v1/accounting/reconciliation', {
      params: { period: selectedPeriod }
    }),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['accounting', 'summary'],
    queryFn: () => api.get('/v1/accounting/summary'),
  });

  const summary = summaryData?.data || {};

  // Mock period closing data
  const mockPeriodClosing = [
    {
      id: 'pc-001',
      period: 'January 2024',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      status: 'completed',
      closedBy: 'Marie UWIMANA',
      closedDate: new Date('2024-02-05'),
      totalRevenue: 240000000,
      totalExpenses: 185000000,
      netIncome: 55000000,
      reconciliationStatus: 'completed',
      adjustments: 3,
      adjustmentAmount: 2500000
    },
    {
      id: 'pc-002',
      period: 'February 2024',
      periodStart: new Date('2024-02-01'),
      periodEnd: new Date('2024-02-29'),
      status: 'in_progress',
      closedBy: null,
      closedDate: null,
      totalRevenue: 255000000,
      totalExpenses: 195000000,
      netIncome: 60000000,
      reconciliationStatus: 'pending',
      adjustments: 1,
      adjustmentAmount: 1200000
    },
    {
      id: 'pc-003',
      period: 'March 2024',
      periodStart: new Date('2024-03-01'),
      periodEnd: new Date('2024-03-31'),
      status: 'open',
      closedBy: null,
      closedDate: null,
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      reconciliationStatus: 'not_started',
      adjustments: 0,
      adjustmentAmount: 0
    }
  ];

  // Mock reconciliation data
  const mockReconciliation = [
    {
      id: 'rec-001',
      account: 'Cash - Main Account',
      accountNumber: '1001',
      bookBalance: 45000000,
      bankBalance: 44750000,
      difference: 250000,
      status: 'reconciled',
      lastReconciled: new Date('2024-01-31'),
      reconciledBy: 'Jean NKURUNZIZA'
    },
    {
      id: 'rec-002',
      account: 'Accounts Receivable',
      accountNumber: '1200',
      bookBalance: 125000000,
      bankBalance: null,
      difference: 0,
      status: 'balanced',
      lastReconciled: new Date('2024-01-31'),
      reconciledBy: 'Marie UWIMANA'
    },
    {
      id: 'rec-003',
      account: 'Petty Cash',
      accountNumber: '1010',
      bookBalance: 500000,
      bankBalance: 480000,
      difference: 20000,
      status: 'pending',
      lastReconciled: new Date('2024-01-25'),
      reconciledBy: null
    }
  ];

  const periodClosingColumns = [
    {
      accessorKey: 'period',
      header: 'Period',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.period}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(row.original.periodStart)} - {formatDate(row.original.periodEnd)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'netIncome',
      header: 'Net Income',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">
          {formatCurrency(row.original.netIncome)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'completed' ? 'default' : 
                      status === 'in_progress' ? 'secondary' : 
                      status === 'open' ? 'outline' : 'destructive';
        return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
      },
    },
    {
      accessorKey: 'reconciliationStatus',
      header: 'Reconciliation',
      cell: ({ row }: any) => {
        const status = row.original.reconciliationStatus;
        const variant = status === 'completed' ? 'default' : 
                      status === 'pending' ? 'secondary' : 
                      status === 'not_started' ? 'outline' : 'destructive';
        return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
      },
    },
    {
      accessorKey: 'closedBy',
      header: 'Closed By',
      cell: ({ row }: any) => (
        <div>
          {row.original.closedBy ? (
            <div>
              <div className="font-medium">{row.original.closedBy}</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(row.original.closedDate)}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Not closed</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status !== 'completed' && canUpdate('accounting') && (
            <Button variant="ghost" size="sm">
              <Lock className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const reconciliationColumns = [
    {
      accessorKey: 'account',
      header: 'Account',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.account}</div>
          <div className="text-sm text-muted-foreground">{row.original.accountNumber}</div>
        </div>
      ),
    },
    {
      accessorKey: 'bookBalance',
      header: 'Book Balance',
      cell: ({ row }: any) => (
        <div className="font-medium">
          {formatCurrency(row.original.bookBalance)}
        </div>
      ),
    },
    {
      accessorKey: 'bankBalance',
      header: 'Bank Balance',
      cell: ({ row }: any) => (
        <div className="font-medium">
          {row.original.bankBalance ? formatCurrency(row.original.bankBalance) : 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'difference',
      header: 'Difference',
      cell: ({ row }: any) => {
        const diff = row.original.difference;
        return (
          <div className={`font-medium ${diff !== 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(Math.abs(diff))}
            {diff !== 0 && <span className="text-xs ml-1">(Variance)</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'reconciled' ? 'default' : 
                      status === 'balanced' ? 'secondary' : 
                      status === 'pending' ? 'outline' : 'destructive';
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
          {row.original.status === 'pending' && canUpdate('accounting') && (
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Accounting & Period Closing</h1>
              <p className="text-muted-foreground">
                Manage period closing procedures, reconciliation, and financial controls
              </p>
            </div>
            {canCreate('accounting') && (
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Reports
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Period Close
                </Button>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Period</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">March 2024</div>
                <p className="text-xs text-muted-foreground">
                  Open period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Closed Period</CardTitle>
                <Lock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">January 2024</div>
                <p className="text-xs text-muted-foreground">
                  Closed on Feb 5, 2024
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reconciliations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">3</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">YTD Net Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(175000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% vs last year
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="period-closing" className="space-y-6">
            <TabsList>
              <TabsTrigger value="period-closing">Period Closing</TabsTrigger>
              <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
              <TabsTrigger value="adjustments">Journal Adjustments</TabsTrigger>
              <TabsTrigger value="reports">Closing Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="period-closing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Period Closing Management
                  </CardTitle>
                  <CardDescription>
                    Manage month-end and year-end closing procedures
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
                        <SelectItem value="current_year">Current Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>

                  <DataTable
                    columns={periodClosingColumns}
                    data={mockPeriodClosing}
                    loading={periodClosingLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reconciliation" className="space-y-6">
              {/* Reconciliation Summary */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      Requiring reconciliation
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reconciled</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">21</div>
                    <p className="text-xs text-muted-foreground">
                      87.5% completion
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <p className="text-xs text-muted-foreground">
                      Require attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Variance</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(270000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Needs investigation
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Account Reconciliation
                  </CardTitle>
                  <CardDescription>
                    Bank and account reconciliation status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={reconciliationColumns}
                    data={mockReconciliation}
                    loading={reconciliationLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="adjustments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Journal Adjustments
                  </CardTitle>
                  <CardDescription>
                    Period-end adjusting entries and corrections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Depreciation Adjustment - January 2024</div>
                          <div className="text-sm text-muted-foreground">JE-2024-001 • Equipment depreciation</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(2500000)}</div>
                        <Badge variant="default">Posted</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-100 rounded-full">
                          <FileText className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium">Accrued Expenses - February 2024</div>
                          <div className="text-sm text-muted-foreground">JE-2024-002 • Utility accruals</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(1200000)}</div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Period Performance
                    </CardTitle>
                    <CardDescription>Financial performance by period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">January 2024</span>
                        <span className="text-sm text-green-600">+15.2%</span>
                      </div>
                      <Progress value={85} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">February 2024</span>
                        <span className="text-sm text-green-600">+18.5%</span>
                      </div>
                      <Progress value={92} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">March 2024</span>
                        <span className="text-sm text-muted-foreground">In Progress</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Closing Checklist
                    </CardTitle>
                    <CardDescription>Month-end closing progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Bank Reconciliation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Accounts Receivable Review</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Inventory Valuation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Depreciation Calculation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Financial Statements</span>
                      </div>
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
