'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Package, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';
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
import { Item, StockLevel } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InventoryPage() {
  const { canRead, canCreate, isStoreManager, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Check permissions
  if (!canRead('inventory')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view inventory.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', 'items', { 
      search: searchTerm, 
      category: selectedCategory, 
      warehouse: selectedWarehouse,
      status: selectedStatus 
    }],
    queryFn: () => api.get('/v1/inventory/items', {
      params: {
        search: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        warehouse: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['inventory', 'dashboard-stats'],
    queryFn: () => api.get('/v1/inventory/dashboard-stats'),
  });

  const items = inventoryData?.data || [];
  const stats = dashboardStats?.data || {};

  const getStockStatus = (item: any) => {
    const stock = item.currentStock || 0;
    const reorderLevel = item.reorderLevel || 0;
    const minStock = item.minStock || 0;

    if (stock === 0) return { status: 'out_of_stock', color: 'destructive' };
    if (stock <= minStock) return { status: 'critical', color: 'destructive' };
    if (stock <= reorderLevel) return { status: 'low', color: 'secondary' };
    return { status: 'normal', color: 'default' };
  };

  const columns = [
    {
      accessorKey: 'code',
      header: 'Item Code',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.code}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Item Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.category?.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'currentStock',
      header: 'Current Stock',
      cell: ({ row }: any) => {
        const stockInfo = getStockStatus(row.original);
        return (
          <div className="flex items-center gap-2">
            <div className="font-medium">{row.original.currentStock || 0}</div>
            <Badge variant={stockInfo.color as any} className="text-xs">
              {stockInfo.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'unitOfMeasure',
      header: 'UOM',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.unitOfMeasure}</div>
      ),
    },
    {
      accessorKey: 'stockLevel',
      header: 'Stock Level',
      cell: ({ row }: any) => {
        const current = row.original.currentStock || 0;
        const max = row.original.maxStock || 100;
        const percentage = (current / max) * 100;
        return (
          <div className="w-20">
            <Progress value={percentage} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {current}/{max}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'value',
      header: 'Stock Value',
      cell: ({ row }: any) => {
        const value = (row.original.currentStock || 0) * (row.original.standardCost || 0);
        return (
          <div className="font-medium">{formatCurrency(value)}</div>
        );
      },
    },
    {
      accessorKey: 'lastMovement',
      header: 'Last Movement',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.lastMovement ? formatDate(row.original.lastMovement) : 'No movement'}
        </div>
      ),
    },
    {
      accessorKey: 'tracking',
      header: 'Tracking',
      cell: ({ row }: any) => (
        <div className="flex gap-1">
          {row.original.isBatchManaged && (
            <Badge variant="outline" className="text-xs">Batch</Badge>
          )}
          {row.original.isSerialManaged && (
            <Badge variant="outline" className="text-xs">Serial</Badge>
          )}
        </div>
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
          <Button variant="ghost" size="sm" title="Stock Movement">
            <BarChart3 className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Stores & Inventory Management</h1>
              <p className="text-muted-foreground">
                Manage inventory items, stock levels, and warehouse operations
              </p>
            </div>
            {canCreate('inventory') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>

          {/* Dashboard Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems || 1250}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeItems || 1180} active items
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalStockValue || 450000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all warehouses
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems || 45}</div>
                <p className="text-xs text-muted-foreground">
                  Need reordering
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.expiringSoon || 12}</div>
                <p className="text-xs text-muted-foreground">
                  Within 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory List */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                View and manage all inventory items and stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
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
                    <SelectItem value="office_supplies">Office Supplies</SelectItem>
                    <SelectItem value="lab_equipment">Lab Equipment</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="consumables">Consumables</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    <SelectItem value="main">Main Store</SelectItem>
                    <SelectItem value="lab">Lab Store</SelectItem>
                    <SelectItem value="admin">Admin Store</SelectItem>
                    <SelectItem value="library">Library Store</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={items}
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
