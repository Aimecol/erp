'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, Eye, Calculator, TrendingDown, Calendar, DollarSign } from 'lucide-react';
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
import { DepreciationEntry } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AssetDepreciationPage() {
  const { canRead, canUpdate, isAdmin, isBursar } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState('all');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current');

  // Check permissions
  if (!canRead('assets')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view asset depreciation.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: depreciationData, isLoading } = useQuery({
    queryKey: ['assets', 'depreciation', { 
      search: searchTerm, 
      method: selectedMethod, 
      category: selectedCategory,
      period: selectedPeriod 
    }],
    queryFn: () => api.get('/v1/assets/depreciation', {
      params: {
        search: searchTerm,
        method: selectedMethod !== 'all' ? selectedMethod : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        period: selectedPeriod,
      }
    }),
  });

  const { data: depreciationStats } = useQuery({
    queryKey: ['assets', 'depreciation-stats', selectedPeriod],
    queryFn: () => api.get('/v1/assets/depreciation/stats', {
      params: { period: selectedPeriod }
    }),
  });

  const depreciation = depreciationData?.data || [];
  const stats = depreciationStats?.data || {};

  const getMethodBadge = (method: string) => {
    const variants: Record<string, any> = {
      straight_line: 'default',
      declining_balance: 'secondary',
      units_of_production: 'outline'
    };
    return variants[method] || 'outline';
  };

  const columns = [
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
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }: any) => (
        <Badge variant={getMethodBadge(row.original.method)}>
          {row.original.method.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.rate}%</div>
      ),
    },
    {
      accessorKey: 'openingValue',
      header: 'Opening Value',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.openingValue)}</div>
      ),
    },
    {
      accessorKey: 'depreciationAmount',
      header: 'Depreciation',
      cell: ({ row }: any) => (
        <div className="font-medium text-red-600">{formatCurrency(row.original.depreciationAmount)}</div>
      ),
    },
    {
      accessorKey: 'closingValue',
      header: 'Closing Value',
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{formatCurrency(row.original.closingValue)}</div>
      ),
    },
    {
      accessorKey: 'depreciationProgress',
      header: 'Progress',
      cell: ({ row }: any) => {
        const asset = row.original.asset;
        const progress = asset ? ((asset.acquisitionCost - asset.currentValue) / asset.acquisitionCost * 100) : 0;
        return (
          <div className="w-24">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}%</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'calculatedBy',
      header: 'Calculated By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.calculatedBy}</div>
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
          {canUpdate('assets') && (
            <Button variant="ghost" size="sm" title="Recalculate">
              <Calculator className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Asset Depreciation</h1>
              <p className="text-muted-foreground">
                Track and manage asset depreciation calculations and schedules
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              {canUpdate('assets') && (
                <Button>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Depreciation
                </Button>
              )}
            </div>
          </div>

          {/* Depreciation Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Asset Value</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalAssetValue || 8500000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current book value
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accumulated Depreciation</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.accumulatedDepreciation || 2100000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total depreciated
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Depreciation</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
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
                <CardTitle className="text-sm font-medium">Average Depreciation Rate</CardTitle>
                <TrendingDown className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {(stats.averageDepreciationRate || 15).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all assets
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Depreciation Methods Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Straight Line Method</CardTitle>
                <CardDescription>
                  Equal depreciation over asset's useful life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.straightLineAssets || 856}</div>
                <p className="text-xs text-muted-foreground">
                  Assets using this method
                </p>
                <div className="mt-2">
                  <Progress value={((stats.straightLineAssets || 856) / (stats.totalAssets || 1245) * 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Declining Balance</CardTitle>
                <CardDescription>
                  Higher depreciation in early years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.decliningBalanceAssets || 289}</div>
                <p className="text-xs text-muted-foreground">
                  Assets using this method
                </p>
                <div className="mt-2">
                  <Progress value={((stats.decliningBalanceAssets || 289) / (stats.totalAssets || 1245) * 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Units of Production</CardTitle>
                <CardDescription>
                  Based on actual usage/production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.unitsProductionAssets || 100}</div>
                <p className="text-xs text-muted-foreground">
                  Assets using this method
                </p>
                <div className="mt-2">
                  <Progress value={((stats.unitsProductionAssets || 100) / (stats.totalAssets || 1245) * 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Depreciation Entries List */}
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Entries</CardTitle>
              <CardDescription>
                View all depreciation calculations and entries for assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search depreciation entries..."
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

                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="straight_line">Straight Line</SelectItem>
                    <SelectItem value="declining_balance">Declining Balance</SelectItem>
                    <SelectItem value="units_of_production">Units of Production</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="previous">Previous</SelectItem>
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
                data={depreciation}
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
