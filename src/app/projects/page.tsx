'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, DollarSign, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
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
import { Project } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const { canRead, canCreate, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedDonor, setSelectedDonor] = React.useState('all');

  // Check permissions
  if (!canRead('projects')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view project accounts.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', 'list', { search: searchTerm, status: selectedStatus, donor: selectedDonor }],
    queryFn: () => api.get('/v1/projects', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        donor: selectedDonor !== 'all' ? selectedDonor : undefined,
      }
    }),
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['projects', 'dashboard-stats'],
    queryFn: () => api.get('/v1/projects/dashboard-stats'),
  });

  const projects = projectsData?.data || [];
  const stats = dashboardStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      planning: 'outline',
      active: 'default',
      on_hold: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const columns = [
    {
      accessorKey: 'code',
      header: 'Project Code',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.code}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Project Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.donor?.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{formatCurrency(row.original.totalBudget)}</div>
          <div className="text-sm text-muted-foreground">
            Approved: {formatCurrency(row.original.approvedBudget)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'spent',
      header: 'Spent',
      cell: ({ row }: any) => {
        const spentPercentage = (row.original.spentAmount / row.original.approvedBudget) * 100;
        return (
          <div>
            <div className="font-medium text-red-600">{formatCurrency(row.original.spentAmount)}</div>
            <Progress value={spentPercentage} className="w-16 h-2 mt-1" />
          </div>
        );
      },
    },
    {
      accessorKey: 'remaining',
      header: 'Remaining',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">
          {formatCurrency(row.original.remainingBudget)}
        </div>
      ),
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }: any) => (
        <div>
          <div className="text-sm">{formatDate(row.original.startDate)}</div>
          <div className="text-sm text-muted-foreground">to {formatDate(row.original.endDate)}</div>
        </div>
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
          <Button variant="ghost" size="sm" title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Financial Report">
            <DollarSign className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Project Accounts</h1>
              <p className="text-muted-foreground">
                Manage project budgets, donor grants, and financial tracking
              </p>
            </div>
            {canCreate('projects') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            )}
          </div>

          {/* Dashboard Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects || 12}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalProjects || 18} total projects
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalBudget || 2500000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Approved: {formatCurrency(stats.approvedBudget || 2200000000)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Funds Utilized</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.fundsUtilized || 1650000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.utilizationRate || 75}% utilization rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Milestones</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdueMilestones || 3}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Projects List */}
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                View and manage all project accounts and budgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDonor} onValueChange={setSelectedDonor}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Donor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Donors</SelectItem>
                    <SelectItem value="world_bank">World Bank</SelectItem>
                    <SelectItem value="usaid">USAID</SelectItem>
                    <SelectItem value="eu">European Union</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={projects}
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
