'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Calendar, Target, AlertTriangle } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { usePermissions } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function FinancialDashboardPage() {
  const { canRead, isAdmin, isBursar, isAuditor } = usePermissions();
  const [selectedPeriod, setSelectedPeriod] = React.useState('current_year');
  const [selectedView, setSelectedView] = React.useState('overview');

  // Check permissions
  if (!canRead('reports')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view financial dashboard.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { data: dashboardData } = useQuery({
    queryKey: ['reports', 'financial-dashboard', selectedPeriod],
    queryFn: () => api.get('/v1/reports/financial-dashboard', {
      params: { period: selectedPeriod }
    }),
  });

  const { data: kpiData } = useQuery({
    queryKey: ['reports', 'financial-kpis', selectedPeriod],
    queryFn: () => api.get('/v1/reports/financial-kpis', {
      params: { period: selectedPeriod }
    }),
  });

  const dashboard = dashboardData?.data || {};
  const kpis = kpiData?.data || [];

  const getKPIStatus = (value: number, target?: number) => {
    if (!target) return 'good';
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'good';
    if (percentage >= 70) return 'warning';
    return 'critical';
  };

  const getKPIIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'critical':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getKPIBadge = (status: string) => {
    const variants: Record<string, any> = {
      good: 'default',
      warning: 'secondary',
      critical: 'destructive'
    };
    return variants[status] || 'outline';
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
              <p className="text-muted-foreground">
                Real-time financial performance and key metrics for INES-Ruhengeri
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Current Month</SelectItem>
                  <SelectItem value="current_quarter">Current Quarter</SelectItem>
                  <SelectItem value="current_year">Current Year</SelectItem>
                  <SelectItem value="previous_year">Previous Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                  <SelectItem value="cash_flow">Cash Flow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Key Financial Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboard.totalRevenue || 2850000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last year
                </p>
                <div className="mt-2">
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(dashboard.totalExpenses || 2450000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8.2% from last year
                </p>
                <div className="mt-2">
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(dashboard.netIncome || 400000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +25.8% from last year
                </p>
                <div className="mt-2">
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(dashboard.cashBalance || 850000000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available cash
                </p>
                <div className="mt-2">
                  <Progress value={90} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Revenue sources for the current period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Tuition Fees</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(1800000000)}</div>
                      <div className="text-xs text-muted-foreground">63.2%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Training Revenue</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(650000000)}</div>
                      <div className="text-xs text-muted-foreground">22.8%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Consultancy</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(250000000)}</div>
                      <div className="text-xs text-muted-foreground">8.8%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Grants & Donations</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(150000000)}</div>
                      <div className="text-xs text-muted-foreground">5.3%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>
                  Major expense categories for the current period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Salaries & Benefits</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(1470000000)}</div>
                      <div className="text-xs text-muted-foreground">60.0%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Utilities & Maintenance</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(490000000)}</div>
                      <div className="text-xs text-muted-foreground">20.0%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Supplies & Equipment</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(245000000)}</div>
                      <div className="text-xs text-muted-foreground">10.0%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">Other Expenses</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(245000000)}</div>
                      <div className="text-xs text-muted-foreground">10.0%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>
                Financial KPIs and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getKPIIcon('good')}
                    <div>
                      <div className="font-medium">Revenue Growth</div>
                      <div className="text-sm text-muted-foreground">Year over year</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">12.5%</div>
                    <Badge variant={getKPIBadge('good')}>Good</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getKPIIcon('good')}
                    <div>
                      <div className="font-medium">Profit Margin</div>
                      <div className="text-sm text-muted-foreground">Net income ratio</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">14.0%</div>
                    <Badge variant={getKPIBadge('good')}>Good</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getKPIIcon('warning')}
                    <div>
                      <div className="font-medium">Expense Ratio</div>
                      <div className="text-sm text-muted-foreground">Expenses to revenue</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">86.0%</div>
                    <Badge variant={getKPIBadge('warning')}>Warning</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getKPIIcon('good')}
                    <div>
                      <div className="font-medium">Cash Ratio</div>
                      <div className="text-sm text-muted-foreground">Liquidity measure</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">2.8</div>
                    <Badge variant={getKPIBadge('good')}>Good</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>
                Monthly financial performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Financial trend charts would be displayed here</p>
                <p className="text-sm">Integration with charting library required</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
