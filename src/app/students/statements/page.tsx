'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, Search, Filter, Download, Eye, FileText, Calendar, 
  CreditCard, Receipt, AlertTriangle, TrendingUp, DollarSign,
  Clock, CheckCircle, XCircle, User, Mail, Phone
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { usePermissions } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function StudentStatementsPage() {
  const { canRead, canCreate, canUpdate, isBursar, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStudent, setSelectedStudent] = React.useState('');
  const [selectedPeriod, setSelectedPeriod] = React.useState('current_term');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  // Check permissions
  if (!canRead('students')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view student statements.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', 'list'],
    queryFn: () => api.get('/v1/students'),
  });

  const { data: statementsData, isLoading: statementsLoading } = useQuery({
    queryKey: ['students', 'statements', { student: selectedStudent, period: selectedPeriod, status: selectedStatus }],
    queryFn: () => api.get('/v1/students/statements', {
      params: {
        student: selectedStudent || undefined,
        period: selectedPeriod,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      }
    }),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['students', 'statements-summary'],
    queryFn: () => api.get('/v1/students/statements/summary'),
  });

  const students = studentsData?.data || [];
  const statements = statementsData?.data || [];
  const summary = summaryData?.data || {};

  // Mock data for demonstration
  const mockStatements = [
    {
      id: 'stmt-001',
      studentId: 'STU-2024-001',
      studentName: 'Jean Baptiste UWIMANA',
      email: 'j.uwimana@student.ines.ac.rw',
      program: 'Computer Science',
      level: 'Year 3',
      statementDate: new Date('2024-01-15'),
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      openingBalance: 150000,
      charges: 450000,
      payments: 400000,
      closingBalance: 200000,
      status: 'outstanding',
      transactions: [
        {
          date: new Date('2024-01-01'),
          description: 'Opening Balance',
          debit: 150000,
          credit: 0,
          balance: 150000,
          type: 'opening'
        },
        {
          date: new Date('2024-01-05'),
          description: 'Tuition Fee - January 2024',
          debit: 450000,
          credit: 0,
          balance: 600000,
          type: 'charge'
        },
        {
          date: new Date('2024-01-10'),
          description: 'Payment Received - Bank Transfer',
          debit: 0,
          credit: 400000,
          balance: 200000,
          type: 'payment'
        }
      ]
    },
    {
      id: 'stmt-002',
      studentId: 'STU-2024-002',
      studentName: 'Marie Claire MUKAMANA',
      email: 'm.mukamana@student.ines.ac.rw',
      program: 'Business Administration',
      level: 'Year 2',
      statementDate: new Date('2024-01-15'),
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      openingBalance: 0,
      charges: 400000,
      payments: 400000,
      closingBalance: 0,
      status: 'paid',
      transactions: [
        {
          date: new Date('2024-01-01'),
          description: 'Opening Balance',
          debit: 0,
          credit: 0,
          balance: 0,
          type: 'opening'
        },
        {
          date: new Date('2024-01-05'),
          description: 'Tuition Fee - January 2024',
          debit: 400000,
          credit: 0,
          balance: 400000,
          type: 'charge'
        },
        {
          date: new Date('2024-01-08'),
          description: 'Payment Received - Cash',
          debit: 0,
          credit: 400000,
          balance: 0,
          type: 'payment'
        }
      ]
    }
  ];

  const statementColumns = [
    {
      accessorKey: 'studentId',
      header: 'Student ID',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.studentId}</div>
      ),
    },
    {
      accessorKey: 'studentName',
      header: 'Student Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.studentName}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'program',
      header: 'Program',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.program}</div>
          <div className="text-sm text-muted-foreground">{row.original.level}</div>
        </div>
      ),
    },
    {
      accessorKey: 'period',
      header: 'Period',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {formatDate(row.original.periodStart)} - {formatDate(row.original.periodEnd)}
        </div>
      ),
    },
    {
      accessorKey: 'closingBalance',
      header: 'Balance',
      cell: ({ row }: any) => {
        const balance = row.original.closingBalance || 0;
        return (
          <div className={`font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(Math.abs(balance))}
            {balance > 0 && <span className="text-xs ml-1">(Due)</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'paid' ? 'default' : 
                      status === 'outstanding' ? 'destructive' : 
                      status === 'partial' ? 'secondary' : 'outline';
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
          <Button variant="ghost" size="sm">
            <Mail className="h-4 w-4" />
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
              <h1 className="text-3xl font-bold tracking-tight">Student Statements</h1>
              <p className="text-muted-foreground">
                Generate and manage detailed student account statements and billing history
              </p>
            </div>
            {canCreate('students') && (
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Bulk Export
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Statement
                </Button>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Statements</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalStatements || 1518}</div>
                <p className="text-xs text-muted-foreground">
                  This academic year
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balances</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.outstandingAmount || 45000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.outstandingCount || 342} students
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid in Full</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.paidCount || 1176}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.paidPercentage || 77.5}% of students
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month Collections</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.monthlyCollections || 125000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +15.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="statements" className="space-y-6">
            <TabsList>
              <TabsTrigger value="statements">All Statements</TabsTrigger>
              <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="statements" className="space-y-6">
              {/* Filters and Search */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Statements</CardTitle>
                  <CardDescription>
                    View and manage student account statements and billing history
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
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current_term">Current Term</SelectItem>
                        <SelectItem value="last_term">Last Term</SelectItem>
                        <SelectItem value="current_year">Current Year</SelectItem>
                        <SelectItem value="last_year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="outstanding">Outstanding</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>

                  <DataTable
                    columns={statementColumns}
                    data={mockStatements}
                    loading={statementsLoading}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outstanding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Outstanding Balances
                  </CardTitle>
                  <CardDescription>
                    Students with outstanding fees requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStatements.filter(s => s.status === 'outstanding').map((statement) => (
                      <div key={statement.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-red-100 rounded-full">
                            <User className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium">{statement.studentName}</div>
                            <div className="text-sm text-muted-foreground">{statement.studentId} • {statement.program}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-red-600">{formatCurrency(statement.closingBalance)}</div>
                          <div className="text-sm text-muted-foreground">Due</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm">
                            View Statement
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Recent Statement Activity
                  </CardTitle>
                  <CardDescription>
                    Latest statement generations and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Statement generated for Marie Claire MUKAMANA</div>
                        <div className="text-sm text-muted-foreground">January 2024 statement • 2 hours ago</div>
                      </div>
                      <Badge variant="default">Generated</Badge>
                    </div>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Statement emailed to Jean Baptiste UWIMANA</div>
                        <div className="text-sm text-muted-foreground">January 2024 statement • 4 hours ago</div>
                      </div>
                      <Badge variant="secondary">Sent</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Trends</CardTitle>
                    <CardDescription>Monthly payment collection trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>Payment trend chart would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Outstanding Analysis</CardTitle>
                    <CardDescription>Aging analysis of outstanding balances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4" />
                      <p>Outstanding analysis chart would be displayed here</p>
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
