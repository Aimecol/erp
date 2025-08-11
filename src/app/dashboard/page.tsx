'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { KpiCard } from '@/components/dashcards/kpi-card';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { EnrollmentChart } from '@/components/charts/enrollment-chart';
import { ProgramDistributionChart } from '@/components/charts/program-distribution-chart';
import { PaymentStatusChart } from '@/components/charts/payment-status-chart';
import { AcademicPerformanceChart } from '@/components/charts/academic-performance-chart';
import { InventoryTrendsChart } from '@/components/charts/inventory-trends-chart';
import { RecentActivity, mockRecentActivities } from '@/components/dashcards/recent-activity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { api } from '@/lib/api';
import { usePermissions } from '@/components/auth/permission-guard';
import { formatCurrency } from '@/lib/utils';

// Mock data for comprehensive KPI dashboard
const mockEnrollmentData = [
  { month: 'Jan', newEnrollments: 45, totalEnrollments: 1180, graduations: 12 },
  { month: 'Feb', newEnrollments: 52, totalEnrollments: 1220, graduations: 8 },
  { month: 'Mar', newEnrollments: 38, totalEnrollments: 1250, graduations: 15 },
  { month: 'Apr', newEnrollments: 41, totalEnrollments: 1276, graduations: 10 },
  { month: 'May', newEnrollments: 35, totalEnrollments: 1301, graduations: 18 },
  { month: 'Jun', newEnrollments: 28, totalEnrollments: 1311, graduations: 22 },
  { month: 'Jul', newEnrollments: 62, totalEnrollments: 1351, graduations: 5 },
  { month: 'Aug', newEnrollments: 58, totalEnrollments: 1394, graduations: 7 },
  { month: 'Sep', newEnrollments: 71, totalEnrollments: 1450, graduations: 9 },
  { month: 'Oct', newEnrollments: 48, totalEnrollments: 1485, graduations: 11 },
  { month: 'Nov', newEnrollments: 33, totalEnrollments: 1506, graduations: 14 },
  { month: 'Dec', newEnrollments: 25, totalEnrollments: 1518, graduations: 28 },
];

const mockProgramDistribution = [
  { name: 'Computer Science', students: 245, percentage: 16.1 },
  { name: 'Business Administration', students: 189, percentage: 12.4 },
  { name: 'Engineering', students: 156, percentage: 10.3 },
  { name: 'Education', students: 134, percentage: 8.8 },
  { name: 'Agriculture', students: 128, percentage: 8.4 },
  { name: 'Health Sciences', students: 112, percentage: 7.4 },
  { name: 'Arts & Humanities', students: 98, percentage: 6.5 },
  { name: 'Others', students: 456, percentage: 30.1 },
];

const mockPaymentStatus = [
  { month: 'Jan', collected: 145000000, outstanding: 35000000, overdue: 12000000 },
  { month: 'Feb', collected: 152000000, outstanding: 38000000, overdue: 15000000 },
  { month: 'Mar', collected: 168000000, outstanding: 42000000, overdue: 18000000 },
  { month: 'Apr', collected: 175000000, outstanding: 45000000, overdue: 22000000 },
  { month: 'May', collected: 182000000, outstanding: 48000000, overdue: 25000000 },
  { month: 'Jun', collected: 195000000, outstanding: 52000000, overdue: 28000000 },
  { month: 'Jul', collected: 158000000, outstanding: 35000000, overdue: 15000000 },
  { month: 'Aug', collected: 165000000, outstanding: 38000000, overdue: 18000000 },
  { month: 'Sep', collected: 172000000, outstanding: 41000000, overdue: 20000000 },
  { month: 'Oct', collected: 178000000, outstanding: 44000000, overdue: 23000000 },
  { month: 'Nov', collected: 185000000, outstanding: 47000000, overdue: 26000000 },
  { month: 'Dec', collected: 192000000, outstanding: 50000000, overdue: 29000000 },
];

