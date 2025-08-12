'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, Filter, Download, Eye, Calculator, Send, Users, DollarSign,
  Calendar, CheckCircle, Clock, UserCheck, FileText, BarChart3, TrendingUp,
  AlertTriangle, Target, Activity, Briefcase, Coffee, Plane, Heart
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { Payroll } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PayrollPage() {
  const { canRead, canCreate, canUpdate, canApprove, isAdmin, isHR } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current');
  const [selectedDepartment, setSelectedDepartment] = React.useState('all');
  const [selectedEmployee, setSelectedEmployee] = React.useState('all');

  // Check permissions
  if (!canRead('payroll')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view payroll.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: payrollsData, isLoading } = useQuery({
    queryKey: ['payroll', 'list', { 
      search: searchTerm, 
      status: selectedStatus, 
      period: selectedPeriod 
    }],
    queryFn: () => api.get('/v1/payroll', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        period: selectedPeriod,
      }
    }),
  });

  const { data: payrollStats } = useQuery({
    queryKey: ['payroll', 'dashboard-stats'],
    queryFn: () => api.get('/v1/payroll/dashboard-stats'),
  });

  const { data: leaveData, isLoading: leaveLoading } = useQuery({
    queryKey: ['leave-management', { employee: selectedEmployee, status: selectedStatus }],
    queryFn: () => api.get('/v1/leave-management', {
      params: {
        employee: selectedEmployee !== 'all' ? selectedEmployee : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', { department: selectedDepartment, period: selectedPeriod }],
    queryFn: () => api.get('/v1/attendance', {
      params: {
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
        period: selectedPeriod,
      }
    }),
  });

  const { data: statutoryData, isLoading: statutoryLoading } = useQuery({
    queryKey: ['statutory-reports', selectedPeriod],
    queryFn: () => api.get('/v1/statutory-reports', {
      params: { period: selectedPeriod }
    }),
  });

  const payrolls = payrollsData?.data || [];
  const stats = payrollStats?.data || {};
  const leaves = leaveData?.data || [];
  const attendance = attendanceData?.data || [];
  const statutory = statutoryData?.data || [];

  // Mock leave management data
  const mockLeaveRequests = [
    {
      id: 'leave-001',
      employeeName: 'Jean Baptiste UWIMANA',
      employeeId: 'EMP-001',
      department: 'Computer Science',
      leaveType: 'Annual Leave',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-22'),
      days: 8,
      reason: 'Family vacation',
      status: 'approved',
      approvedBy: 'Dr. Marie UWIMANA',
      appliedDate: new Date('2024-02-20'),
      remainingBalance: 14
    },
    {
      id: 'leave-002',
      employeeName: 'Marie Claire MUKAMANA',
      employeeId: 'EMP-002',
      department: 'Business Administration',
      leaveType: 'Sick Leave',
      startDate: new Date('2024-02-28'),
      endDate: new Date('2024-03-01'),
      days: 2,
      reason: 'Medical appointment',
      status: 'pending',
      approvedBy: null,
      appliedDate: new Date('2024-02-25'),
      remainingBalance: 10
    },
    {
      id: 'leave-003',
      employeeName: 'Paul KAGAME',
      employeeId: 'EMP-003',
      department: 'Engineering',
      leaveType: 'Maternity Leave',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-07-01'),
      days: 90,
      reason: 'Maternity leave',
      status: 'approved',
      approvedBy: 'Director General',
      appliedDate: new Date('2024-02-15'),
      remainingBalance: 0
    }
  ];

  // Mock attendance data
  const mockAttendance = [
    {
      id: 'att-001',
      employeeName: 'Jean Baptiste UWIMANA',
      employeeId: 'EMP-001',
      department: 'Computer Science',
      date: new Date('2024-02-20'),
      timeIn: '08:00',
      timeOut: '17:00',
      hoursWorked: 9,
      status: 'present',
      overtime: 1,
      lateMinutes: 0
    },
    {
      id: 'att-002',
      employeeName: 'Marie Claire MUKAMANA',
      employeeId: 'EMP-002',
      department: 'Business Administration',
      date: new Date('2024-02-20'),
      timeIn: '08:15',
      timeOut: '17:00',
      hoursWorked: 8.75,
      status: 'late',
      overtime: 0,
      lateMinutes: 15
    },
    {
      id: 'att-003',
      employeeName: 'Paul KAGAME',
      employeeId: 'EMP-003',
      department: 'Engineering',
      date: new Date('2024-02-20'),
      timeIn: null,
      timeOut: null,
      hoursWorked: 0,
      status: 'absent',
      overtime: 0,
      lateMinutes: 0
    }
  ];

  // Mock statutory reports data
  const mockStatutoryReports = [
    {
      id: 'stat-001',
      reportType: 'RSSB Contribution',
      period: 'February 2024',
      employeeContribution: 3500000,
      employerContribution: 5250000,
      totalContribution: 8750000,
      status: 'submitted',
      dueDate: new Date('2024-03-15'),
      submittedDate: new Date('2024-03-10')
    },
    {
      id: 'stat-002',
      reportType: 'PAYE Tax',
      period: 'February 2024',
      totalTax: 12500000,
      employeesCount: 45,
      status: 'pending',
      dueDate: new Date('2024-03-15'),
      submittedDate: null
    },
    {
      id: 'stat-003',
      reportType: 'Maternity Leave Fund',
      period: 'February 2024',
      contribution: 450000,
      beneficiaries: 2,
      status: 'submitted',
      dueDate: new Date('2024-03-15'),
      submittedDate: new Date('2024-03-12')
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      calculated: 'secondary',
      approved: 'default',
      paid: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'calculated':
        return <Calculator className="h-4 w-4 text-orange-500" />;
      case 'cancelled':
        return <CheckCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const leaveColumns = [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.employeeName}</div>
          <div className="text-sm text-muted-foreground">{row.original.employeeId} • {row.original.department}</div>
        </div>
      ),
    },
    {
      accessorKey: 'leaveType',
      header: 'Leave Type',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.leaveType}</div>
          <div className="text-sm text-muted-foreground">{row.original.days} days</div>
        </div>
      ),
    },
    {
      accessorKey: 'period',
      header: 'Period',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {formatDate(row.original.startDate)} - {formatDate(row.original.endDate)}
        </div>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate">{row.original.reason}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'approved' ? 'default' :
                      status === 'pending' ? 'secondary' :
                      status === 'rejected' ? 'destructive' : 'outline';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'remainingBalance',
      header: 'Balance',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.remainingBalance} days</div>
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
          {row.original.status === 'pending' && canApprove('payroll') && (
            <Button variant="ghost" size="sm">
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const attendanceColumns = [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.employeeName}</div>
          <div className="text-sm text-muted-foreground">{row.original.employeeId} • {row.original.department}</div>
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
      accessorKey: 'timeIn',
      header: 'Time In',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.timeIn || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'timeOut',
      header: 'Time Out',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.timeOut || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'hoursWorked',
      header: 'Hours',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.hoursWorked}h</div>
          {row.original.overtime > 0 && (
            <div className="text-sm text-blue-600">+{row.original.overtime}h OT</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'present' ? 'default' :
                      status === 'late' ? 'secondary' :
                      status === 'absent' ? 'destructive' : 'outline';
        return (
          <div>
            <Badge variant={variant}>{status}</Badge>
            {row.original.lateMinutes > 0 && (
              <div className="text-xs text-orange-600 mt-1">{row.original.lateMinutes}min late</div>
            )}
          </div>
        );
      },
    },
  ];

  const statutoryColumns = [
    {
      accessorKey: 'reportType',
      header: 'Report Type',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.reportType}</div>
      ),
    },
    {
      accessorKey: 'period',
      header: 'Period',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.period}</div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">
          {formatCurrency(row.original.totalContribution || row.original.totalTax || row.original.contribution)}
        </div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.dueDate)}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'submitted' ? 'default' :
                      status === 'pending' ? 'secondary' : 'destructive';
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
          {row.original.status === 'pending' && canUpdate('payroll') && (
            <Button variant="ghost" size="sm">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const columns = [
    {
      accessorKey: 'payrollNumber',
      header: 'Payroll Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.payrollNumber}</div>
      ),
    },
    {
      accessorKey: 'payPeriod',
      header: 'Pay Period',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">
            {formatDate(row.original.payPeriodStart)} - {formatDate(row.original.payPeriodEnd)}
          </div>
          <div className="text-sm text-muted-foreground">
            Pay Date: {formatDate(row.original.payDate)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'totalEmployees',
      header: 'Employees',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.original.totalEmployees}</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalGrossPay',
      header: 'Gross Pay',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.totalGrossPay)}</div>
      ),
    },
    {
      accessorKey: 'totalDeductions',
      header: 'Deductions',
      cell: ({ row }: any) => (
        <div className="font-medium text-red-600">{formatCurrency(row.original.totalDeductions)}</div>
      ),
    },
    {
      accessorKey: 'totalNetPay',
      header: 'Net Pay',
      cell: ({ row }: any) => (
        <div className="font-medium text-green-600">{formatCurrency(row.original.totalNetPay)}</div>
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
      accessorKey: 'createdBy',
      header: 'Created By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.createdBy}</div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Payroll">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('payroll') && row.original.status === 'draft' && (
            <Button variant="ghost" size="sm" title="Calculate Payroll">
              <Calculator className="h-4 w-4" />
            </Button>
          )}
          {canApprove('payroll') && row.original.status === 'calculated' && (
            <Button variant="ghost" size="sm" title="Approve Payroll">
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {canUpdate('payroll') && row.original.status === 'approved' && (
            <Button variant="ghost" size="sm" title="Send Payslips">
              <Send className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Payroll & HR Management</h1>
              <p className="text-muted-foreground">
                Manage payroll, leave management, attendance tracking, and statutory compliance
              </p>
            </div>
            {canCreate('payroll') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Payroll
              </Button>
            )}
          </div>

          {/* Payroll Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalEmployees || 156}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeEmployees || 148} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyPayroll || 285000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gross salary cost
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PAYE Tax</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.monthlyPAYE || 45000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly PAYE deduction
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RSSB Contributions</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.monthlyRSSB || 25650000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Employee + Employer
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="payroll" className="space-y-6">
            <TabsList>
              <TabsTrigger value="payroll">Payroll Runs</TabsTrigger>
              <TabsTrigger value="leave">Leave Management</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="statutory">Statutory Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="payroll" className="space-y-6">
              {/* Payroll List */}
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Runs</CardTitle>
                  <CardDescription>
                    View and manage all payroll processing runs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search payrolls..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="calculated">Calculated</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    data={payrolls}
                    loading={isLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leave" className="space-y-6">
              {/* Leave Management Summary */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting approval
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Annual Leave</CardTitle>
                    <Coffee className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">45</div>
                    <p className="text-xs text-muted-foreground">
                      Days taken this year
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
                    <Heart className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">12</div>
                    <p className="text-xs text-muted-foreground">
                      Days taken this year
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Maternity Leave</CardTitle>
                    <Plane className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <p className="text-xs text-muted-foreground">
                      Active cases
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Leave Management
                  </CardTitle>
                  <CardDescription>
                    Manage employee leave requests and balances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search leave requests..."
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        <SelectItem value="emp-001">Jean Baptiste UWIMANA</SelectItem>
                        <SelectItem value="emp-002">Marie Claire MUKAMANA</SelectItem>
                        <SelectItem value="emp-003">Paul KAGAME</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    {canCreate('payroll') && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Request
                      </Button>
                    )}
                  </div>

                  <DataTable
                    columns={leaveColumns}
                    data={mockLeaveRequests}
                    loading={leaveLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-6">
              {/* Attendance Summary */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                    <UserCheck className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">42</div>
                    <p className="text-xs text-muted-foreground">
                      Out of 45 employees
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <p className="text-xs text-muted-foreground">
                      Today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <p className="text-xs text-muted-foreground">
                      This week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <Target className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">93.3%</div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Attendance Tracking
                  </CardTitle>
                  <CardDescription>
                    Monitor employee attendance and working hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="ba">Business Administration</SelectItem>
                        <SelectItem value="eng">Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>

                  <DataTable
                    columns={attendanceColumns}
                    data={mockAttendance}
                    loading={attendanceLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statutory" className="space-y-6">
              {/* Statutory Reports Summary */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">RSSB Contributions</CardTitle>
                    <Briefcase className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(8750000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      February 2024
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">PAYE Tax</CardTitle>
                    <FileText className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(12500000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      February 2024
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Maternity Fund</CardTitle>
                    <Heart className="h-4 w-4 text-pink-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-pink-600">
                      {formatCurrency(450000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      February 2024
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Statutory Reports
                  </CardTitle>
                  <CardDescription>
                    Rwanda labor compliance and statutory reporting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current_month">Current Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="current_quarter">Current Quarter</SelectItem>
                        <SelectItem value="current_year">Current Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {canCreate('payroll') && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    )}
                  </div>

                  <DataTable
                    columns={statutoryColumns}
                    data={mockStatutoryReports}
                    loading={statutoryLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
