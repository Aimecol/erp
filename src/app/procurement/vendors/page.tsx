'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, Star, Building, Phone, Mail } from 'lucide-react';
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
import { Vendor } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function VendorsPage() {
  const { canRead, canCreate, canUpdate, isAdmin, isStoreManager } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  // Check permissions
  if (!canRead('procurement')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view vendors.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ['procurement', 'vendors', { 
      search: searchTerm, 
      status: selectedStatus, 
      type: selectedType,
      category: selectedCategory 
    }],
    queryFn: () => api.get('/v1/procurement/vendors', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      }
    }),
  });

  const { data: vendorStats } = useQuery({
    queryKey: ['procurement', 'vendor-stats'],
    queryFn: () => api.get('/v1/procurement/vendors/stats'),
  });

  const vendors = vendorsData?.data || [];
  const stats = vendorStats?.data || {};

  const getStatusBadge = (isActive: boolean, isBlacklisted: boolean) => {
    if (isBlacklisted) return 'destructive';
    if (isActive) return 'default';
    return 'secondary';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      goods: 'default',
      services: 'secondary',
      both: 'outline'
    };
    return variants[type] || 'outline';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const columns = [
    {
      accessorKey: 'vendorCode',
      header: 'Vendor Code',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.vendorCode}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Vendor Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Building className="h-3 w-3" />
            {row.original.contactPerson}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'vendorType',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant={getTypeBadge(row.original.vendorType)}>
          {row.original.vendorType.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }: any) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {row.original.contactPhone}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Mail className="h-3 w-3" />
            {row.original.contactEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          {renderStars(row.original.rating || 0)}
          <span className="text-sm text-muted-foreground ml-1">
            ({row.original.rating || 0}/5)
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'paymentTerms',
      header: 'Payment Terms',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.paymentTerms}</div>
      ),
    },
    {
      accessorKey: 'creditLimit',
      header: 'Credit Limit',
      cell: ({ row }: any) => (
        <div className="font-medium">
          {row.original.creditLimit ? formatCurrency(row.original.creditLimit) : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const { isActive, isBlacklisted, isPreferred } = row.original;
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={getStatusBadge(isActive, isBlacklisted)}>
              {isBlacklisted ? 'BLACKLISTED' : isActive ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
            {isPreferred && (
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                PREFERRED
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Vendor">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('procurement') && (
            <Button variant="ghost" size="sm" title="Edit Vendor">
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
              <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
              <p className="text-muted-foreground">
                Manage vendor database, evaluations, and relationships
              </p>
            </div>
            {canCreate('procurement') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            )}
          </div>

          {/* Vendor Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                <Building className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalVendors || 85}</div>
                <p className="text-xs text-muted-foreground">
                  Registered vendors
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                <Building className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeVendors || 78}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.activeVendors || 78) / (stats.totalVendors || 85) * 100).toFixed(0)}% active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Preferred Vendors</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.preferredVendors || 25}</div>
                <p className="text-xs text-muted-foreground">
                  High-rated vendors
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {(stats.averageRating || 4.2).toFixed(1)}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  Vendor performance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Vendors List */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Directory</CardTitle>
              <CardDescription>
                View and manage all vendor information and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search vendors..."
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
                    <SelectItem value="goods">Goods</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="office_supplies">Office Supplies</SelectItem>
                    <SelectItem value="it_equipment">IT Equipment</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
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
                    <SelectItem value="preferred">Preferred</SelectItem>
                    <SelectItem value="blacklisted">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={vendors}
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
