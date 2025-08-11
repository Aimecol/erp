'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Zap, Wifi, Droplets, Phone, AlertTriangle, Calendar } from 'lucide-react';
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
import { UtilityBill } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function UtilitiesPage() {
  const { canRead, canCreate, isBursar, isAdmin, isStoreManager } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current');

  // Check permissions
  if (!canRead('utilities')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view utility accounts.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: billsData, isLoading } = useQuery({
    queryKey: ['utilities', 'bills', { 
      search: searchTerm, 
      type: selectedType, 
      status: selectedStatus,
      period: selectedPeriod 
    }],
    queryFn: () => api.get('/v1/utilities/bills', {
      params: {
        search: searchTerm,
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        period: selectedPeriod,
      }
    }),
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['utilities', 'dashboard-stats'],
    queryFn: () => api.get('/v1/utilities/dashboard-stats'),
  });

  const bills = billsData?.data || [];
  const stats = dashboardStats?.data || {};

  const getUtilityIcon = (type: string) => {
    switch (type) {
      case 'electricity':
        return <Zap className="h-4 w-4" />;
      case 'internet':
        return <Wifi className="h-4 w-4" />;
      case 'water':
        return <Droplets className="h-4 w-4" />;
      case 'telephone':
        return <Phone className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'outline',
      paid: 'default',
      overdue: 'destructive',
      disputed: 'secondary'
    };
    return variants[status] || 'outline';
  };

  const columns = [
    {
      accessorKey: 'utilityAccount',
      header: 'Utility Account',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getUtilityIcon(row.original.utilityAccount?.type)}
          <div>
            <div className="font-medium">{row.original.utilityAccount?.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.utilityAccount?.provider}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'billNumber',
      header: 'Bill Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.billNumber}</div>
      ),
    },
    {
      accessorKey: 'billingPeriod',
      header: 'Billing Period',
      cell: ({ row }: any) => (
        <div>
          <div className="text-sm">{formatDate(row.original.billingPeriodFrom)}</div>
          <div className="text-sm text-muted-foreground">to {formatDate(row.original.billingPeriodTo)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'consumption',
      header: 'Consumption',
      cell: ({ row }: any) => {
        const consumption = row.original.unitsConsumed;
        const type = row.original.utilityAccount?.type;
        const unit = type === 'electricity' ? 'kWh' : type === 'water' ? 'm³' : 'units';
        return (
          <div className="text-sm">
            {consumption ? `${consumption} ${unit}` : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.totalAmount)}</div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => {
        const dueDate = new Date(row.original.dueDate);
        const isOverdue = dueDate < new Date() && row.original.status !== 'paid';
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600' : ''}`}>
            {formatDate(row.original.dueDate)}
            {isOverdue && <div className="text-xs text-red-500">Overdue</div>}
          </div>
        );
      },
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === 'pending' && (
            <Button variant="ghost" size="sm" title="Mark as Paid">
              <Calendar className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Utility & Special Accounts</h1>
              <p className="text-muted-foreground">
                Manage utility bills, vendor invoices, and departmental expenses
              </p>
            </div>
            {canCreate('utilities') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Bill
              </Button>
            )}
          </div>

          {/* Dashboard Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Utilities</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.monthlyUtilities || 15000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month's total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.pendingBills || 8500000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingCount || 12} bills pending
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Bills</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.overdueBills || 2500000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueCount || 3} bills overdue
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Monthly</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.averageMonthly || 14200000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 6 months average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bills List */}
          <Card>
            <CardHeader>
              <CardTitle>Utility Bills</CardTitle>
              <CardDescription>
                View and manage all utility bills and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Utility Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="internet">Internet</SelectItem>
                    <SelectItem value="telephone">Telephone</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_quarter">Last Quarter</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={bills}
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
