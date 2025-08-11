'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, CreditCard, Users, BarChart3, Settings, Menu, Search, Smartphone } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { usePermissions } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function MobileDashboardPage() {
  const { canRead, userRole, isAdmin, isBursar, isStoreManager } = usePermissions();
  const [notifications, setNotifications] = React.useState([]);

  const { data: mobileStats } = useQuery({
    queryKey: ['mobile', 'dashboard-stats'],
    queryFn: () => api.get('/v1/mobile/dashboard-stats'),
  });

  const { data: recentActivities } = useQuery({
    queryKey: ['mobile', 'recent-activities'],
    queryFn: () => api.get('/v1/mobile/recent-activities'),
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ['mobile', 'pending-approvals'],
    queryFn: () => api.get('/v1/mobile/pending-approvals'),
  });

  const stats = mobileStats?.data || {};
  const activities = recentActivities?.data || [];
  const approvals = pendingApprovals?.data || [];

  const quickActions = [
    {
      title: 'Student Payments',
      description: 'View and process student fee payments',
      icon: CreditCard,
      href: '/students/billing',
      color: 'text-blue-500',
      permission: 'students',
    },
    {
      title: 'Payroll',
      description: 'Access payroll and salary information',
      icon: Users,
      href: '/payroll',
      color: 'text-green-500',
      permission: 'payroll',
    },
    {
      title: 'Financial Reports',
      description: 'View financial dashboards and reports',
      icon: BarChart3,
      href: '/reports/dashboard',
      color: 'text-purple-500',
      permission: 'reports',
    },
    {
      title: 'System Admin',
      description: 'System administration and settings',
      icon: Settings,
      href: '/admin',
      color: 'text-red-500',
      permission: 'admin',
    },
  ];

  const filteredQuickActions = quickActions.filter(action => 
    canRead(action.permission)
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-lg font-semibold">INES Mobile</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                    <SheetDescription>
                      Quick access to all modules
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    {filteredQuickActions.map((action) => (
                      <Button
                        key={action.title}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => window.location.href = action.href}
                      >
                        <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
                        {action.title}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4 space-y-4">
          {/* Welcome Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold">Welcome back!</h2>
                  <p className="text-sm text-muted-foreground">
                    Role: {userRole} • {formatDate(new Date())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.totalRevenue || 2850000000)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.activeStudents || 1245}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Students</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats.pendingPayments || 125000000)}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Payments</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.employeeCount || 89}
                  </div>
                  <div className="text-sm text-muted-foreground">Employees</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-3">
                {filteredQuickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => window.location.href = action.href}
                  >
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          {approvals.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pending Approvals</CardTitle>
                <CardDescription>
                  Items requiring your attention
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {approvals.slice(0, 3).map((approval: any) => (
                    <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{approval.title}</div>
                        <div className="text-xs text-muted-foreground">{approval.description}</div>
                      </div>
                      <Badge variant="secondary">{approval.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{activity.title}</div>
                      <div className="text-xs text-muted-foreground">{activity.description}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mobile App Download */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Download Mobile App</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the INES mobile app for better experience
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    App Store
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Play Store
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
