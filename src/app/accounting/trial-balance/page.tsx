'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, Eye, BarChart3, CheckCircle, XCircle, Calendar } from 'lucide-react';
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
import { TrialBalance, TrialBalanceAccount } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TrialBalancePage() {
  const { canRead, canGenerate, isBursar, isAdmin, isAuditor } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current');

  // Check permissions
  if (!canRead('accounting')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view trial balance.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: trialBalanceData, isLoading } = useQuery({
    queryKey: ['accounting', 'trial-balance', { 
      search: searchTerm, 
      type: selectedType, 
      period: selectedPeriod 
    }],
    queryFn: () => api.get('/v1/accounting/trial-balance', {
      params: {
        search: searchTerm,
        type: selectedType !== 'all' ? selectedType : undefined,
        period: selectedPeriod,
      }
    }),
  });

  const { data: trialBalanceStats } = useQuery({
    queryKey: ['accounting', 'trial-balance-stats', selectedPeriod],
    queryFn: () => api.get('/v1/accounting/trial-balance/stats', {
      params: { period: selectedPeriod }
    }),
  });

  const trialBalance = trialBalanceData?.data || {};
  const accounts = trialBalance.accounts || [];
  const stats = trialBalanceStats?.data || {};

  const getAccountTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      asset: 'default',
      liability: 'secondary',
      equity: 'outline',
      income: 'default',
      expense: 'destructive'
    };
    return variants[type] || 'outline';
  };

  const columns = [
    {
      accessorKey: 'accountCode',
      header: 'Account Code',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.accountCode}</div>
      ),
    },
    {
      accessorKey: 'accountName',
      header: 'Account Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.accountName}</div>
          <Badge variant={getAccountTypeBadge(row.original.accountType)} className="text-xs mt-1">
            {row.original.accountType.toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'openingBalance',
      header: 'Opening Balance',
      cell: ({ row }: any) => {
        const balance = row.original.openingBalance || 0;
        return (
          <div className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(balance))}
          </div>
        );
      },
    },
    {
      accessorKey: 'debitMovements',
      header: 'Debit Movements',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.debitMovements || 0)}</div>
      ),
    },
    {
      accessorKey: 'creditMovements',
      header: 'Credit Movements',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.creditMovements || 0)}</div>
      ),
    },
    {
      accessorKey: 'closingBalance',
      header: 'Closing Balance',
      cell: ({ row }: any) => {
        const balance = row.original.closingBalance || 0;
        const isDebit = ['asset', 'expense'].includes(row.original.accountType);
        return (
          <div className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(balance))} {isDebit ? (balance >= 0 ? 'Dr' : 'Cr') : (balance >= 0 ? 'Cr' : 'Dr')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Account Details">
            <Eye className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Trial Balance</h1>
              <p className="text-muted-foreground">
                View trial balance and verify accounting equation balance
              </p>
            </div>
            {canGenerate('accounting') && (
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Trial Balance
              </Button>
            )}
          </div>

          {/* Trial Balance Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(trialBalance.totalDebits || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All debit balances
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(trialBalance.totalCredits || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All credit balances
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance Status</CardTitle>
                {trialBalance.isBalanced ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${trialBalance.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {trialBalance.isBalanced ? 'BALANCED' : 'OUT OF BALANCE'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {trialBalance.isBalanced ? 'Debits = Credits' : 'Requires adjustment'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Period</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {trialBalance.periodFrom && trialBalance.periodTo ? (
                    <>
                      {formatDate(trialBalance.periodFrom)} - {formatDate(trialBalance.periodTo)}
                    </>
                  ) : (
                    'Current Period'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Generated: {trialBalance.generatedAt ? formatDate(trialBalance.generatedAt) : 'Not generated'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Variance Alert */}
          {!trialBalance.isBalanced && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Trial Balance Out of Balance
                </CardTitle>
                <CardDescription className="text-red-700">
                  The trial balance is not balanced. The difference between total debits and credits is{' '}
                  <span className="font-medium">
                    {formatCurrency(Math.abs((trialBalance.totalDebits || 0) - (trialBalance.totalCredits || 0)))}
                  </span>
                  . Please review journal entries for errors.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Trial Balance Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Trial Balance Accounts</CardTitle>
              <CardDescription>
                Detailed view of all account balances for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Account Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="asset">Assets</SelectItem>
                    <SelectItem value="liability">Liabilities</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Period</SelectItem>
                    <SelectItem value="previous">Previous Period</SelectItem>
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
                data={accounts}
                loading={isLoading}
                searchable={false}
                filterable={false}
              />

              {/* Trial Balance Totals */}
              {accounts.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Debits:</div>
                      <div className="text-lg font-bold">{formatCurrency(trialBalance.totalDebits || 0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Credits:</div>
                      <div className="text-lg font-bold">{formatCurrency(trialBalance.totalCredits || 0)}</div>
                    </div>
                  </div>
                  <div className="text-right mt-2 max-w-md ml-auto">
                    <div className="text-sm text-muted-foreground">Difference:</div>
                    <div className={`text-lg font-bold ${trialBalance.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs((trialBalance.totalDebits || 0) - (trialBalance.totalCredits || 0)))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
