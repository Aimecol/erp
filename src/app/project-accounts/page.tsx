'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen, DollarSign, TrendingUp, AlertTriangle, Search, Filter, Download, Eye, Plus, BarChart3 } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  manager: string;
  department: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  remaining: number;
  progress: number;
  lastActivity: string;
  createdAt: string;
}

interface Disbursement {
  id: string;
  projectId: string;
  projectName: string;
  category: string;
  description: string;
  amount: number;
  requestedBy: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  requestDate: string;
  approvalDate: string;
  disbursementDate: string;
  reference: string;
}

export default function ProjectAccountsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedDepartment, setSelectedDepartment] = React.useState('all');
  const [selectedManager, setSelectedManager] = React.useState('all');

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', { search: searchTerm, status: selectedStatus, department: selectedDepartment, manager: selectedManager }],
    queryFn: () => api.get<ApiResponse<Project[]>>('/v1/projects', {
      search: searchTerm,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      manager: selectedManager !== 'all' ? selectedManager : undefined,
    }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['projects', 'stats'],
    queryFn: () => api.get<ApiResponse<any>>('/v1/projects/stats'),
  });

  const { data: disbursementsData } = useQuery({
    queryKey: ['disbursements'],
    queryFn: () => api.get<ApiResponse<Disbursement[]>>('/v1/disbursements'),
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get<ApiResponse<any[]>>('/v1/departments'),
  });

  const projects = projectsData?.data || [];
  const stats = statsData?.data || {};
  const disbursements = disbursementsData?.data || [];
  const departments = departmentsData?.data || [];

  const projectColumns = [
    {
      accessorKey: 'code',
      header: 'Project Code',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('code')}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Project Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <div className="text-sm text-muted-foreground">{row.original.description}</div>
        </div>
      ),
    },
    {
      accessorKey: 'manager',
      header: 'Manager',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('manager')}</div>
          <div className="text-sm text-muted-foreground">{row.original.department}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={
            status === 'active' ? 'default' :
            status === 'completed' ? 'secondary' :
            status === 'on-hold' ? 'outline' :
            status === 'cancelled' ? 'destructive' : 'outline'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }: any) => formatCurrency(row.getValue('budget')),
    },
    {
      accessorKey: 'spent',
      header: 'Spent',
      cell: ({ row }: any) => {
        const spent = row.getValue('spent') as number;
        const budget = row.original.budget;
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        return (
          <div>
            <div className="font-medium">{formatCurrency(spent)}</div>
            <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of budget</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'remaining',
      header: 'Remaining',
      cell: ({ row }: any) => {
        const remaining = row.getValue('remaining') as number;
        return (
          <div className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(Math.abs(remaining))}
            {remaining < 0 && ' (Over)'}
          </div>
        );
      },
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }: any) => {
        const progress = row.getValue('progress') as number;
        return (
          <div className="w-20">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-center mt-1">{progress}%</div>
          </div>
        );
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
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const disbursementColumns = [
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('reference')}</div>
      ),
    },
    {
      accessorKey: 'projectName',
      header: 'Project',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('projectName')}</div>
          <div className="text-sm text-muted-foreground">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate">{row.getValue('description')}</div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => formatCurrency(row.getValue('amount')),
    },
    {
      accessorKey: 'requestedBy',
      header: 'Requested By',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('requestedBy')}</div>
          <div className="text-sm text-muted-foreground">{formatDate(row.original.requestDate)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={
            status === 'disbursed' ? 'default' :
            status === 'approved' ? 'secondary' :
            status === 'pending' ? 'outline' :
            status === 'rejected' ? 'destructive' : 'outline'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'disbursementDate',
      header: 'Disbursed',
      cell: ({ row }: any) => {
        const date = row.getValue('disbursementDate');
        return date ? formatDate(date) : '-';
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
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
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
              <h1 className="text-3xl font-bold tracking-tight">Project Accounts</h1>
              <p className="text-muted-foreground">
                Track project budgets, disbursements, and financial performance
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalProjects || 0} total projects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalBudget || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all active projects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalSpent || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.spentPercentage || 0}% of total budget
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overBudgetProjects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Projects exceeding budget
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Portfolio</CardTitle>
                  <CardDescription>
                    Monitor project budgets and financial performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search projects..."
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
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <DataTable
                    columns={projectColumns}
                    data={projects}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="disbursements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Disbursements</CardTitle>
                  <CardDescription>
                    Track and manage project fund disbursements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-2">
                      <Input placeholder="Search disbursements..." className="w-64" />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="disbursed">Disbursed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Disbursement
                    </Button>
                  </div>

                  <DataTable
                    columns={disbursementColumns}
                    data={disbursements}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Reports</CardTitle>
                    <CardDescription>
                      Generate project financial reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Project Budget vs Actual
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Spending Trends Analysis
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Cost Center Analysis
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Budget Variance Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Reports</CardTitle>
                    <CardDescription>
                      Track project performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Project Status Summary
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      ROI Analysis
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Resource Utilization
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Executive Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Overview</CardTitle>
                    <CardDescription>
                      Current budget allocation and utilization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Allocated</span>
                        <span className="font-bold">{formatCurrency(stats.totalBudget || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Spent</span>
                        <span className="font-bold text-red-600">{formatCurrency(stats.totalSpent || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Remaining</span>
                        <span className="font-bold text-green-600">{formatCurrency((stats.totalBudget || 0) - (stats.totalSpent || 0))}</span>
                      </div>
                      <Progress value={stats.spentPercentage || 0} className="h-3" />
                      <p className="text-sm text-muted-foreground text-center">
                        {stats.spentPercentage || 0}% of budget utilized
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget Alerts</CardTitle>
                    <CardDescription>
                      Projects requiring attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div className="flex-1">
                            <p className="font-medium">Project Alpha</p>
                            <p className="text-sm text-muted-foreground">95% budget utilized</p>
                          </div>
                          <Badge variant="destructive">Critical</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
