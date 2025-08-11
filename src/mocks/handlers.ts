import { http, HttpResponse } from 'msw';
import { mockUsers, mockCredentials } from './data/users';
import {
  mockBusinessPartners,
  mockItems,
  mockSalesOrders,
  mockPurchaseOrders,
  mockDashboardData,
  mockWarehouses
} from './data/business-data';
import {
  mockStudents,
  mockStudentBilling,
  mockStudentPayments,
  mockStudentDashboardStats,
  mockBillingStats,
  mockPaymentStats
} from './data/student-data';
import {
  mockProjects,
  mockProjectExpenses,
  mockProjectDashboardStats,
  mockProjectExpenseStats
} from './data/project-data';
import {
  mockUtilityBills,
  mockRecurringPayments,
  mockUtilityDashboardStats,
  mockRecurringStats
} from './data/utility-data';
import {
  mockEnhancedItems,
  mockGoodsReceiptNotes,
  mockGoodsIssueNotes,
  mockStockTransfers,
  mockReorderAlerts,
  mockExpiryAlerts,
  mockInventoryDashboardStats,
  mockReceiptStats,
  mockIssueStats,
  mockTransferStats,
  mockAlertStats
} from './data/inventory-data';
import {
  mockChartOfAccounts,
  mockJournalEntries,
  mockTrialBalance,
  mockAccountingDashboardStats,
  mockJournalEntryStats,
  mockTrialBalanceStats
} from './data/accounting-data';
import {
  mockAccountsPayable,
  mockAccountsReceivable,
  mockVendorPayments,
  mockCustomerPayments,
  mockPayablesDashboardStats,
  mockReceivablesDashboardStats,
  mockVendorPaymentStats,
  mockCustomerPaymentStats
} from './data/payables-receivables-data';
import {
  mockInvoices,
  mockReceipts,
  mockRRACompliance,
  mockVATReturns,
  mockInvoicingDashboardStats,
  mockRRAComplianceStats,
  mockReceiptStats as mockInvoicingReceiptStats
} from './data/invoicing-data';
import {
  mockEmployees,
  mockDepartments,
  mockPositions,
  mockPayrolls,
  mockPayslips,
  mockLeaveTypes,
  mockPayrollDashboardStats,
  mockEmployeeStats,
  mockPayslipStats
} from './data/payroll-data';
import {
  mockPurchaseRequests,
  mockPurchaseOrders as mockProcurementPurchaseOrders,
  mockVendors,
  mockBudgetComparisons,
  mockProcurementDashboardStats,
  mockPurchaseOrderStats,
  mockVendorStats
} from './data/procurement-data';
import {
  mockFixedAssets,
  mockAssetCategories,
  mockAssetLocations,
  mockAssetMaintenance,
  mockDepreciationEntries,
  mockAssetsDashboardStats,
  mockMaintenanceStats,
  mockDepreciationStats
} from './data/assets-data';
import {
  mockFinancialReports,
  mockFinancialKPIs,
  mockFinancialDashboard,
  mockReportsDashboardStats
} from './data/financial-reports-data';
import {
  mockCustomReports,
  mockAnalyticsDashboards,
  mockAnalyticsMetrics,
  mockAnalyticsDashboardStats
} from './data/analytics-data';
import {
  mockSystemUsers,
  mockUserRoles,
  mockPermissions,
  mockSystemHealth,
  mockSystemConfiguration,
  mockAdminDashboardStats
} from './data/admin-data';
import {
  mockMobileDashboardStats,
  mockRecentActivities,
  mockPendingApprovals,
  mockNotifications,
  mockSMSTemplates,
  mockNotificationStats,
  mockMobileAppFeatures
} from './data/mobile-data';
import {
  mockIntegrations,
  mockSyncLogs,
  mockIntegrationStats,
  mockRRAIntegration,
  mockBankingIntegrations
} from './data/integrations-data';
import {
  mockAuditLogs,
  mockLoginLogs,
  mockSecurityStats,
  mockSecuritySettings,
  mockSecurityAlerts,
  mockPermissionsMatrix
} from './data/security-data';
import { PaginatedResponse, ApiResponse, BusinessPartner, SalesOrder, Student, StudentBilling, StudentPayment, Project, ProjectExpense, UtilityBill, RecurringPayment, Item, GoodsReceiptNote, GoodsIssueNote, StockTransfer, ReorderAlert, ExpiryAlert, ChartOfAccounts, JournalEntry, TrialBalance, AccountsPayable, AccountsReceivable, VendorPayment, CustomerPayment, Invoice, Receipt, RRACompliance, VATReturn, Employee, Department, Position, Payroll, Payslip, LeaveType, PurchaseRequest, PurchaseOrder, Vendor, BudgetComparison, FixedAsset, AssetCategory, AssetLocation, AssetMaintenance, DepreciationEntry, FinancialReport, FinancialKPI, CustomReport, AnalyticsDashboard, AnalyticsMetric, SystemUser, UserRole, Permission, SystemHealth, SystemConfiguration } from '@/types';

