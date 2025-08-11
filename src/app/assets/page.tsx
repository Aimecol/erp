'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, MapPin, User, Calendar, TrendingDown } from 'lucide-react';
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
import { FixedAsset } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function FixedAssetsPage() {
  const { canRead, canCreate, canUpdate, isAdmin, isStoreManager } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedLocation, setSelectedLocation] = React.useState('all');
  const [selectedCondition, setSelectedCondition] = React.useState('all');

  // Check permissions
  if (!canRead('assets')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view fixed assets.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['assets', 'list', { 
      search: searchTerm, 
      status: selectedStatus, 
      category: selectedCategory,
      location: selectedLocation,
      condition: selectedCondition 
    }],
    queryFn: () => api.get('/v1/assets', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        location: selectedLocation !== 'all' ? selectedLocation : undefined,
        condition: selectedCondition !== 'all' ? selectedCondition : undefined,
      }
    }),
  });

  const { data: assetStats } = useQuery({
    queryKey: ['assets', 'dashboard-stats'],
    queryFn: () => api.get('/v1/assets/dashboard-stats'),
  });

  const assets = assetsData?.data || [];
  const stats = assetStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      disposed: 'destructive',
      under_maintenance: 'secondary',
      retired: 'outline'
    };
    return variants[status] || 'outline';
  };

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, any> = {
      excellent: 'default',
      good: 'secondary',
      fair: 'outline',
      poor: 'destructive',
      damaged: 'destructive'
    };
    return variants[condition] || 'outline';
  };

  const columns = [
    {
      accessorKey: 'assetNumber',
      header: 'Asset Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.assetNumber}</div>
      ),
    },
    {
      accessorKey: 'assetName',
      header: 'Asset Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.assetName}</div>
          <div className="text-sm text-muted-foreground">{row.original.assetCategory?.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{row.original.location?.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'custodian',
      header: 'Custodian',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">
            {row.original.custodian?.firstName} {row.original.custodian?.lastName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'acquisitionDate',
      header: 'Acquisition Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.acquisitionDate)}</div>
      ),
    },
    {
      accessorKey: 'acquisitionCost',
      header: 'Acquisition Cost',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.acquisitionCost)}</div>
      ),
    },
    {
      accessorKey: 'currentValue',
      header: 'Current Value',
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{formatCurrency(row.original.currentValue)}</div>
      ),
    },
    {
      accessorKey: 'depreciatedValue',
      header: 'Depreciated Value',
      cell: ({ row }: any) => (
        <div className="font-medium text-red-600">{formatCurrency(row.original.depreciatedValue)}</div>
      ),
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }: any) => (
        <Badge variant={getConditionBadge(row.original.condition)}>
          {row.original.condition.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={getStatusBadge(row.original.status)}>
          {row.original.status.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Asset">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('assets') && (
            <Button variant="ghost" size="sm" title="Edit Asset">
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
              <h1 className="text-3xl font-bold tracking-tight">Fixed Assets & Asset Management</h1>
              <p className="text-muted-foreground">
                Manage institutional assets, depreciation, and maintenance schedules
              </p>
            </div>
            {canCreate('assets') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            )}
          </div>

          {/* Asset Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalAssets || 1245}</div>
                <p className="text-xs text-muted-foreground">
                  Registered assets
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalValue || 8500000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current book value
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Depreciation</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.monthlyDepreciation || 125000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
                <Calendar className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.underMaintenance || 23}</div>
                <p className="text-xs text-muted-foreground">
                  Assets in maintenance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assets List */}
          <Card>
            <CardHeader>
              <CardTitle>Fixed Assets Register</CardTitle>
              <CardDescription>
                View and manage all institutional fixed assets and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="buildings">Buildings</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="vehicles">Vehicles</SelectItem>
                    <SelectItem value="it_equipment">IT Equipment</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="main_building">Main Building</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="dormitory">Dormitory</SelectItem>
                    <SelectItem value="admin_block">Admin Block</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={assets}
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
