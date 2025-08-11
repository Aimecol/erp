'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Eye, Edit, Users, UserCheck, UserX, Building } from 'lucide-react';
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
import { Employee } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function EmployeesPage() {
  const { canRead, canCreate, canUpdate, isAdmin, isHR } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedDepartment, setSelectedDepartment] = React.useState('all');
  const [selectedEmploymentType, setSelectedEmploymentType] = React.useState('all');

  // Check permissions
  if (!canRead('payroll')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view employees.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ['payroll', 'employees', { 
      search: searchTerm, 
      status: selectedStatus, 
      department: selectedDepartment,
      employmentType: selectedEmploymentType 
    }],
    queryFn: () => api.get('/v1/payroll/employees', {
      params: {
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
        employmentType: selectedEmploymentType !== 'all' ? selectedEmploymentType : undefined,
      }
    }),
  });

  const { data: employeeStats } = useQuery({
    queryKey: ['payroll', 'employee-stats'],
    queryFn: () => api.get('/v1/payroll/employees/stats'),
  });

  const employees = employeesData?.data || [];
  const stats = employeeStats?.data || {};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      inactive: 'secondary',
      terminated: 'destructive',
      suspended: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getEmploymentTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      permanent: 'default',
      contract: 'secondary',
      temporary: 'outline',
      intern: 'destructive'
    };
    return variants[type] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'inactive':
      case 'suspended':
      case 'terminated':
        return <UserX className="h-4 w-4 text-red-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'employeeNumber',
      header: 'Employee #',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.employeeNumber}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.department?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.position?.title}</div>
        </div>
      ),
    },
    {
      accessorKey: 'employmentType',
      header: 'Employment Type',
      cell: ({ row }: any) => (
        <Badge variant={getEmploymentTypeBadge(row.original.employmentType)}>
          {row.original.employmentType.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.startDate)}</div>
      ),
    },
    {
      accessorKey: 'basicSalary',
      header: 'Basic Salary',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.salary?.basicSalary || 0)}</div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.phone}</div>
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
          <Button variant="ghost" size="sm" title="View Employee">
            <Eye className="h-4 w-4" />
          </Button>
          {canUpdate('payroll') && (
            <Button variant="ghost" size="sm" title="Edit Employee">
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
              <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
              <p className="text-muted-foreground">
                Manage employee information, contracts, and employment details
              </p>
            </div>
            {canCreate('payroll') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            )}
          </div>

          {/* Employee Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalEmployees || 156}</div>
                <p className="text-xs text-muted-foreground">
                  All employees
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeEmployees || 148}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.activeEmployees || 148) / (stats.totalEmployees || 156) * 100).toFixed(0)}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Permanent Staff</CardTitle>
                <Building className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.permanentEmployees || 125}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.permanentEmployees || 125) / (stats.totalEmployees || 156) * 100).toFixed(0)}% permanent
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                <Building className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.averageSalary || 1925000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly basic salary
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Employees List */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                View and manage all employee information and contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
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
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="it">IT Services</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedEmploymentType} onValueChange={setSelectedEmploymentType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Employment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
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
                    <SelectItem value="terminated">Terminated</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={employees}
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