// Helper function to create paginated response
function createPaginatedResponse<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  filters?: Record<string, any>
): PaginatedResponse<T> {
  let filteredItems = [...items];

  // Apply search filter
  if (search) {
    filteredItems = filteredItems.filter((item: any) =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }

  // Apply additional filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        filteredItems = filteredItems.filter((item: any) => {
          if (key === 'status') {
            return item.status === value;
          }
          if (key === 'type') {
            return item.type === value;
          }
          return true;
        });
      }
    });
  }

  const total = filteredItems.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export const handlers = [

  // Authentication endpoints
  http.post('/api/auth/login', async ({ request }) => {
    console.log('MSW: Login request intercepted');
    const { email, password } = await request.json() as { email: string; password: string };
    console.log('MSW: Login attempt with email:', email);

    // Check credentials
    const validCredential = mockCredentials.find(
      cred => cred.email === email && cred.password === password
    );
    console.log('MSW: Valid credential found:', !!validCredential);
    console.log('MSW: Available credentials:', mockCredentials.map(c => c.email));

    if (!validCredential) {
      console.log('MSW: Invalid credentials, returning 401');
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Find user
    const user = mockUsers.find(u => u.email === email);
    console.log('MSW: User found:', !!user);
    if (!user) {
      console.log('MSW: User not found, returning 404');
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Simulate token generation
    const accessToken = `mock-token-${user.id}-${Date.now()}`;
    console.log('MSW: Login successful, returning user data');

    return HttpResponse.json({
      user,
      accessToken,
      message: 'Login successful',
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logout successful' });
  }),

  http.post('/api/auth/refresh', () => {
    // For demo, just return success
    return HttpResponse.json({ message: 'Token refreshed' });
  }),

  http.get('/api/v1/users/me', () => {
    // Return first user for demo
    return HttpResponse.json(mockUsers[0]);
  }),

  // Dashboard endpoints
  http.get('/api/v1/dashboard/kpis', () => {
    return HttpResponse.json(mockDashboardData);
  }),

  // Business Partners endpoints
  http.get('/api/v1/business-partners', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';

    const response = createPaginatedResponse(
      mockBusinessPartners,
      page,
      pageSize,
      search,
      { type }
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/business-partners/:id', ({ params }) => {
    const { id } = params;
    const partner = mockBusinessPartners.find(bp => bp.id === id);
    
    if (!partner) {
      return HttpResponse.json(
        { message: 'Business partner not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(partner);
  }),

  http.post('/api/v1/business-partners', async ({ request }) => {
    const data = await request.json() as Partial<BusinessPartner>;
    const newPartner = {
      id: `bp-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as BusinessPartner;

    mockBusinessPartners.push(newPartner);
    return HttpResponse.json(newPartner, { status: 201 });
  }),

  // Items endpoints
  http.get('/api/v1/items', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';

    const response = createPaginatedResponse(
      mockItems,
      page,
      pageSize,
      search
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/items/:id', ({ params }) => {
    const { id } = params;
    const item = mockItems.find(i => i.id === id);
    
    if (!item) {
      return HttpResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(item);
  }),

  // Sales Orders endpoints
  http.get('/api/v1/sales/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    const response = createPaginatedResponse(
      mockSalesOrders,
      page,
      pageSize,
      search,
      { status }
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/sales/orders/:id', ({ params }) => {
    const { id } = params;
    const order = mockSalesOrders.find(so => so.id === id);
    
    if (!order) {
      return HttpResponse.json(
        { message: 'Sales order not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(order);
  }),

  http.post('/api/v1/sales/orders', async ({ request }) => {
    const data = await request.json() as Partial<SalesOrder>;
    const newOrder = {
      id: `so-${Date.now()}`,
      number: `SO-2024-${String(mockSalesOrders.length + 1).padStart(3, '0')}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as SalesOrder;

    mockSalesOrders.push(newOrder);
    return HttpResponse.json(newOrder, { status: 201 });
  }),

  // Purchase Orders endpoints
  http.get('/api/v1/purchasing/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    const response = createPaginatedResponse(
      mockPurchaseOrders,
      page,
      pageSize,
      search,
      { status }
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/purchasing/orders/:id', ({ params }) => {
    const { id } = params;
    const order = mockPurchaseOrders.find(po => po.id === id);
    
    if (!order) {
      return HttpResponse.json(
        { message: 'Purchase order not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(order);
  }),

  // Warehouses endpoints
  http.get('/api/v1/warehouses', () => {
    return HttpResponse.json(mockWarehouses);
  }),

  // Student endpoints
  http.get('/api/v1/students', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const program = url.searchParams.get('program') || '';
    const status = url.searchParams.get('status') || '';

    let filteredStudents = mockStudents;

    if (search) {
      filteredStudents = filteredStudents.filter(student =>
        student.firstName.toLowerCase().includes(search.toLowerCase()) ||
        student.lastName.toLowerCase().includes(search.toLowerCase()) ||
        student.studentId.toLowerCase().includes(search.toLowerCase()) ||
        student.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (program) {
      filteredStudents = filteredStudents.filter(student =>
        student.program.id === program
      );
    }

    if (status) {
      filteredStudents = filteredStudents.filter(student =>
        student.status === status
      );
    }

    // Add current balance to students
    const studentsWithBalance = filteredStudents.map(student => {
      const billing = mockStudentBilling.find(b => b.studentId === student.id);
      return {
        ...student,
        currentBalance: billing?.balanceAmount || 0
      };
    });

    const response = createPaginatedResponse(
      studentsWithBalance,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/students/dashboard-stats', () => {
    return HttpResponse.json(mockStudentDashboardStats);
  }),

  http.get('/api/v1/students/billing', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const term = url.searchParams.get('term') || '';
    const status = url.searchParams.get('status') || '';
    const academicYear = url.searchParams.get('academicYear') || '';

    let filteredBilling = mockStudentBilling;

    if (search) {
      filteredBilling = filteredBilling.filter(billing =>
        billing.student.firstName.toLowerCase().includes(search.toLowerCase()) ||
        billing.student.lastName.toLowerCase().includes(search.toLowerCase()) ||
        billing.student.studentId.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (term) {
      filteredBilling = filteredBilling.filter(billing => billing.term === term);
    }

    if (status) {
      filteredBilling = filteredBilling.filter(billing => billing.status === status);
    }

    if (academicYear) {
      filteredBilling = filteredBilling.filter(billing => billing.academicYear === academicYear);
    }

    const response = createPaginatedResponse(
      filteredBilling,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/students/billing/stats', ({ request }) => {
    const url = new URL(request.url);
    const academicYear = url.searchParams.get('academicYear') || '2024';

    return HttpResponse.json(mockBillingStats);
  }),

  http.get('/api/v1/students/payments', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const paymentMethod = url.searchParams.get('paymentMethod') || '';
    const status = url.searchParams.get('status') || '';
    const dateRange = url.searchParams.get('dateRange') || '';

    let filteredPayments = mockStudentPayments.map(payment => ({
      ...payment,
      student: mockStudents.find(s => s.id === payment.studentId)
    }));

    if (search) {
      filteredPayments = filteredPayments.filter(payment =>
        payment.student?.firstName.toLowerCase().includes(search.toLowerCase()) ||
        payment.student?.lastName.toLowerCase().includes(search.toLowerCase()) ||
        payment.student?.studentId.toLowerCase().includes(search.toLowerCase()) ||
        payment.receiptNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (paymentMethod) {
      filteredPayments = filteredPayments.filter(payment => payment.paymentMethod === paymentMethod);
    }

    if (status === 'active') {
      filteredPayments = filteredPayments.filter(payment => !payment.isReversed);
    } else if (status === 'reversed') {
      filteredPayments = filteredPayments.filter(payment => payment.isReversed);
    }

    const response = createPaginatedResponse(
      filteredPayments,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/students/payments/stats', ({ request }) => {
    const url = new URL(request.url);
    const dateRange = url.searchParams.get('dateRange') || 'today';

    return HttpResponse.json(mockPaymentStats);
  }),

  // Project endpoints
  http.get('/api/v1/projects', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const donor = url.searchParams.get('donor') || '';

    let filteredProjects = mockProjects;

    if (search) {
      filteredProjects = filteredProjects.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.code.toLowerCase().includes(search.toLowerCase()) ||
        project.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredProjects = filteredProjects.filter(project => project.status === status);
    }

    if (donor) {
      filteredProjects = filteredProjects.filter(project => project.donor.id === donor);
    }

    const response = createPaginatedResponse(
      filteredProjects,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/projects/dashboard-stats', () => {
    return HttpResponse.json(mockProjectDashboardStats);
  }),

  http.get('/api/v1/projects/expenses', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const project = url.searchParams.get('project') || '';
    const status = url.searchParams.get('status') || '';
    const category = url.searchParams.get('category') || '';

    let filteredExpenses = mockProjectExpenses;

    if (search) {
      filteredExpenses = filteredExpenses.filter(expense =>
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(search.toLowerCase()) ||
        expense.project.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (project) {
      filteredExpenses = filteredExpenses.filter(expense => expense.projectId === project);
    }

    if (status) {
      filteredExpenses = filteredExpenses.filter(expense => expense.status === status);
    }

    if (category) {
      filteredExpenses = filteredExpenses.filter(expense =>
        expense.budgetCategoryId && expense.budgetCategoryId.includes(category)
      );
    }

    const response = createPaginatedResponse(
      filteredExpenses,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/projects/expenses/stats', () => {
    return HttpResponse.json(mockProjectExpenseStats);
  }),

  // Utility endpoints
  http.get('/api/v1/utilities/bills', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';
    const period = url.searchParams.get('period') || '';

    let filteredBills = mockUtilityBills;

    if (search) {
      filteredBills = filteredBills.filter(bill =>
        bill.billNumber.toLowerCase().includes(search.toLowerCase()) ||
        bill.utilityAccount.name.toLowerCase().includes(search.toLowerCase()) ||
        bill.utilityAccount.provider.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filteredBills = filteredBills.filter(bill => bill.utilityAccount.type === type);
    }

    if (status) {
      filteredBills = filteredBills.filter(bill => bill.status === status);
    }

    // Filter by period (simplified for demo)
    if (period && period !== 'current') {
      // Add period filtering logic here
    }

    const response = createPaginatedResponse(
      filteredBills,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/utilities/dashboard-stats', () => {
    return HttpResponse.json(mockUtilityDashboardStats);
  }),

  http.get('/api/v1/utilities/recurring', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const frequency = url.searchParams.get('frequency') || '';
    const status = url.searchParams.get('status') || '';

    let filteredPayments = mockRecurringPayments;

    if (search) {
      filteredPayments = filteredPayments.filter(payment =>
        payment.name.toLowerCase().includes(search.toLowerCase()) ||
        payment.payee.toLowerCase().includes(search.toLowerCase()) ||
        payment.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (frequency) {
      filteredPayments = filteredPayments.filter(payment => payment.frequency === frequency);
    }

    if (status === 'active') {
      filteredPayments = filteredPayments.filter(payment => payment.isActive);
    } else if (status === 'inactive') {
      filteredPayments = filteredPayments.filter(payment => !payment.isActive);
    }

    const response = createPaginatedResponse(
      filteredPayments,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/utilities/recurring/stats', () => {
    return HttpResponse.json(mockRecurringStats);
  }),

  // Enhanced Inventory endpoints
  http.get('/api/v1/inventory/items', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const warehouse = url.searchParams.get('warehouse') || '';
    const status = url.searchParams.get('status') || '';

    let filteredItems = mockEnhancedItems;

    if (search) {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredItems = filteredItems.filter(item => item.category?.id === category);
    }

    // Add stock status filtering
    if (status && status !== 'all') {
      filteredItems = filteredItems.filter(item => {
        const stock = item.currentStock || 0;
        const reorderLevel = item.reorderLevel || 0;
        const minStock = item.minStock || 0;

        switch (status) {
          case 'out_of_stock':
            return stock === 0;
          case 'critical':
            return stock > 0 && stock <= minStock;
          case 'low':
            return stock > minStock && stock <= reorderLevel;
          case 'normal':
            return stock > reorderLevel;
          default:
            return true;
        }
      });
    }

    const response = createPaginatedResponse(
      filteredItems,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/inventory/dashboard-stats', () => {
    return HttpResponse.json(mockInventoryDashboardStats);
  }),

  http.get('/api/v1/inventory/receipts', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const warehouse = url.searchParams.get('warehouse') || '';

    let filteredReceipts = mockGoodsReceiptNotes;

    if (search) {
      filteredReceipts = filteredReceipts.filter(receipt =>
        receipt.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
        receipt.supplier.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.status === status);
    }

    if (warehouse) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.warehouseId === warehouse);
    }

    const response = createPaginatedResponse(
      filteredReceipts,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/inventory/receipts/stats', () => {
    return HttpResponse.json(mockReceiptStats);
  }),

  http.get('/api/v1/inventory/issues', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';
    const warehouse = url.searchParams.get('warehouse') || '';

    let filteredIssues = mockGoodsIssueNotes;

    if (search) {
      filteredIssues = filteredIssues.filter(issue =>
        issue.ginNumber.toLowerCase().includes(search.toLowerCase()) ||
        issue.requestedBy.toLowerCase().includes(search.toLowerCase()) ||
        issue.purpose.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredIssues = filteredIssues.filter(issue => issue.status === status);
    }

    if (type) {
      filteredIssues = filteredIssues.filter(issue => issue.issueType === type);
    }

    if (warehouse) {
      filteredIssues = filteredIssues.filter(issue => issue.warehouseId === warehouse);
    }

    const response = createPaginatedResponse(
      filteredIssues,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/inventory/issues/stats', () => {
    return HttpResponse.json(mockIssueStats);
  }),

  http.get('/api/v1/inventory/transfers', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const fromWarehouse = url.searchParams.get('fromWarehouse') || '';
    const toWarehouse = url.searchParams.get('toWarehouse') || '';

    let filteredTransfers = mockStockTransfers;

    if (search) {
      filteredTransfers = filteredTransfers.filter(transfer =>
        transfer.transferNumber.toLowerCase().includes(search.toLowerCase()) ||
        transfer.requestedBy.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredTransfers = filteredTransfers.filter(transfer => transfer.status === status);
    }

    if (fromWarehouse) {
      filteredTransfers = filteredTransfers.filter(transfer => transfer.fromWarehouseId === fromWarehouse);
    }

    if (toWarehouse) {
      filteredTransfers = filteredTransfers.filter(transfer => transfer.toWarehouseId === toWarehouse);
    }

    const response = createPaginatedResponse(
      filteredTransfers,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/inventory/transfers/stats', () => {
    return HttpResponse.json(mockTransferStats);
  }),

  http.get('/api/v1/inventory/alerts/reorder', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const priority = url.searchParams.get('priority') || '';
    const warehouse = url.searchParams.get('warehouse') || '';
    const status = url.searchParams.get('status') || '';

    let filteredAlerts = mockReorderAlerts;

    if (search) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.item.name.toLowerCase().includes(search.toLowerCase()) ||
        alert.item.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (priority) {
      filteredAlerts = filteredAlerts.filter(alert => alert.priority === priority);
    }

    if (warehouse) {
      filteredAlerts = filteredAlerts.filter(alert => alert.warehouseId === warehouse);
    }

    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    const response = createPaginatedResponse(
      filteredAlerts,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/inventory/alerts/expiry', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const priority = url.searchParams.get('priority') || '';
    const warehouse = url.searchParams.get('warehouse') || '';
    const status = url.searchParams.get('status') || '';

    let filteredAlerts = mockExpiryAlerts;

    if (search) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.item.name.toLowerCase().includes(search.toLowerCase()) ||
        alert.item.code.toLowerCase().includes(search.toLowerCase()) ||
        alert.batch.batchNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (priority) {
      filteredAlerts = filteredAlerts.filter(alert => alert.priority === priority);
    }

    if (warehouse) {
      filteredAlerts = filteredAlerts.filter(alert => alert.warehouseId === warehouse);
    }

    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    const response = createPaginatedResponse(
      filteredAlerts,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/inventory/alerts/stats', () => {
    return HttpResponse.json(mockAlertStats);
  }),

  // Accounting endpoints
  http.get('/api/v1/accounting/chart-of-accounts', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';

    let filteredAccounts = mockChartOfAccounts;

    if (search) {
      filteredAccounts = filteredAccounts.filter(account =>
        account.accountName.toLowerCase().includes(search.toLowerCase()) ||
        account.accountCode.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filteredAccounts = filteredAccounts.filter(account => account.accountType === type);
    }

    if (status === 'active') {
      filteredAccounts = filteredAccounts.filter(account => account.isActive);
    } else if (status === 'inactive') {
      filteredAccounts = filteredAccounts.filter(account => !account.isActive);
    }

    const response = createPaginatedResponse(
      filteredAccounts,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/accounting/chart-of-accounts/stats', () => {
    return HttpResponse.json(mockAccountingDashboardStats);
  }),

  http.get('/api/v1/accounting/journal-entries', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';
    const source = url.searchParams.get('source') || '';

    let filteredEntries = mockJournalEntries;

    if (search) {
      filteredEntries = filteredEntries.filter(entry =>
        entry.entryNumber.toLowerCase().includes(search.toLowerCase()) ||
        entry.description.toLowerCase().includes(search.toLowerCase()) ||
        entry.reference?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredEntries = filteredEntries.filter(entry => entry.status === status);
    }

    if (type) {
      filteredEntries = filteredEntries.filter(entry => entry.entryType === type);
    }

    if (source) {
      filteredEntries = filteredEntries.filter(entry => entry.source === source);
    }

    const response = createPaginatedResponse(
      filteredEntries,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/accounting/journal-entries/stats', () => {
    return HttpResponse.json(mockJournalEntryStats);
  }),

  http.get('/api/v1/accounting/trial-balance', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const period = url.searchParams.get('period') || 'current';

    let filteredAccounts = mockTrialBalance.accounts;

    if (search) {
      filteredAccounts = filteredAccounts.filter(account =>
        account.accountName.toLowerCase().includes(search.toLowerCase()) ||
        account.accountCode.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filteredAccounts = filteredAccounts.filter(account => account.accountType === type);
    }

    const trialBalance = {
      ...mockTrialBalance,
      accounts: filteredAccounts,
    };

    return HttpResponse.json(trialBalance);
  }),

  http.get('/api/v1/accounting/trial-balance/stats', () => {
    return HttpResponse.json(mockTrialBalanceStats);
  }),

  // Payables endpoints
  http.get('/api/v1/payables', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const vendor = url.searchParams.get('vendor') || '';
    const ageing = url.searchParams.get('ageing') || '';

    let filteredPayables = mockAccountsPayable;

    if (search) {
      filteredPayables = filteredPayables.filter(payable =>
        payable.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        payable.vendor.name.toLowerCase().includes(search.toLowerCase()) ||
        payable.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredPayables = filteredPayables.filter(payable => payable.status === status);
    }

    if (vendor) {
      filteredPayables = filteredPayables.filter(payable => payable.vendorId === vendor);
    }

    if (ageing && ageing !== 'all') {
      filteredPayables = filteredPayables.filter(payable => {
        const daysOverdue = payable.daysOverdue || 0;
        switch (ageing) {
          case 'current':
            return daysOverdue <= 0;
          case '0-30':
            return daysOverdue > 0 && daysOverdue <= 30;
          case '31-60':
            return daysOverdue > 30 && daysOverdue <= 60;
          case '60+':
            return daysOverdue > 60;
          default:
            return true;
        }
      });
    }

    const response = createPaginatedResponse(
      filteredPayables,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/payables/dashboard-stats', () => {
    return HttpResponse.json(mockPayablesDashboardStats);
  }),

  http.get('/api/v1/payables/payments', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const method = url.searchParams.get('method') || '';
    const vendor = url.searchParams.get('vendor') || '';

    let filteredPayments = mockVendorPayments;

    if (search) {
      filteredPayments = filteredPayments.filter(payment =>
        payment.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
        payment.vendor.name.toLowerCase().includes(search.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredPayments = filteredPayments.filter(payment => payment.status === status);
    }

    if (method) {
      filteredPayments = filteredPayments.filter(payment => payment.paymentMethod === method);
    }

    if (vendor) {
      filteredPayments = filteredPayments.filter(payment => payment.vendorId === vendor);
    }

    const response = createPaginatedResponse(
      filteredPayments,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/payables/payments/stats', () => {
    return HttpResponse.json(mockVendorPaymentStats);
  }),

  // Receivables endpoints
  http.get('/api/v1/receivables', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const customerType = url.searchParams.get('customerType') || '';
    const ageing = url.searchParams.get('ageing') || '';

    let filteredReceivables = mockAccountsReceivable;

    if (search) {
      filteredReceivables = filteredReceivables.filter(receivable =>
        receivable.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        receivable.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        receivable.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredReceivables = filteredReceivables.filter(receivable => receivable.status === status);
    }

    if (customerType) {
      filteredReceivables = filteredReceivables.filter(receivable => receivable.customer.type === customerType);
    }

    if (ageing && ageing !== 'all') {
      filteredReceivables = filteredReceivables.filter(receivable => {
        const daysOverdue = receivable.daysOverdue || 0;
        switch (ageing) {
          case 'current':
            return daysOverdue <= 0;
          case '0-30':
            return daysOverdue > 0 && daysOverdue <= 30;
          case '31-60':
            return daysOverdue > 30 && daysOverdue <= 60;
          case '60+':
            return daysOverdue > 60;
          default:
            return true;
        }
      });
    }

    const response = createPaginatedResponse(
      filteredReceivables,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/receivables/dashboard-stats', () => {
    return HttpResponse.json(mockReceivablesDashboardStats);
  }),

  http.get('/api/v1/receivables/payments', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const method = url.searchParams.get('method') || '';
    const customer = url.searchParams.get('customer') || '';

    let filteredPayments = mockCustomerPayments;

    if (search) {
      filteredPayments = filteredPayments.filter(payment =>
        payment.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
        payment.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredPayments = filteredPayments.filter(payment => payment.status === status);
    }

    if (method) {
      filteredPayments = filteredPayments.filter(payment => payment.paymentMethod === method);
    }

    if (customer) {
      filteredPayments = filteredPayments.filter(payment => payment.customerId === customer);
    }

    const response = createPaginatedResponse(
      filteredPayments,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/receivables/payments/stats', () => {
    return HttpResponse.json(mockCustomerPaymentStats);
  }),

  // Invoicing endpoints
  http.get('/api/v1/invoicing/invoices', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';
    const customer = url.searchParams.get('customer') || '';

    let filteredInvoices = mockInvoices;

    if (search) {
      filteredInvoices = filteredInvoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        invoice.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        invoice.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);
    }

    if (type) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.invoiceType === type);
    }

    if (customer) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.customer.type === customer);
    }

    const response = createPaginatedResponse(
      filteredInvoices,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/invoicing/dashboard-stats', () => {
    return HttpResponse.json(mockInvoicingDashboardStats);
  }),

  http.get('/api/v1/invoicing/receipts', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const method = url.searchParams.get('method') || '';

    let filteredReceipts = mockReceipts;

    if (search) {
      filteredReceipts = filteredReceipts.filter(receipt =>
        receipt.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
        receipt.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        receipt.reference?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.status === status);
    }

    if (method) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.paymentMethod === method);
    }

    const response = createPaginatedResponse(
      filteredReceipts,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/invoicing/receipts/stats', () => {
    return HttpResponse.json(mockInvoicingReceiptStats);
  }),

  http.get('/api/v1/invoicing/rra-compliance', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const reportType = url.searchParams.get('reportType') || '';

    let filteredCompliance = mockRRACompliance;

    if (search) {
      filteredCompliance = filteredCompliance.filter(compliance =>
        compliance.periodName.toLowerCase().includes(search.toLowerCase()) ||
        compliance.reportType.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredCompliance = filteredCompliance.filter(compliance => compliance.status === status);
    }

    if (reportType) {
      filteredCompliance = filteredCompliance.filter(compliance => compliance.reportType === reportType);
    }

    const response = createPaginatedResponse(
      filteredCompliance,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/invoicing/rra-compliance/stats', () => {
    return HttpResponse.json(mockRRAComplianceStats);
  }),

  http.get('/api/v1/invoicing/vat-returns', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    let filteredReturns = mockVATReturns;

    if (search) {
      filteredReturns = filteredReturns.filter(vatReturn =>
        vatReturn.rraReference?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredReturns = filteredReturns.filter(vatReturn => vatReturn.status === status);
    }

    const response = createPaginatedResponse(
      filteredReturns,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  // Payroll endpoints
  http.get('/api/v1/payroll', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const period = url.searchParams.get('period') || '';

    let filteredPayrolls = mockPayrolls;

    if (search) {
      filteredPayrolls = filteredPayrolls.filter(payroll =>
        payroll.payrollNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredPayrolls = filteredPayrolls.filter(payroll => payroll.status === status);
    }

    const response = createPaginatedResponse(
      filteredPayrolls,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/payroll/dashboard-stats', () => {
    return HttpResponse.json(mockPayrollDashboardStats);
  }),

  http.get('/api/v1/payroll/employees', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const department = url.searchParams.get('department') || '';
    const employmentType = url.searchParams.get('employmentType') || '';

    let filteredEmployees = mockEmployees;

    if (search) {
      filteredEmployees = filteredEmployees.filter(employee =>
        employee.firstName.toLowerCase().includes(search.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
        employee.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
        employee.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredEmployees = filteredEmployees.filter(employee => employee.status === status);
    }

    if (department) {
      filteredEmployees = filteredEmployees.filter(employee => employee.department.code.toLowerCase() === department.toLowerCase());
    }

    if (employmentType) {
      filteredEmployees = filteredEmployees.filter(employee => employee.employmentType === employmentType);
    }

    const response = createPaginatedResponse(
      filteredEmployees,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/payroll/employees/stats', () => {
    return HttpResponse.json(mockEmployeeStats);
  }),

  http.get('/api/v1/payroll/payslips', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const department = url.searchParams.get('department') || '';

    let filteredPayslips = mockPayslips;

    if (search) {
      filteredPayslips = filteredPayslips.filter(payslip =>
        payslip.employee.firstName.toLowerCase().includes(search.toLowerCase()) ||
        payslip.employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
        payslip.employee.employeeNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredPayslips = filteredPayslips.filter(payslip => payslip.status === status);
    }

    if (department) {
      filteredPayslips = filteredPayslips.filter(payslip =>
        payslip.employee.department.code.toLowerCase() === department.toLowerCase()
      );
    }

    const response = createPaginatedResponse(
      filteredPayslips,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/payroll/payslips/stats', () => {
    return HttpResponse.json(mockPayslipStats);
  }),

  http.get('/api/v1/payroll/departments', () => {
    return HttpResponse.json(mockDepartments);
  }),

  http.get('/api/v1/payroll/positions', () => {
    return HttpResponse.json(mockPositions);
  }),

  http.get('/api/v1/payroll/leave-types', () => {
    return HttpResponse.json(mockLeaveTypes);
  }),

  // Procurement endpoints
  http.get('/api/v1/procurement/requests', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const priority = url.searchParams.get('priority') || '';
    const department = url.searchParams.get('department') || '';

    let filteredRequests = mockPurchaseRequests;

    if (search) {
      filteredRequests = filteredRequests.filter(request =>
        request.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
        request.requestedBy.toLowerCase().includes(search.toLowerCase()) ||
        request.justification.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredRequests = filteredRequests.filter(request => request.status === status);
    }

    if (priority) {
      filteredRequests = filteredRequests.filter(request => request.priority === priority);
    }

    if (department) {
      filteredRequests = filteredRequests.filter(request =>
        request.department.code.toLowerCase() === department.toLowerCase()
      );
    }

    const response = createPaginatedResponse(
      filteredRequests,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/procurement/dashboard-stats', () => {
    return HttpResponse.json(mockProcurementDashboardStats);
  }),

  http.get('/api/v1/procurement/purchase-orders', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const vendor = url.searchParams.get('vendor') || '';

    let filteredOrders = mockProcurementPurchaseOrders;

    if (search) {
      filteredOrders = filteredOrders.filter(order =>
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.vendor.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    if (vendor) {
      filteredOrders = filteredOrders.filter(order => order.vendorId === vendor);
    }

    const response = createPaginatedResponse(
      filteredOrders,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/procurement/purchase-orders/stats', () => {
    return HttpResponse.json(mockPurchaseOrderStats);
  }),

  http.get('/api/v1/procurement/vendors', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';
    const category = url.searchParams.get('category') || '';

    let filteredVendors = mockVendors;

    if (search) {
      filteredVendors = filteredVendors.filter(vendor =>
        vendor.name.toLowerCase().includes(search.toLowerCase()) ||
        vendor.vendorCode.toLowerCase().includes(search.toLowerCase()) ||
        vendor.contactPerson.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      switch (status) {
        case 'active':
          filteredVendors = filteredVendors.filter(vendor => vendor.isActive && !vendor.isBlacklisted);
          break;
        case 'inactive':
          filteredVendors = filteredVendors.filter(vendor => !vendor.isActive);
          break;
        case 'preferred':
          filteredVendors = filteredVendors.filter(vendor => vendor.isPreferred);
          break;
        case 'blacklisted':
          filteredVendors = filteredVendors.filter(vendor => vendor.isBlacklisted);
          break;
      }
    }

    if (type) {
      filteredVendors = filteredVendors.filter(vendor => vendor.vendorType === type);
    }

    const response = createPaginatedResponse(
      filteredVendors,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/procurement/vendors/stats', () => {
    return HttpResponse.json(mockVendorStats);
  }),

  http.get('/api/v1/procurement/budget-comparison', () => {
    return HttpResponse.json(mockBudgetComparisons);
  }),

  // Assets endpoints
  http.get('/api/v1/assets', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const category = url.searchParams.get('category') || '';
    const location = url.searchParams.get('location') || '';
    const condition = url.searchParams.get('condition') || '';

    let filteredAssets = mockFixedAssets;

    if (search) {
      filteredAssets = filteredAssets.filter(asset =>
        asset.assetName.toLowerCase().includes(search.toLowerCase()) ||
        asset.assetNumber.toLowerCase().includes(search.toLowerCase()) ||
        asset.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredAssets = filteredAssets.filter(asset => asset.status === status);
    }

    if (category) {
      filteredAssets = filteredAssets.filter(asset =>
        asset.assetCategory.code.toLowerCase() === category.toLowerCase()
      );
    }

    if (location) {
      filteredAssets = filteredAssets.filter(asset =>
        asset.location.code.toLowerCase() === location.toLowerCase()
      );
    }

    if (condition) {
      filteredAssets = filteredAssets.filter(asset => asset.condition === condition);
    }

    const response = createPaginatedResponse(
      filteredAssets,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/assets/dashboard-stats', () => {
    return HttpResponse.json(mockAssetsDashboardStats);
  }),

  http.get('/api/v1/assets/maintenance', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';
    const priority = url.searchParams.get('priority') || '';

    let filteredMaintenance = mockAssetMaintenance;

    if (search) {
      filteredMaintenance = filteredMaintenance.filter(maintenance =>
        maintenance.maintenanceNumber.toLowerCase().includes(search.toLowerCase()) ||
        maintenance.asset.assetName.toLowerCase().includes(search.toLowerCase()) ||
        maintenance.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredMaintenance = filteredMaintenance.filter(maintenance => maintenance.status === status);
    }

    if (type) {
      filteredMaintenance = filteredMaintenance.filter(maintenance => maintenance.maintenanceType === type);
    }

    if (priority) {
      filteredMaintenance = filteredMaintenance.filter(maintenance => maintenance.priority === priority);
    }

    const response = createPaginatedResponse(
      filteredMaintenance,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/assets/maintenance/stats', () => {
    return HttpResponse.json(mockMaintenanceStats);
  }),

  http.get('/api/v1/assets/depreciation', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const method = url.searchParams.get('method') || '';
    const category = url.searchParams.get('category') || '';

    let filteredDepreciation = mockDepreciationEntries;

    if (search) {
      filteredDepreciation = filteredDepreciation.filter(entry =>
        entry.period.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (method) {
      filteredDepreciation = filteredDepreciation.filter(entry => entry.method === method);
    }

    const response = createPaginatedResponse(
      filteredDepreciation,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/assets/depreciation/stats', () => {
    return HttpResponse.json(mockDepreciationStats);
  }),

  http.get('/api/v1/assets/categories', () => {
    return HttpResponse.json(mockAssetCategories);
  }),

  http.get('/api/v1/assets/locations', () => {
    return HttpResponse.json(mockAssetLocations);
  }),

  // Financial Reports endpoints
  http.get('/api/v1/reports/financial', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';
    const period = url.searchParams.get('period') || '';

    let filteredReports = mockFinancialReports;

    if (search) {
      filteredReports = filteredReports.filter(report =>
        report.reportName.toLowerCase().includes(search.toLowerCase()) ||
        report.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filteredReports = filteredReports.filter(report => report.reportType === type);
    }

    if (status) {
      filteredReports = filteredReports.filter(report => report.status === status);
    }

    if (period) {
      // Filter by period logic would go here
    }

    const response = createPaginatedResponse(
      filteredReports,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/reports/dashboard-stats', () => {
    return HttpResponse.json(mockReportsDashboardStats);
  }),

  http.get('/api/v1/reports/financial-dashboard', ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'current_year';

    return HttpResponse.json(mockFinancialDashboard);
  }),

  http.get('/api/v1/reports/financial-kpis', ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'current_year';

    return HttpResponse.json(mockFinancialKPIs);
  }),

  // Analytics endpoints
  http.get('/api/v1/analytics/reports', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';

    let filteredReports = mockCustomReports;

    if (search) {
      filteredReports = filteredReports.filter(report =>
        report.reportName.toLowerCase().includes(search.toLowerCase()) ||
        report.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredReports = filteredReports.filter(report => report.category === category);
    }

    if (type) {
      filteredReports = filteredReports.filter(report => report.reportType === type);
    }

    if (status) {
      filteredReports = filteredReports.filter(report => report.status === status);
    }

    const response = createPaginatedResponse(
      filteredReports,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/analytics/dashboard-stats', () => {
    return HttpResponse.json(mockAnalyticsDashboardStats);
  }),

  http.get('/api/v1/analytics/dashboards', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';

    let filteredDashboards = mockAnalyticsDashboards;

    if (search) {
      filteredDashboards = filteredDashboards.filter(dashboard =>
        dashboard.dashboardName.toLowerCase().includes(search.toLowerCase()) ||
        dashboard.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredDashboards = filteredDashboards.filter(dashboard => dashboard.category === category);
    }

    const response = createPaginatedResponse(
      filteredDashboards,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/analytics/metrics', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || '';

    let filteredMetrics = mockAnalyticsMetrics;

    if (category) {
      filteredMetrics = filteredMetrics.filter(metric => metric.category === category);
    }

    return HttpResponse.json(filteredMetrics);
  }),

  // Admin endpoints
  http.get('/api/v1/admin/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const role = url.searchParams.get('role') || '';

    let filteredUsers = mockSystemUsers;

    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user =>
        user.roles.some(userRole => userRole.code === role)
      );
    }

    const response = createPaginatedResponse(
      filteredUsers,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/admin/system-stats', () => {
    return HttpResponse.json(mockAdminDashboardStats);
  }),

  http.get('/api/v1/admin/system-health', () => {
    return HttpResponse.json(mockSystemHealth);
  }),

  http.get('/api/v1/admin/roles', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    let filteredRoles = mockUserRoles;

    if (search) {
      filteredRoles = filteredRoles.filter(role =>
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        role.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status === 'active') {
      filteredRoles = filteredRoles.filter(role => role.isActive);
    } else if (status === 'inactive') {
      filteredRoles = filteredRoles.filter(role => !role.isActive);
    }

    const response = createPaginatedResponse(
      filteredRoles,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/admin/permissions', () => {
    return HttpResponse.json(mockPermissions);
  }),

  http.get('/api/v1/admin/configuration', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || '';

    let filteredConfig = mockSystemConfiguration;

    if (category) {
      filteredConfig = filteredConfig.filter(config => config.category === category);
    }

    return HttpResponse.json(filteredConfig);
  }),

  // Mobile endpoints
  http.get('/api/v1/mobile/dashboard-stats', () => {
    return HttpResponse.json(mockMobileDashboardStats);
  }),

  http.get('/api/v1/mobile/recent-activities', () => {
    return HttpResponse.json(mockRecentActivities);
  }),

  http.get('/api/v1/mobile/pending-approvals', () => {
    return HttpResponse.json(mockPendingApprovals);
  }),

  http.get('/api/v1/mobile/features', () => {
    return HttpResponse.json(mockMobileAppFeatures);
  }),

  // Notifications endpoints
  http.get('/api/v1/notifications', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';

    let filteredNotifications = mockNotifications;

    if (search) {
      filteredNotifications = filteredNotifications.filter(notification =>
        notification.title.toLowerCase().includes(search.toLowerCase()) ||
        notification.message.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filteredNotifications = filteredNotifications.filter(notification => notification.type === type);
    }

    if (status) {
      filteredNotifications = filteredNotifications.filter(notification => notification.status === status);
    }

    const response = createPaginatedResponse(
      filteredNotifications,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/notifications/stats', () => {
    return HttpResponse.json(mockNotificationStats);
  }),

  http.get('/api/v1/notifications/sms-templates', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || '';

    let filteredTemplates = mockSMSTemplates;

    if (category) {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }

    return HttpResponse.json(filteredTemplates);
  }),

  // Integration endpoints
  http.get('/api/v1/integrations', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';

    let filteredIntegrations = mockIntegrations;

    if (search) {
      filteredIntegrations = filteredIntegrations.filter(integration =>
        integration.name.toLowerCase().includes(search.toLowerCase()) ||
        integration.provider.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.type === type);
    }

    if (status) {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.status === status);
    }

    const response = createPaginatedResponse(
      filteredIntegrations,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/integrations/stats', () => {
    return HttpResponse.json(mockIntegrationStats);
  }),

  http.get('/api/v1/integrations/sync-logs', ({ request }) => {
    const url = new URL(request.url);
    const integration = url.searchParams.get('integration') || '';

    let filteredLogs = mockSyncLogs;

    if (integration) {
      filteredLogs = filteredLogs.filter(log =>
        log.integration.toLowerCase().includes(integration.toLowerCase())
      );
    }

    return HttpResponse.json(filteredLogs);
  }),

  http.get('/api/v1/integrations/rra', () => {
    return HttpResponse.json(mockRRAIntegration);
  }),

  http.get('/api/v1/integrations/banking', () => {
    return HttpResponse.json(mockBankingIntegrations);
  }),

  // Security endpoints
  http.get('/api/v1/security/audit-logs', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const severity = url.searchParams.get('severity') || '';

    let filteredLogs = mockAuditLogs;

    if (search) {
      filteredLogs = filteredLogs.filter(log =>
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.resource.toLowerCase().includes(search.toLowerCase()) ||
        log.userId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filteredLogs = filteredLogs.filter(log =>
        log.resource.toLowerCase().includes(type.toLowerCase())
      );
    }

    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }

    const response = createPaginatedResponse(
      filteredLogs,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/security/stats', () => {
    return HttpResponse.json(mockSecurityStats);
  }),

  http.get('/api/v1/security/login-logs', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('size') || '20');

    const response = createPaginatedResponse(
      mockLoginLogs,
      page,
      pageSize
    );

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/security/settings', () => {
    return HttpResponse.json(mockSecuritySettings);
  }),

  http.get('/api/v1/security/alerts', () => {
    return HttpResponse.json(mockSecurityAlerts);
  }),

  http.get('/api/v1/security/permissions-matrix', () => {
    return HttpResponse.json(mockPermissionsMatrix);
  }),

  // Reports endpoints
  http.get('/api/v1/reports/revenue', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    // Mock revenue data based on date range
    const data = {
      series: mockDashboardData.revenueChart,
      total: mockDashboardData.revenue.current,
      breakdown: {
        sales: 85000,
        services: 25000,
        other: 15000,
      },
    };

    return HttpResponse.json(data);
  }),

  // Only handle unmatched API routes, not all routes
  http.get('/api/*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json(
      { message: 'API endpoint not implemented' },
      { status: 501 }
    );
  }),
];
