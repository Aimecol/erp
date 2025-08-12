'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Calculator, TrendingUp, FileText, Search, Filter, Download, Eye, Plus, Calendar } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
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

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference: string;
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  createdBy: string;
  createdAt: string;
  lineItems: JournalLineItem[];
}

interface JournalLineItem {
  id: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  reference: string;
}

interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  balance: number;
  debitBalance: number;
  creditBalance: number;
  lastActivity: string;
  isActive: boolean;
}

interface TrialBalance {
  accountCode: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
}

export default function GeneralLedgerPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedAccountType, setSelectedAccountType] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current');

  const { data: journalEntriesData, isLoading } = useQuery({
    queryKey: ['journal-entries', { search: searchTerm, status: selectedStatus, period: selectedPeriod }],
    queryFn: () => api.get<ApiResponse<JournalEntry[]>>('/v1/accounting/journal-entries', {
      search: searchTerm,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      period: selectedPeriod,
    }),
  });

  const { data: ledgerAccountsData } = useQuery({
    queryKey: ['ledger-accounts', { search: searchTerm, type: selectedAccountType }],
    queryFn: () => api.get<ApiResponse<LedgerAccount[]>>('/v1/accounting/ledger-accounts', {
      search: searchTerm,
      type: selectedAccountType !== 'all' ? selectedAccountType : undefined,
    }),
  });

  const { data: trialBalanceData } = useQuery({
    queryKey: ['trial-balance', { period: selectedPeriod }],
    queryFn: () => api.get<ApiResponse<TrialBalance[]>>('/v1/accounting/trial-balance', {
      period: selectedPeriod,
    }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['accounting', 'stats'],
    queryFn: () => api.get<ApiResponse<any>>('/v1/accounting/stats'),
  });

  const journalEntries = journalEntriesData?.data || [];
  const ledgerAccounts = ledgerAccountsData?.data || [];
  const trialBalance = trialBalanceData?.data || [];
  const stats = statsData?.data || {};

  const journalColumns = [
    {
      accessorKey: 'entryNumber',
      header: 'Entry #',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('entryNumber')}</div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: any) => formatDate(row.getValue('date')),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate">{row.getValue('description')}</div>
      ),
    },
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('reference')}</div>
      ),
    },
    {
      accessorKey: 'totalDebit',
      header: 'Debit',
      cell: ({ row }: any) => formatCurrency(row.getValue('totalDebit')),
    },
    {
      accessorKey: 'totalCredit',
      header: 'Credit',
      cell: ({ row }: any) => formatCurrency(row.getValue('totalCredit')),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={
            status === 'posted' ? 'default' :
            status === 'draft' ? 'outline' :
            status === 'reversed' ? 'destructive' : 'outline'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdBy',
      header: 'Created By',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('createdBy')}</div>
          <div className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</div>
        </div>
      ),
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

  const ledgerColumns = [
    {
      accessorKey: 'code',
      header: 'Account Code',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('code')}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Account Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <div className="text-sm text-muted-foreground">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.getValue('type') as string;
        return (
          <Badge variant="outline" className="capitalize">
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'debitBalance',
      header: 'Debit Balance',
      cell: ({ row }: any) => {
        const amount = row.getValue('debitBalance') as number;
        return amount > 0 ? formatCurrency(amount) : '-';
      },
    },
    {
      accessorKey: 'creditBalance',
      header: 'Credit Balance',
      cell: ({ row }: any) => {
        const amount = row.getValue('creditBalance') as number;
        return amount > 0 ? formatCurrency(amount) : '-';
      },
    },
    {
      accessorKey: 'balance',
      header: 'Net Balance',
      cell: ({ row }: any) => {
        const balance = row.getValue('balance') as number;
        return (
          <div className={`font-medium ${balance < 0 ? 'text-red-600' : balance > 0 ? 'text-green-600' : ''}`}>
            {formatCurrency(Math.abs(balance))}
            {balance < 0 && ' (Cr)'}
            {balance > 0 && ' (Dr)'}
          </div>
        );
      },
    },
    {
      accessorKey: 'lastActivity',
      header: 'Last Activity',
      cell: ({ row }: any) => {
        const date = row.getValue('lastActivity');
        return date ? formatDate(date) : 'No activity';
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
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const trialBalanceColumns = [
    {
      accessorKey: 'accountCode',
      header: 'Account Code',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('accountCode')}</div>
      ),
    },
    {
      accessorKey: 'accountName',
      header: 'Account Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('accountName')}</div>
          <div className="text-sm text-muted-foreground">{row.original.accountType}</div>
        </div>
      ),
    },
    {
      accessorKey: 'debitBalance',
      header: 'Debit',
      cell: ({ row }: any) => {
        const amount = row.getValue('debitBalance') as number;
        return amount > 0 ? formatCurrency(amount) : '-';
      },
    },
    {
      accessorKey: 'creditBalance',
      header: 'Credit',
      cell: ({ row }: any) => {
        const amount = row.getValue('creditBalance') as number;
        return amount > 0 ? formatCurrency(amount) : '-';
      },
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
              <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
              <p className="text-muted-foreground">
                Double-entry accounting, journal entries, and trial balance
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalAssets || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current book value
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalLiabilities || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Outstanding obligations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equity</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalEquity || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Net worth
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.journalEntries || 0}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="journal" className="space-y-4">
            <TabsList>
              <TabsTrigger value="journal">Journal Entries</TabsTrigger>
              <TabsTrigger value="ledger">General Ledger</TabsTrigger>
              <TabsTrigger value="trial">Trial Balance</TabsTrigger>
              <TabsTrigger value="closing">Period Closing</TabsTrigger>
            </TabsList>

            <TabsContent value="journal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Journal Entries</CardTitle>
                  <CardDescription>
                    Record and manage double-entry journal transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search journal entries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="posted">Posted</SelectItem>
                        <SelectItem value="reversed">Reversed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DataTable
                    columns={journalColumns}
                    data={journalEntries}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ledger" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Ledger Accounts</CardTitle>
                  <CardDescription>
                    View account balances and transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search accounts..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Account Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="asset">Assets</SelectItem>
                        <SelectItem value="liability">Liabilities</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense">Expenses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DataTable
                    columns={ledgerColumns}
                    data={ledgerAccounts}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trial Balance</CardTitle>
                  <CardDescription>
                    Verify that debits equal credits across all accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Trial Balance
                    </Button>
                  </div>

                  <DataTable
                    columns={trialBalanceColumns}
                    data={trialBalance}
                    loading={isLoading}
                  />

                  {/* Trial Balance Summary */}
                  <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <p className="text-sm font-medium">Total Debits</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(trialBalance.reduce((sum, item) => sum + item.debitBalance, 0))}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Total Credits</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(trialBalance.reduce((sum, item) => sum + item.creditBalance, 0))}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Difference</p>
                        <p className={`text-2xl font-bold ${
                          Math.abs(trialBalance.reduce((sum, item) => sum + item.debitBalance - item.creditBalance, 0)) < 0.01
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(trialBalance.reduce((sum, item) => sum + item.debitBalance - item.creditBalance, 0)))}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="closing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Period Closing</CardTitle>
                  <CardDescription>
                    Close accounting periods and generate closing entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Current Period</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Period:</span>
                              <span className="font-medium">December 2024</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <Badge variant="outline">Open</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Journal Entries:</span>
                              <span className="font-medium">{stats.journalEntries || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Trial Balance:</span>
                              <Badge variant="default">Balanced</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Closing Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Button className="w-full justify-start" variant="outline">
                            <Calculator className="h-4 w-4 mr-2" />
                            Generate Closing Entries
                          </Button>
                          <Button className="w-full justify-start" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Post Adjusting Entries
                          </Button>
                          <Button className="w-full justify-start" variant="outline">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Close Revenue & Expense Accounts
                          </Button>
                          <Button className="w-full justify-start" variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Close Accounting Period
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Period Closing History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <p className="font-medium">November 2024</p>
                                <p className="text-sm text-muted-foreground">Closed on December 5, 2024</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">Closed</Badge>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