const mockAcademicPerformance = [
  { subject: 'Mathematics', currentSemester: 78.5, previousSemester: 75.2, target: 85.0 },
  { subject: 'Sciences', currentSemester: 82.1, previousSemester: 79.8, target: 85.0 },
  { subject: 'Languages', currentSemester: 85.3, previousSemester: 83.1, target: 85.0 },
  { subject: 'Social Studies', currentSemester: 79.7, previousSemester: 77.4, target: 85.0 },
  { subject: 'Technology', currentSemester: 81.9, previousSemester: 78.6, target: 85.0 },
  { subject: 'Arts', currentSemester: 88.2, previousSemester: 86.5, target: 85.0 },
];

const mockInventoryTrends = [
  { month: 'Jan', stockValue: 425000000, itemsReceived: 1250, itemsIssued: 980, stockLevel: 85 },
  { month: 'Feb', stockValue: 438000000, itemsReceived: 1180, itemsIssued: 1050, stockLevel: 82 },
  { month: 'Mar', stockValue: 445000000, itemsReceived: 1320, itemsIssued: 1120, stockLevel: 84 },
  { month: 'Apr', stockValue: 452000000, itemsReceived: 1280, itemsIssued: 1080, stockLevel: 86 },
  { month: 'May', stockValue: 448000000, itemsReceived: 1150, itemsIssued: 1200, stockLevel: 83 },
  { month: 'Jun', stockValue: 441000000, itemsReceived: 1080, itemsIssued: 1250, stockLevel: 81 },
  { month: 'Jul', stockValue: 455000000, itemsReceived: 1380, itemsIssued: 1100, stockLevel: 87 },
  { month: 'Aug', stockValue: 462000000, itemsReceived: 1420, itemsIssued: 1150, stockLevel: 89 },
  { month: 'Sep', stockValue: 458000000, itemsReceived: 1350, itemsIssued: 1180, stockLevel: 88 },
  { month: 'Oct', stockValue: 465000000, itemsReceived: 1400, itemsIssued: 1220, stockLevel: 87 },
  { month: 'Nov', stockValue: 470000000, itemsReceived: 1450, itemsIssued: 1280, stockLevel: 86 },
  { month: 'Dec', stockValue: 475000000, itemsReceived: 1380, itemsIssued: 1320, stockLevel: 85 },
];

const mockRevenueData = [
  { month: 'Jan', revenue: 145000000 },
  { month: 'Feb', revenue: 152000000 },
  { month: 'Mar', revenue: 168000000 },
  { month: 'Apr', revenue: 175000000 },
  { month: 'May', revenue: 182000000 },
  { month: 'Jun', revenue: 195000000 },
  { month: 'Jul', revenue: 158000000 },
  { month: 'Aug', revenue: 165000000 },
  { month: 'Sep', revenue: 172000000 },
  { month: 'Oct', revenue: 178000000 },
  { month: 'Nov', revenue: 185000000 },
  { month: 'Dec', revenue: 192000000 },
];

interface DashboardData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  orders: {
    current: number;
    previous: number;
    change: number;
  };
  customers: {
    current: number;
    previous: number;
    change: number;
  };
  students: {
    current: number;
    previous: number;
    change: number;
  };
  programs: {
    current: number;
    previous: number;
    change: number;
  };
  inventory: {
    current: number;
    previous: number;
    change: number;
  };
  outstandingFees: number;
  feesChange: number;
  collections: number;
  collectionsChange: number;
  academicAverage: number;
  academicChange: number;
  newEnrollments: number;
  enrollmentChange: number;
  graduationRate: number;
  graduationChange: number;
  collectionRate: number;
  collectionRateChange: number;
  stockTurnover: number;
  turnoverChange: number;
  courseCompletion: number;
  completionChange: number;
  facultyRatio: number;
  ratioChange: number;
  revenueChart: Array<{
    month: string;
    revenue: number;
  }>;
  enrollmentChart: Array<{
    month: string;
    newEnrollments: number;
    totalEnrollments: number;
    graduations: number;
  }>;
  programDistribution: Array<{
    name: string;
    students: number;
    percentage: number;
  }>;
  paymentStatus: Array<{
    month: string;
    collected: number;
    outstanding: number;
    overdue: number;
  }>;
  academicPerformance: Array<{
    subject: string;
    currentSemester: number;
    previousSemester: number;
    target: number;
  }>;
  inventoryTrends: Array<{
    month: string;
    stockValue: number;
    itemsReceived: number;
    itemsIssued: number;
    stockLevel: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  topPrograms: Array<{
    name: string;
    enrollment: number;
    revenue: number;
  }>;
  lowStockItems: Array<{
    name: string;
    current: number;
    minimum: number;
  }>;
}

