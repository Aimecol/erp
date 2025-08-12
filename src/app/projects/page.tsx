'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, Filter, Download, Eye, DollarSign, Calendar, TrendingUp,
  AlertTriangle, FileText, BarChart3, PieChart, Activity, CheckCircle,
  Clock, Users, Target, Banknote, Receipt, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { Project } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const { canRead, canCreate, canUpdate, canApprove, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedDonor, setSelectedDonor] = React.useState('all');
  const [selectedProject, setSelectedProject] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current_year');

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

  const { data: disbursementsData, isLoading: disbursementsLoading } = useQuery({
    queryKey: ['projects', 'disbursements', { project: selectedProject, period: selectedPeriod }],
    queryFn: () => api.get('/v1/projects/disbursements', {
      params: {
        project: selectedProject !== 'all' ? selectedProject : undefined,
        period: selectedPeriod,
      }
    }),
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['projects', 'reports', { project: selectedProject, period: selectedPeriod }],
    queryFn: () => api.get('/v1/projects/reports', {
      params: {
        project: selectedProject !== 'all' ? selectedProject : undefined,
        period: selectedPeriod,
      }
    }),
  });

  const projects = projectsData?.data || [];
  const stats = dashboardStats?.data || {};
  const disbursements = disbursementsData?.data || [];
  const reports = reportsData?.data || [];

  // Mock disbursements data
  const mockDisbursements = [
    {
      id: 'disb-001',
      projectId: 'PROJ-2024-001',
      projectName: 'STEM Education Enhancement',
      disbursementNumber: 'DISB-2024-001',
      date: new Date('2024-01-15'),
      amount: 25000000,
      purpose: 'Laboratory Equipment Purchase',
      category: 'Equipment',
      approvedBy: 'Dr. Jean NKURUNZIZA',
      status: 'completed',
      vendor: 'Scientific Equipment Ltd',
      budgetLine: 'Equipment & Supplies',
      remainingBudget: 75000000
    },
    {
      id: 'disb-002',
      projectId: 'PROJ-2024-002',
      projectName: 'Digital Library Initiative',
      disbursementNumber: 'DISB-2024-002',
      date: new Date('2024-01-20'),
      amount: 15000000,
      purpose: 'Software Licensing',
      category: 'Software',
      approvedBy: 'Prof. Marie UWIMANA',
      status: 'pending',
      vendor: 'Digital Solutions Rwanda',
      budgetLine: 'Technology',
      remainingBudget: 35000000
    },
    {
      id: 'disb-003',
      projectId: 'PROJ-2024-001',
      projectName: 'STEM Education Enhancement',
      disbursementNumber: 'DISB-2024-003',
      date: new Date('2024-01-25'),
      amount: 8000000,
      purpose: 'Training Materials',
      category: 'Training',
      approvedBy: 'Dr. Jean NKURUNZIZA',
      status: 'approved',
      vendor: 'Educational Resources Co.',
      budgetLine: 'Training & Development',
      remainingBudget: 67000000
    }
  ];

  // Mock project reports data
  const mockProjectReports = [
    {
      id: 'rpt-001',
      projectId: 'PROJ-2024-001',
      projectName: 'STEM Education Enhancement',
      reportType: 'Financial Report',
      period: 'Q1 2024',
      generatedDate: new Date('2024-01-31'),
      totalBudget: 100000000,
      totalDisbursed: 33000000,
      totalCommitted: 15000000,
      remainingBudget: 52000000,
      utilizationRate: 33,
      status: 'submitted',
      submittedBy: 'Dr. Jean NKURUNZIZA',
      dueDate: new Date('2024-02-05')
    },
    {
      id: 'rpt-002',
      projectId: 'PROJ-2024-002',
      projectName: 'Digital Library Initiative',
      reportType: 'Progress Report',
      period: 'Q1 2024',
      generatedDate: new Date('2024-01-31'),
      totalBudget: 50000000,
      totalDisbursed: 15000000,
      totalCommitted: 10000000,
      remainingBudget: 25000000,
      utilizationRate: 30,
      status: 'draft',
      submittedBy: 'Prof. Marie UWIMANA',
      dueDate: new Date('2024-02-05')
    }
  ];

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

  const disbursementColumns = [
    {
      accessorKey: 'disbursementNumber',
      header: 'Disbursement #',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.disbursementNumber}</div>
      ),
    },
    {
      accessorKey: 'projectName',
      header: 'Project',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.projectName}</div>
          <div className="text-sm text-muted-foreground">{row.original.projectId}</div>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.date)}</div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.purpose}</div>
          <div className="text-sm text-muted-foreground">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'completed' ? 'default' :
                      status === 'approved' ? 'secondary' :
                      status === 'pending' ? 'outline' : 'destructive';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
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

  const reportColumns = [
    {
      accessorKey: 'projectName',
      header: 'Project',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.projectName}</div>
          <div className="text-sm text-muted-foreground">{row.original.projectId}</div>
        </div>
      ),
    },
    {
      accessorKey: 'reportType',
      header: 'Report Type',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.reportType}</div>
          <div className="text-sm text-muted-foreground">{row.original.period}</div>
        </div>
      ),
    },
    {
      accessorKey: 'utilizationRate',
      header: 'Budget Utilization',
      cell: ({ row }: any) => (
        <div>
          <div className="flex items-center gap-2">
            <Progress value={row.original.utilizationRate} className="w-16 h-2" />
            <span className="text-sm font-medium">{row.original.utilizationRate}%</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(row.original.totalDisbursed)} / {formatCurrency(row.original.totalBudget)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'submitted' ? 'default' :
                      status === 'approved' ? 'secondary' :
                      status === 'draft' ? 'outline' : 'destructive';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.dueDate)}</div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
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

          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList>
              <TabsTrigger value="projects">Projects Overview</TabsTrigger>
              <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
              <TabsTrigger value="reports">Financial Reports</TabsTrigger>
              <TabsTrigger value="analytics">Budget Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
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
            </TabsContent>

            <TabsContent value="disbursements" className="space-y-6">
              {/* Disbursements Summary */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Disbursements</CardTitle>
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(48000000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This year
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(15000000)} value
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(25000000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      5 disbursements
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
                    <Target className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(16000000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per disbursement
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    Project Disbursements
                  </CardTitle>
                  <CardDescription>
                    Track all project fund disbursements and approvals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectItem value="PROJ-2024-001">STEM Education Enhancement</SelectItem>
                        <SelectItem value="PROJ-2024-002">Digital Library Initiative</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current_month">Current Month</SelectItem>
                        <SelectItem value="current_quarter">Current Quarter</SelectItem>
                        <SelectItem value="current_year">Current Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {canCreate('projects') && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Disbursement
                      </Button>
                    )}
                  </div>

                  <DataTable
                    columns={disbursementColumns}
                    data={mockDisbursements}
                    loading={disbursementsLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Financial Reports
                  </CardTitle>
                  <CardDescription>
                    Project financial reports and budget utilization analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectItem value="PROJ-2024-001">STEM Education Enhancement</SelectItem>
                        <SelectItem value="PROJ-2024-002">Digital Library Initiative</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current_quarter">Current Quarter</SelectItem>
                        <SelectItem value="current_year">Current Year</SelectItem>
                        <SelectItem value="last_year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {canCreate('projects') && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    )}
                  </div>

                  <DataTable
                    columns={reportColumns}
                    data={mockProjectReports}
                    loading={reportsLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Budget Utilization
                    </CardTitle>
                    <CardDescription>Project budget utilization trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">STEM Education Enhancement</span>
                        <span className="text-sm text-muted-foreground">33%</span>
                      </div>
                      <Progress value={33} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Digital Library Initiative</span>
                        <span className="text-sm text-muted-foreground">30%</span>
                      </div>
                      <Progress value={30} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Research Infrastructure</span>
                        <span className="text-sm text-muted-foreground">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Disbursement Categories
                    </CardTitle>
                    <CardDescription>Breakdown by expense category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Equipment</span>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(25000000)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Software</span>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(15000000)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-sm">Training</span>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(8000000)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Project Performance Metrics
                  </CardTitle>
                  <CardDescription>Key performance indicators across all projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">85%</div>
                      <div className="text-sm text-muted-foreground">On-time Delivery</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">92%</div>
                      <div className="text-sm text-muted-foreground">Budget Compliance</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">78%</div>
                      <div className="text-sm text-muted-foreground">Milestone Achievement</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">95%</div>
                      <div className="text-sm text-muted-foreground">Stakeholder Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
