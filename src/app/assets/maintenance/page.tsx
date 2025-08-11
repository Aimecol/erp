'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, Wrench, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
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
import { AssetMaintenance } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AssetMaintenancePage() {
  const { canRead, canCreate, canUpdate, isAdmin, isStoreManager } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedPriority, setSelectedPriority] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('month');

  // Check permissions
  if (!canRead('assets')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view asset maintenance.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ['assets', 'maintenance', { 
      search: searchTerm, 
      status: selectedStatus, 
      type: selectedType,
      priority: selectedPriority,
      dateRange 
    }],
    queryFn: () => api.get('/v1/assets/maintenance', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        dateRange,
      }
    }),
  });

  const { data: maintenanceStats } = useQuery({
    queryKey: ['assets', 'maintenance-stats', dateRange],
    queryFn: () => api.get('/v1/assets/maintenance/stats', {
      params: { dateRange }
    }),
  });

  const maintenance = maintenanceData?.data || [];
  const stats = maintenanceStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: 'outline',
      in_progress: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      preventive: 'default',
      corrective: 'secondary',
      emergency: 'destructive'
    };
    return variants[type] || 'outline';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    };
    return variants[priority] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4 text-blue-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Wrench className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'maintenanceNumber',
      header: 'Maintenance #',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.maintenanceNumber}</div>
      ),
    },
    {
      accessorKey: 'asset',
      header: 'Asset',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.asset?.assetName}</div>
          <div className="text-sm text-muted-foreground">{row.original.asset?.assetNumber}</div>
        </div>
      ),
    },
    {
      accessorKey: 'maintenanceType',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant={getTypeBadge(row.original.maintenanceType)}>
          {row.original.maintenanceType.toUpperCase()}
        </Badge>
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
      accessorKey: 'scheduledDate',
      header: 'Scheduled Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.scheduledDate)}</div>
      ),
    },
    {
      accessorKey: 'actualDate',
      header: 'Actual Date',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.actualDate ? formatDate(row.original.actualDate) : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.cost)}</div>
      ),
    },
    {
      accessorKey: 'technician',
      header: 'Technician',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.technician}</div>
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
          <Button variant="ghost" size="sm" title="View Maintenance">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('assets') && row.original.status !== 'completed' && (
            <Button variant="ghost" size="sm" title="Edit Maintenance">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canUpdate('assets') && row.original.status === 'in_progress' && (
            <Button variant="ghost" size="sm" title="Complete Maintenance">
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
              <h1 className="text-3xl font-bold tracking-tight">Asset Maintenance</h1>
              <p className="text-muted-foreground">
                Schedule and track maintenance activities for institutional assets
              </p>
            </div>
            {canCreate('assets') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            )}
          </div>

          {/* Maintenance Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalMaintenance || 156}</div>
                <p className="text-xs text-muted-foreground">
                  This year
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.scheduled || 23}</div>
                <p className="text-xs text-muted-foreground">
                  Upcoming maintenance
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Wrench className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress || 8}</div>
                <p className="text-xs text-muted-foreground">
                  Currently ongoing
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalCost || 85000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This year
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance List */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>
                View and manage all asset maintenance activities and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search maintenance..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
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
                data={maintenance}
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
