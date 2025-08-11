'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, BarChart3, DollarSign, TrendingUp, Building } from 'lucide-react';
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
import { ChartOfAccounts } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ChartOfAccountsPage() {
  const { canRead, canCreate, canUpdate, isBursar, isAdmin, isAuditor } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Check permissions
  if (!canRead('accounting')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view chart of accounts.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['accounting', 'chart-of-accounts', { 
      search: searchTerm, 
      type: selectedType, 
      status: selectedStatus 
    }],
    queryFn: () => api.get('/v1/accounting/chart-of-accounts', {
      params: {
        search: searchTerm,
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: accountStats } = useQuery({
    queryKey: ['accounting', 'chart-of-accounts-stats'],
    queryFn: () => api.get('/v1/accounting/chart-of-accounts/stats'),
  });

  const accounts = accountsData?.data || [];
  const stats = accountStats?.data || {};

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

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'asset':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'liability':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'equity':
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      case 'income':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'expense':
        return <DollarSign className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
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
          <div className="text-sm text-muted-foreground">
            Level {row.original.level} {row.original.parentAccountId && '(Sub-account)'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'accountType',
      header: 'Account Type',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getAccountTypeIcon(row.original.accountType)}
          <Badge variant={getAccountTypeBadge(row.original.accountType)}>
            {row.original.accountType.toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'accountSubType',
      header: 'Sub Type',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.accountSubType}</div>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Current Balance',
      cell: ({ row }: any) => {
        const balance = row.original.balance || 0;
        const isDebit = ['asset', 'expense'].includes(row.original.accountType);
        return (
          <div className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(balance))} {isDebit ? (balance >= 0 ? 'Dr' : 'Cr') : (balance >= 0 ? 'Cr' : 'Dr')}
          </div>
        );
      },
    },
    {
      accessorKey: 'debitBalance',
      header: 'Debit Balance',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.debitBalance || 0)}</div>
      ),
    },
    {
      accessorKey: 'creditBalance',
      header: 'Credit Balance',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.creditBalance || 0)}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'ACTIVE' : 'INACTIVE'}
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
          {canUpdate('accounting') && (
            <Button variant="ghost" size="sm" title="Edit Account">
              <Edit className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
              <p className="text-muted-foreground">
                Manage the institutional chart of accounts and account structure
              </p>
            </div>
            {canCreate('accounting') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            )}
          </div>

          {/* Account Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assets</CardTitle>
                <Building className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.assetAccounts || 45}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalAssets || 2500000000)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Liabilities</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.liabilityAccounts || 28}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalLiabilities || 850000000)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equity</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.equityAccounts || 12}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalEquity || 1650000000)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.incomeAccounts || 35}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalIncome || 450000000)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.expenseAccounts || 68}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalExpenses || 320000000)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart of Accounts List */}
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>
                View and manage all general ledger accounts
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

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
