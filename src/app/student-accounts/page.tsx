'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, CreditCard, FileText, TrendingUp, Search, Filter, Download, Eye, Plus } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  year: number;
  semester: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  balance: number;
  totalFees: number;
  paidAmount: number;
  lastPayment: string;
  createdAt: string;
}

interface StudentStatement {
  id: string;
  studentId: string;
  type: 'fee' | 'payment' | 'adjustment' | 'penalty';
  description: string;
  amount: number;
  balance: number;
  date: string;
  reference: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export default function StudentAccountsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProgram, setSelectedProgram] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedYear, setSelectedYear] = React.useState('all');

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', { search: searchTerm, program: selectedProgram, status: selectedStatus, year: selectedYear }],
    queryFn: () => api.get<ApiResponse<Student[]>>('/v1/students', {
      search: searchTerm,
      program: selectedProgram !== 'all' ? selectedProgram : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      year: selectedYear !== 'all' ? selectedYear : undefined,
    }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['students', 'stats'],
    queryFn: () => api.get<ApiResponse<any>>('/v1/students/stats'),
  });

  const { data: programsData } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.get<ApiResponse<any[]>>('/v1/programs'),
  });

  const students = studentsData?.data || [];
  const stats = statsData?.data || {};
  const programs = programsData?.data || [];

  const columns = [
    {
      accessorKey: 'studentId',
      header: 'Student ID',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('studentId')}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'program',
      header: 'Program',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('program')}</div>
          <div className="text-sm text-muted-foreground">Year {row.original.year} - {row.original.semester}</div>
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
            status === 'graduated' ? 'secondary' :
            status === 'suspended' ? 'destructive' : 'outline'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }: any) => {
        const balance = row.getValue('balance') as number;
        return (
          <div className={`font-medium ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : ''}`}>
            {formatCurrency(Math.abs(balance))}
            {balance > 0 && ' (Due)'}
            {balance < 0 && ' (Credit)'}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalFees',
      header: 'Total Fees',
      cell: ({ row }: any) => formatCurrency(row.getValue('totalFees')),
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid',
      cell: ({ row }: any) => formatCurrency(row.getValue('paidAmount')),
    },
    {
      accessorKey: 'lastPayment',
      header: 'Last Payment',
      cell: ({ row }: any) => {
        const date = row.getValue('lastPayment');
        return date ? formatDate(date) : 'No payments';
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
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      graduated: 'outline',
      suspended: 'destructive',
    } as const;
    return variants[status as keyof typeof variants] || 'outline';
  };

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
              <h1 className="text-3xl font-bold tracking-tight">Student Accounts</h1>
              <p className="text-muted-foreground">
                Manage student billing, payments, and account statements
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.newStudentsThisMonth || 0} this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.outstandingBalance || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.studentsWithBalance || 0} students with balance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payments This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.paymentsThisMonth || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.paymentTransactions || 0} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.collectionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.collectionTrend > 0 ? '+' : ''}{stats.collectionTrend || 0}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="students" className="space-y-4">
            <TabsList>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="statements">Statements</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Accounts</CardTitle>
                  <CardDescription>
                    View and manage student account information and balances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.name}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DataTable
                    columns={columns}
                    data={students}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Statements</CardTitle>
                  <CardDescription>
                    View detailed transaction history and account statements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Input placeholder="Search by student ID or name..." className="w-64" />
                        <Button variant="outline">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Export Statements
                      </Button>
                    </div>

                    <div className="border rounded-lg">
                      <div className="p-4 border-b bg-muted/50">
                        <h3 className="font-semibold">Recent Statements</h3>
                      </div>
                      <div className="divide-y">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <div key={item} className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">STU{String(item).padStart(4, '0')} - John Doe</p>
                                <p className="text-sm text-muted-foreground">Computer Science - Year 2</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">Balance: {formatCurrency(150000 * item)}</p>
                              <p className="text-sm text-muted-foreground">Last updated: {formatDate(new Date())}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Management</CardTitle>
                  <CardDescription>
                    Process and track student payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Input placeholder="Search payments..." className="w-64" />
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Record Payment
                      </Button>
                    </div>

                    <div className="border rounded-lg">
                      <div className="p-4 border-b bg-muted/50">
                        <h3 className="font-semibold">Recent Payments</h3>
                      </div>
                      <div className="divide-y">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <div key={item} className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">Payment #{String(item).padStart(6, '0')}</p>
                                <p className="text-sm text-muted-foreground">STU{String(item).padStart(4, '0')} - John Doe</p>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{formatCurrency(50000 * item)}</p>
                              <Badge variant="default">Completed</Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
                              <p className="text-sm text-muted-foreground">Bank Transfer</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Reports</CardTitle>
                    <CardDescription>
                      Generate comprehensive financial reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Outstanding Balances Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Payment Collection Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Student Enrollment Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Fee Structure Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common tasks and operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Bulk Fee Assignment
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Student Data
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Invoices
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment Reminders
                    </Button>
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
