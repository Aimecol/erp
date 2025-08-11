'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Play, Pause, Calendar, DollarSign, Clock } from 'lucide-react';
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
import { RecurringPayment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function RecurringPaymentsPage() {
  const { canRead, canCreate, canUpdate, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedFrequency, setSelectedFrequency] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Check permissions
  if (!canRead('utilities')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view recurring payments.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['utilities', 'recurring', { 
      search: searchTerm, 
      frequency: selectedFrequency, 
      status: selectedStatus 
    }],
    queryFn: () => api.get('/v1/utilities/recurring', {
      params: {
        search: searchTerm,
        frequency: selectedFrequency !== 'all' ? selectedFrequency : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: recurringStats } = useQuery({
    queryKey: ['utilities', 'recurring-stats'],
    queryFn: () => api.get('/v1/utilities/recurring/stats'),
  });

  const payments = paymentsData?.data || [];
  const stats = recurringStats?.data || {};

  const getFrequencyBadge = (frequency: string) => {
    const variants: Record<string, any> = {
      weekly: 'outline',
      monthly: 'default',
      quarterly: 'secondary',
      annually: 'destructive'
    };
    return variants[frequency] || 'outline';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Payment Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.payee}</div>
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
      accessorKey: 'frequency',
      header: 'Frequency',
      cell: ({ row }: any) => (
        <Badge variant={getFrequencyBadge(row.original.frequency)}>
          {row.original.frequency.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'nextPayment',
      header: 'Next Payment',
      cell: ({ row }: any) => {
        const nextDate = new Date(row.original.nextPaymentDate);
        const isUpcoming = nextDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Within 7 days
        return (
          <div className={`text-sm ${isUpcoming ? 'text-orange-600 font-medium' : ''}`}>
            {formatDate(row.original.nextPaymentDate)}
            {isUpcoming && <div className="text-xs text-orange-500">Due Soon</div>}
          </div>
        );
      },
    },
    {
      accessorKey: 'lastPayment',
      header: 'Last Payment',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.lastPaymentDate ? formatDate(row.original.lastPaymentDate) : 'Never'}
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.paymentMethod.replace('_', ' ').toUpperCase()}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={getStatusBadge(row.original.isActive)}>
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
          {canUpdate('utilities') && (
            <>
              {row.original.isActive ? (
                <Button variant="ghost" size="sm" title="Pause">
                  <Pause className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="sm" title="Resume">
                  <Play className="h-4 w-4" />
                </Button>
              )}
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
              <h1 className="text-3xl font-bold tracking-tight">Recurring Payments</h1>
              <p className="text-muted-foreground">
                Manage automated and scheduled recurring payments
              </p>
            </div>
            {canCreate('utilities') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Setup Recurring Payment
              </Button>
            )}
          </div>

          {/* Recurring Payment Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Payments</CardTitle>
                <Clock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activePayments || 18}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPayments || 22} total configured
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.monthlyTotal || 25000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recurring monthly amount
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.dueThisWeek || 8500000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.paymentsThisWeek || 5} payments due
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.annualBudget || 300000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total annual commitment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recurring Payments List */}
          <Card>
            <CardHeader>
              <CardTitle>Recurring Payments</CardTitle>
              <CardDescription>
                View and manage all scheduled recurring payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search recurring payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequencies</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
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
                data={payments}
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
