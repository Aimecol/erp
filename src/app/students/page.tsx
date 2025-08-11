'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Receipt, CreditCard, AlertTriangle } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { usePermissions } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { api } from '@/lib/api';
import { Student, StudentBilling } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function StudentsPage() {
  const { canRead, canCreate, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProgram, setSelectedProgram] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Check permissions
  if (!canRead('students')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view student accounts.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', 'list', { search: searchTerm, program: selectedProgram, status: selectedStatus }],
    queryFn: () => api.get('/v1/students', {
      params: {
        search: searchTerm,
        program: selectedProgram !== 'all' ? selectedProgram : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['students', 'dashboard-stats'],
    queryFn: () => api.get('/v1/students/dashboard-stats'),
  });

  const students = studentsData?.data || [];
  const stats = dashboardStats?.data || {};

  const columns = [
    {
      accessorKey: 'studentId',
      header: 'Student ID',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.studentId}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.firstName} {row.original.lastName}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'program',
      header: 'Program',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.program?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.level} - {row.original.academicYear}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'active' ? 'default' : 
                      status === 'graduated' ? 'secondary' : 
                      status === 'suspended' ? 'destructive' : 'outline';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }: any) => {
        const balance = row.original.currentBalance || 0;
        return (
          <div className={`font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(Math.abs(balance))}
            {balance > 0 && <span className="text-xs ml-1">(Due)</span>}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Receipt className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <CreditCard className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Student Accounts</h1>
              <p className="text-muted-foreground">
                Manage student billing, payments, and account statements
              </p>
            </div>
            {canCreate('students') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            )}
          </div>

          {/* Dashboard Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeStudents || 0} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.outstandingFees || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.studentsWithBalance || 0} students
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Term Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.termCollections || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.collectionPercentage || 0}% of target
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Accounts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdueAccounts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.overdueAmount || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
              <CardDescription>
                View and manage all student accounts and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={students}
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
