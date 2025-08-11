'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Factory,
  UserCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  CreditCard,
  Receipt,
  FileText,
  Truck,
  ArrowRightLeft,
  AlertTriangle,
  Send,
  CheckCircle,
  Shield,
  Lock,
  Activity,
  Database,
  Smartphone,
  Bell,
  MessageSquare,
  PieChart,
  Clock,
  Download,
  Target,
  TrendingUp,
  TrendingDown,
  Building,
  Wrench,
  Trash2,
  Search,
  Zap,
  Calculator,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/auth/permission-guard';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  resource?: string;
  action?: string;
  role?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Student Accounts',
    href: '/students',
    icon: Users,
    resource: 'students',
    action: 'read',
    children: [
      { title: 'Students', href: '/students', icon: Users },
      { title: 'Billing', href: '/students/billing', icon: FileText },
      { title: 'Payments', href: '/students/payments', icon: CreditCard },
      { title: 'Statements', href: '/students/statements', icon: Receipt },
    ],
  },
  {
    title: 'Project Accounts',
    href: '/projects',
    icon: BarChart3,
    resource: 'projects',
    action: 'read',
    children: [
      { title: 'Projects', href: '/projects', icon: BarChart3 },
      { title: 'Expenses', href: '/projects/expenses', icon: DollarSign },
      { title: 'Disbursements', href: '/projects/disbursements', icon: CreditCard },
      { title: 'Reports', href: '/projects/reports', icon: FileText },
    ],
  },
  {
    title: 'Utilities & Special',
    href: '/utilities',
    icon: Settings,
    resource: 'utilities',
    action: 'read',
    children: [
      { title: 'Utility Bills', href: '/utilities', icon: Settings },
      { title: 'Recurring Payments', href: '/utilities/recurring', icon: CreditCard },
      { title: 'Departmental Expenses', href: '/utilities/departments', icon: DollarSign },
      { title: 'Vendor Invoices', href: '/utilities/vendors', icon: FileText },
    ],
  },
  {
    title: 'Double Entry Accounting',
    href: '/accounting',
    icon: BarChart3,
    resource: 'accounting',
    action: 'read',
    children: [
      { title: 'Chart of Accounts', href: '/accounting/chart-of-accounts', icon: BarChart3 },
      { title: 'Journal Entries', href: '/accounting/journal-entries', icon: FileText },
      { title: 'Trial Balance', href: '/accounting/trial-balance', icon: BarChart3 },
      { title: 'General Ledger', href: '/accounting/general-ledger', icon: FileText },
      { title: 'Period Closing', href: '/accounting/period-closing', icon: Settings },
    ],
  },
  {
    title: 'Payables & Receivables',
    href: '/payables',
    icon: DollarSign,
    resource: 'payables',
    action: 'read',
    children: [
      { title: 'Accounts Payable', href: '/payables', icon: DollarSign },
      { title: 'Vendor Payments', href: '/payables/payments', icon: CreditCard },
      { title: 'Accounts Receivable', href: '/receivables', icon: Receipt },
      { title: 'Customer Payments', href: '/receivables/payments', icon: CreditCard },
      { title: 'Ageing Analysis', href: '/payables/ageing', icon: BarChart3 },
    ],
  },
  {
    title: 'Billing & Invoicing (RRA)',
    href: '/invoicing',
    icon: Receipt,
    resource: 'invoicing',
    action: 'read',
    children: [
      { title: 'Invoices', href: '/invoicing', icon: Receipt },
      { title: 'Receipts', href: '/invoicing/receipts', icon: FileText },
      { title: 'RRA Compliance', href: '/invoicing/rra-compliance', icon: CheckCircle },
      { title: 'VAT Returns', href: '/invoicing/vat-returns', icon: BarChart3 },
      { title: 'Tax Configuration', href: '/invoicing/tax-config', icon: Settings },
    ],
  },
  {
    title: 'Payroll & Salaries',
    href: '/payroll',
    icon: Users,
    resource: 'payroll',
    action: 'read',
    children: [
      { title: 'Payroll Runs', href: '/payroll', icon: Calculator },
      { title: 'Employees', href: '/payroll/employees', icon: Users },
      { title: 'Payslips', href: '/payroll/payslips', icon: FileText },
      { title: 'Leave Management', href: '/payroll/leave', icon: Calendar },
      { title: 'Attendance', href: '/payroll/attendance', icon: Clock },
      { title: 'Statutory Reports', href: '/payroll/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Procurement & Supply Chain',
    href: '/procurement',
    icon: ShoppingCart,
    resource: 'procurement',
    action: 'read',
    children: [
      { title: 'Purchase Requests', href: '/procurement', icon: ShoppingCart },
      { title: 'Purchase Orders', href: '/procurement/purchase-orders', icon: FileText },
      { title: 'Vendor Management', href: '/procurement/vendors', icon: Building },
      { title: 'RFQ & Quotations', href: '/procurement/rfq', icon: FileText },
      { title: 'Budget Tracking', href: '/procurement/budget', icon: BarChart3 },
      { title: 'Procurement Reports', href: '/procurement/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Fixed Assets & Asset Management',
    href: '/assets',
    icon: Building,
    resource: 'assets',
    action: 'read',
    children: [
      { title: 'Asset Register', href: '/assets', icon: Building },
      { title: 'Asset Maintenance', href: '/assets/maintenance', icon: Wrench },
      { title: 'Depreciation', href: '/assets/depreciation', icon: TrendingDown },
      { title: 'Asset Disposal', href: '/assets/disposal', icon: Trash2 },
      { title: 'Asset Audit', href: '/assets/audit', icon: Search },
      { title: 'Asset Reports', href: '/assets/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Comprehensive Financial Reporting',
    href: '/reports',
    icon: BarChart3,
    resource: 'reports',
    action: 'read',
    children: [
      { title: 'Financial Reports', href: '/reports', icon: FileText },
      { title: 'Financial Dashboard', href: '/reports/dashboard', icon: BarChart3 },
      { title: 'Income Statement', href: '/reports/income-statement', icon: TrendingUp },
      { title: 'Balance Sheet', href: '/reports/balance-sheet', icon: BarChart3 },
      { title: 'Cash Flow Statement', href: '/reports/cash-flow', icon: DollarSign },
      { title: 'Budget Variance', href: '/reports/budget-variance', icon: Target },
    ],
  },
  {
    title: 'Advanced Reporting & Analytics',
    href: '/analytics',
    icon: BarChart3,
    resource: 'analytics',
    action: 'read',
    children: [
      { title: 'Custom Reports', href: '/analytics', icon: FileText },
      { title: 'Analytics Dashboards', href: '/analytics/dashboards', icon: BarChart3 },
      { title: 'Data Visualizations', href: '/analytics/visualizations', icon: PieChart },
      { title: 'Report Builder', href: '/analytics/builder', icon: Settings },
      { title: 'Data Exports', href: '/analytics/exports', icon: Download },
      { title: 'Scheduled Reports', href: '/analytics/scheduled', icon: Clock },
    ],
  },
  {
    title: 'Mobile & Notifications',
    href: '/mobile',
    icon: Smartphone,
    resource: 'mobile',
    action: 'read',
    children: [
      { title: 'Mobile Dashboard', href: '/mobile', icon: Smartphone },
      { title: 'Notifications', href: '/notifications', icon: Bell },
      { title: 'SMS Alerts', href: '/notifications/sms', icon: MessageSquare },
      { title: 'Push Notifications', href: '/notifications/push', icon: Bell },
      { title: 'Mobile App Settings', href: '/mobile/settings', icon: Settings },
    ],
  },
  {
    title: 'External Integrations',
    href: '/integrations',
    icon: Zap,
    resource: 'integrations',
    action: 'read',
    children: [
      { title: 'All Integrations', href: '/integrations', icon: Zap },
      { title: 'RRA Integration', href: '/integrations/rra', icon: FileText },
      { title: 'Banking & Payments', href: '/integrations/banking', icon: CreditCard },
      { title: 'SMS Gateway', href: '/integrations/sms', icon: MessageSquare },
      { title: 'API Management', href: '/integrations/api', icon: Settings },
    ],
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
    resource: 'sales',
    action: 'read',
    children: [
      { title: 'Sales Orders', href: '/sales/orders', icon: ShoppingCart },
      { title: 'Quotations', href: '/sales/quotations', icon: ShoppingCart },
      { title: 'Deliveries', href: '/sales/deliveries', icon: ShoppingCart },
      { title: 'Customers', href: '/sales/customers', icon: Users },
    ],
  },
  {
    title: 'Purchasing',
    href: '/purchasing',
    icon: Package,
    resource: 'purchasing',
    action: 'read',
    children: [
      { title: 'Purchase Orders', href: '/purchasing/orders', icon: Package },
      { title: 'Requisitions', href: '/purchasing/requisitions', icon: Package },
      { title: 'Suppliers', href: '/purchasing/suppliers', icon: Users },
    ],
  },
  {
    title: 'Stores & Inventory',
    href: '/inventory',
    icon: Package,
    resource: 'inventory',
    action: 'read',
    children: [
      { title: 'Inventory Items', href: '/inventory', icon: Package },
      { title: 'Goods Receipts', href: '/inventory/receipts', icon: Truck },
      { title: 'Goods Issues', href: '/inventory/issues', icon: Send },
      { title: 'Stock Transfers', href: '/inventory/transfers', icon: ArrowRightLeft },
      { title: 'Alerts & Notifications', href: '/inventory/alerts', icon: AlertTriangle },
    ],
  },
  {
    title: 'Production',
    href: '/production',
    icon: Factory,
    resource: 'production',
    action: 'read',
    children: [
      { title: 'Production Orders', href: '/production/orders', icon: Factory },
      { title: 'Bill of Materials', href: '/production/bom', icon: Factory },
      { title: 'MRP', href: '/production/mrp', icon: Factory },
    ],
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: DollarSign,
    resource: 'finance',
    action: 'read',
    children: [
      { title: 'Chart of Accounts', href: '/finance/accounts', icon: DollarSign },
      { title: 'Journal Entries', href: '/finance/journal', icon: DollarSign },
      { title: 'AR/AP', href: '/finance/arap', icon: DollarSign },
      { title: 'Bank Reconciliation', href: '/finance/bank', icon: DollarSign },
    ],
  },
  {
    title: 'CRM',
    href: '/crm',
    icon: UserCheck,
    resource: 'crm',
    action: 'read',
    children: [
      { title: 'Business Partners', href: '/crm/partners', icon: Users },
      { title: 'Activities', href: '/crm/activities', icon: UserCheck },
      { title: 'Opportunities', href: '/crm/opportunities', icon: UserCheck },
    ],
  },
  {
    title: 'System Administration',
    href: '/administration',
    icon: Shield,
    resource: 'admin',
    action: 'read',
    children: [
      { title: 'User Management', href: '/administration/users', icon: Users },
      { title: 'Roles & Permissions', href: '/administration/roles', icon: Shield },
      { title: 'System Configuration', href: '/administration/config', icon: Settings },
      { title: 'System Health', href: '/administration/health', icon: Activity },
      { title: 'Security & Audit', href: '/administration/security', icon: Lock },
      { title: 'Backup & Recovery', href: '/administration/backup', icon: Database },
    ],
  },
];

export function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const active = isActive(item.href);

    const navContent = (
      <div className="w-full">
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
            active && 'bg-accent text-accent-foreground',
            level > 0 && 'ml-4',
            collapsed && level === 0 && 'justify-center px-2'
          )}
        >
          <item.icon className={cn('h-4 w-4', collapsed && 'h-5 w-5')} />
          {!collapsed && (
            <>
              <span className="flex-1">{item.title}</span>
              {hasChildren && (
                <ChevronRight 
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
              )}
            </>
          )}
        </div>
        
        {!collapsed && hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child, childIndex) => (
              <div key={`child-${childIndex}-${child.href}`}>
                {renderNavItem(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    if (hasChildren && !collapsed) {
      return (
        <button
          key={item.href}
          onClick={() => toggleExpanded(item.href)}
          className="w-full text-left"
        >
          {navContent}
        </button>
      );
    }

    return (
      <Link key={item.href} href={item.href}>
        {navContent}
      </Link>
    );
  };

  return (
    <div className={cn(
      'flex h-full flex-col border-r bg-background',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header - Fixed */}
      <div className="flex h-16 items-center border-b px-4 flex-shrink-0">
        {!collapsed && (
          <h2 className="text-lg font-semibold">ERP System</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn('ml-auto', collapsed && 'mx-auto')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 sidebar-nav">
        <div className="space-y-1 p-2 pb-4">
          {navigationItems.map((item, index) => (
            <PermissionGuard
              key={`nav-${index}-${item.href}`}
              resource={item.resource}
              action={item.action}
              role={item.role}
            >
              {renderNavItem(item)}
            </PermissionGuard>
          ))}
        </div>
      </nav>

      {/* Footer - Fixed */}
      {!collapsed && (
        <div className="border-t p-4 flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            ERP System v2.0.0
          </p>
        </div>
      )}
    </div>
  );
}
