'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';
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
import { PurchaseRequest } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ProcurementPage() {
  const { canRead, canCreate, canUpdate, canApprove, isAdmin, isStoreManager } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedPriority, setSelectedPriority] = React.useState('all');
  const [selectedDepartment, setSelectedDepartment] = React.useState('all');

  // Check permissions
  if (!canRead('procurement')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view procurement.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['procurement', 'requests', { 
      search: searchTerm, 
      status: selectedStatus, 
      priority: selectedPriority,
      department: selectedDepartment 
    }],
    queryFn: () => api.get('/v1/procurement/requests', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      }
    }),
  });

  const { data: procurementStats } = useQuery({
    queryKey: ['procurement', 'dashboard-stats'],
    queryFn: () => api.get('/v1/procurement/dashboard-stats'),
  });

  const requests = requestsData?.data || [];
  const stats = procurementStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      submitted: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      converted: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive',
      urgent: 'destructive'
    };
    return variants[priority] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'converted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <ShoppingCart className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'requestNumber',
      header: 'Request Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.requestNumber}</div>
      ),
    },
    {
      accessorKey: 'requestDate',
      header: 'Request Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.requestDate)}</div>
      ),
    },
    {
      accessorKey: 'requestedBy',
      header: 'Requested By',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.requestedBy}</div>
          <div className="text-sm text-muted-foreground">{row.original.department?.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'justification',
      header: 'Description',
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate" title={row.original.justification}>
          {row.original.justification}
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => (
        <Badge variant={getPriorityBadge(row.original.priority)}>
          {row.original.priority.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.totalAmount)}</div>
      ),
    },
    {
      accessorKey: 'expectedDeliveryDate',
      header: 'Expected Delivery',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.expectedDeliveryDate ? formatDate(row.original.expectedDeliveryDate) : '-'}
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
          <Button variant="ghost" size="sm" title="View Request">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('procurement') && row.original.status === 'draft' && (
            <Button variant="ghost" size="sm" title="Edit Request">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canApprove('procurement') && row.original.status === 'submitted' && (
            <Button variant="ghost" size="sm" title="Approve Request">
              <CheckCircle className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Procurement & Supply Chain</h1>
              <p className="text-muted-foreground">
                Manage purchase requests, orders, and vendor relationships
              </p>
            </div>
            {canCreate('procurement') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            )}
          </div>

          {/* Procurement Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalRequests || 245}</div>
                <p className="text-xs text-muted-foreground">
                  This year
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingApproval || 18}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalValue || 1250000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Approved requests
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                <ShoppingCart className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.activeVendors || 85}</div>
                <p className="text-xs text-muted-foreground">
                  Registered vendors
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Requests</CardTitle>
              <CardDescription>
                View and manage all purchase requests and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
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
                    <SelectItem value="it">IT Services</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={requests}
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