export default function DashboardPage() {
  const { isAdmin, isBursar, isStoreManager, isAuditor } = usePermissions();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => api.get<DashboardData>('/v1/dashboard/kpis'),
  });

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">INES-Ruhengeri Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening at the institution today.
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">New Applications</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Fee Payments</span>
                <Badge variant="secondary">{formatCurrency(8500000)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Library Visits</span>
                <Badge variant="secondary">156</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Graduations</span>
                <Badge variant="secondary">28</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New Courses</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Faculty Meetings</span>
                <Badge variant="secondary">8</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Exam Period</span>
                <Badge variant="outline">Jan 15-30</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Registration</span>
                <Badge variant="outline">Feb 1-14</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Semester Start</span>
                <Badge variant="outline">Feb 20</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Students"
          value={dashboardData?.students?.current || 1518}
          change={dashboardData?.students?.change || 5.2}
          icon={<Users className="h-4 w-4" />}
          loading={isLoading}
        />

        <KpiCard
          title="Active Programs"
          value={dashboardData?.programs?.current || 24}
          change={dashboardData?.programs?.change || 2.1}
          icon={<GraduationCap className="h-4 w-4" />}
          loading={isLoading}
        />

        {(isBursar || isAdmin) && (
          <KpiCard
            title="Outstanding Fees"
            value={dashboardData?.outstandingFees || 45000000}
            change={dashboardData?.feesChange || -12.5}
            format="currency"
            currency="RWF"
            icon={<AlertTriangle className="h-4 w-4" />}
            loading={isLoading}
          />
        )}

        {(isBursar || isAdmin) && (
          <KpiCard
            title="Term Collections"
            value={dashboardData?.collections || 192000000}
            change={dashboardData?.collectionsChange || 8.3}
            format="currency"
            currency="RWF"
            icon={<DollarSign className="h-4 w-4" />}
            loading={isLoading}
          />
        )}

        {(isStoreManager || isAdmin) && (
          <KpiCard
            title="Inventory Health"
            value={dashboardData?.inventory?.current || 85}
            change={dashboardData?.inventory?.change || 2.1}
            format="percentage"
            icon={<Package className="h-4 w-4" />}
            loading={isLoading}
          />
        )}

        {!(isBursar || isAdmin) && !isStoreManager && (
          <KpiCard
            title="Academic Performance"
            value={dashboardData?.academicAverage || 82.1}
            change={dashboardData?.academicChange || 3.2}
            format="percentage"
            icon={<BookOpen className="h-4 w-4" />}
            loading={isLoading}
          />
        )}
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="New Enrollments"
          value={dashboardData?.newEnrollments || 25}
          change={dashboardData?.enrollmentChange || -24.2}
          icon={<Calendar className="h-4 w-4" />}
          loading={isLoading}
        />

        <KpiCard
          title="Graduation Rate"
          value={dashboardData?.graduationRate || 94.5}
          change={dashboardData?.graduationChange || 1.8}
          format="percentage"
          icon={<TrendingUp className="h-4 w-4" />}
          loading={isLoading}
        />

        {(isBursar || isAdmin) && (
          <KpiCard
            title="Collection Rate"
            value={dashboardData?.collectionRate || 81.2}
            change={dashboardData?.collectionRateChange || 4.1}
            format="percentage"
            icon={<BarChart3 className="h-4 w-4" />}
            loading={isLoading}
          />
        )}

        {(isStoreManager || isAdmin) && (
          <KpiCard
            title="Stock Turnover"
            value={dashboardData?.stockTurnover || 6.8}
            change={dashboardData?.turnoverChange || 0.5}
            icon={<Activity className="h-4 w-4" />}
            loading={isLoading}
          />
        )}

        {!(isBursar || isAdmin) && !isStoreManager && (
          <KpiCard
            title="Course Completion"
            value={dashboardData?.courseCompletion || 89.3}
            change={dashboardData?.completionChange || 2.7}
            format="percentage"
            icon={<PieChart className="h-4 w-4" />}
            loading={isLoading}
          />
        )}

        {!(isBursar || isAdmin) && !isStoreManager && (
          <KpiCard
            title="Faculty Ratio"
            value={dashboardData?.facultyRatio || 18.5}
            change={dashboardData?.ratioChange || -0.8}
            icon={<Users className="h-4 w-4" />}
            loading={isLoading}
          />
        )}
      </div>

      {/* Primary Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        {(isBursar || isAdmin) && (
          <RevenueChart
            data={dashboardData?.revenueChart || mockRevenueData}
            loading={isLoading}
          />
        )}

        {/* Student Enrollment Trends */}
        <EnrollmentChart
          data={dashboardData?.enrollmentChart || mockEnrollmentData}
          loading={isLoading}
        />
      </div>

      {/* Secondary Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Program Distribution */}
        <ProgramDistributionChart
          data={dashboardData?.programDistribution || mockProgramDistribution}
          loading={isLoading}
        />

        {/* Payment Status Overview */}
        {(isBursar || isAdmin) && (
          <PaymentStatusChart
            data={dashboardData?.paymentStatus || mockPaymentStatus}
            loading={isLoading}
          />
        )}

        {/* Academic Performance for non-financial users */}
        {!(isBursar || isAdmin) && (
          <AcademicPerformanceChart
            data={dashboardData?.academicPerformance || mockAcademicPerformance}
            loading={isLoading}
          />
        )}
      </div>

      {/* Tertiary Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Academic Performance for financial users */}
        {(isBursar || isAdmin) && (
          <AcademicPerformanceChart
            data={dashboardData?.academicPerformance || mockAcademicPerformance}
            loading={isLoading}
          />
        )}

        {/* Inventory Trends */}
        {(isStoreManager || isAdmin) && (
          <InventoryTrendsChart
            data={dashboardData?.inventoryTrends || mockInventoryTrends}
            loading={isLoading}
          />
        )}

        {/* Top Academic Programs */}
        {(isAdmin || isBursar) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Academic Programs
              </CardTitle>
              <CardDescription>
                Programs with highest enrollment this semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(dashboardData?.topPrograms || [
                    { name: "Computer Science", enrollment: 245, revenue: 450000000 },
                    { name: "Business Administration", enrollment: 189, revenue: 340000000 },
                    { name: "Engineering", enrollment: 156, revenue: 280000000 }
                  ]).map((program: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{program.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {program.enrollment} students enrolled
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(program.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity
            activities={mockRecentActivities}
            loading={isLoading}
          />
        </div>

        {/* Low Stock Alerts */}
        {(isStoreManager || isAdmin) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>
                Items below minimum stock level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : dashboardData?.lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All items are adequately stocked
                </p>
              ) : (
                <div className="space-y-3">
                  {dashboardData?.lowStockItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.current} | Min: {item.minimum}
                        </p>
                      </div>
                      <Badge variant="warning">
                        Low Stock
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
