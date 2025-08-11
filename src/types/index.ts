// Core types for the ERP system

// User and Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: Role[];
  permissions: Permission[];
  tenantId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';
}

// Business Partner types
export interface BusinessPartner {
  id: string;
  code: string;
  name: string;
  type: 'customer' | 'supplier' | 'both';
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  addresses: Address[];
  contacts: Contact[];
  paymentTerms?: PaymentTerms;
  creditLimit?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping' | 'other';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary: boolean;
}

// Item and Inventory types
export interface Item {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: ItemCategory;
  type: 'inventory' | 'service' | 'non-inventory';
  unitOfMeasure: string;
  purchasePrice?: number;
  salesPrice?: number;
  standardCost?: number;
  isActive: boolean;
  isBatchManaged: boolean;
  isSerialManaged: boolean;
  minStock?: number;
  maxStock?: number;
  reorderLevel?: number;
  preferredVendor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface StockLevel {
  itemId: string;
  warehouseId: string;
  onHand: number;
  committed: number;
  available: number;
  onOrder: number;
  lastUpdated: Date;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: Address;
  type: 'main' | 'lab' | 'admin' | 'library' | 'cafeteria' | 'maintenance' | 'other';
  manager: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Inventory Management Types for INES-Ruhengeri

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  purchaseOrderId?: string;
  supplierId: string;
  supplier: BusinessPartner;
  warehouseId: string;
  warehouse: Warehouse;
  receiptDate: Date;
  deliveryNote?: string;
  lines: GoodsReceiptLine[];
  status: 'draft' | 'received' | 'posted' | 'cancelled';
  totalAmount: number;
  receivedBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GoodsReceiptLine {
  id: string;
  lineNumber: number;
  itemId: string;
  item: Item;
  orderedQuantity?: number;
  receivedQuantity: number;
  unitPrice: number;
  lineTotal: number;
  batchNumber?: string;
  expiryDate?: Date;
  serialNumbers?: string[];
  locationId?: string;
  notes?: string;
}

export interface GoodsIssueNote {
  id: string;
  ginNumber: string;
  issueType: 'department' | 'project' | 'maintenance' | 'consumption' | 'transfer' | 'other';
  departmentId?: string;
  projectId?: string;
  warehouseId: string;
  warehouse: Warehouse;
  issueDate: Date;
  requestedBy: string;
  issuedBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  lines: GoodsIssueLine[];
  status: 'draft' | 'approved' | 'issued' | 'cancelled';
  totalValue: number;
  purpose: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoodsIssueLine {
  id: string;
  lineNumber: number;
  itemId: string;
  item: Item;
  requestedQuantity: number;
  issuedQuantity: number;
  unitCost: number;
  lineTotal: number;
  batchNumber?: string;
  serialNumbers?: string[];
  locationId?: string;
  notes?: string;
}

export interface BatchTracking {
  id: string;
  batchNumber: string;
  itemId: string;
  item: Item;
  warehouseId: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  supplierBatch?: string;
  quantity: number;
  availableQuantity: number;
  unitCost: number;
  status: 'active' | 'expired' | 'recalled' | 'consumed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerialTracking {
  id: string;
  serialNumber: string;
  itemId: string;
  item: Item;
  warehouseId: string;
  status: 'available' | 'issued' | 'damaged' | 'returned' | 'disposed';
  currentLocation?: string;
  assignedTo?: string;
  assignedDate?: Date;
  warrantyExpiry?: Date;
  notes?: string;
  history: SerialHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SerialHistory {
  id: string;
  action: 'received' | 'issued' | 'returned' | 'transferred' | 'damaged' | 'repaired' | 'disposed';
  date: Date;
  fromLocation?: string;
  toLocation?: string;
  performedBy: string;
  notes?: string;
}

export interface StockValuation {
  id: string;
  itemId: string;
  item: Item;
  warehouseId: string;
  valuationDate: Date;
  method: 'FIFO' | 'LIFO' | 'weighted_average' | 'standard_cost';
  quantity: number;
  unitCost: number;
  totalValue: number;
  layers: StockLayer[];
  createdAt: Date;
}

export interface StockLayer {
  id: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receiptDate: Date;
  batchNumber?: string;
  consumed: number;
  remaining: number;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  fromWarehouse: Warehouse;
  toWarehouseId: string;
  toWarehouse: Warehouse;
  transferDate: Date;
  requestedBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  lines: StockTransferLine[];
  status: 'draft' | 'approved' | 'in_transit' | 'received' | 'cancelled';
  totalValue: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockTransferLine {
  id: string;
  lineNumber: number;
  itemId: string;
  item: Item;
  requestedQuantity: number;
  transferredQuantity: number;
  receivedQuantity?: number;
  unitCost: number;
  lineTotal: number;
  batchNumber?: string;
  serialNumbers?: string[];
  notes?: string;
}

export interface ReorderAlert {
  id: string;
  itemId: string;
  item: Item;
  warehouseId: string;
  warehouse: Warehouse;
  currentStock: number;
  reorderLevel: number;
  suggestedOrderQuantity: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  alertDate: Date;
  status: 'active' | 'acknowledged' | 'ordered' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedDate?: Date;
  notes?: string;
}

export interface ExpiryAlert {
  id: string;
  itemId: string;
  item: Item;
  batchId: string;
  batch: BatchTracking;
  warehouseId: string;
  warehouse: Warehouse;
  expiryDate: Date;
  daysToExpiry: number;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  alertDate: Date;
  status: 'active' | 'acknowledged' | 'disposed' | 'consumed';
  acknowledgedBy?: string;
  acknowledgedDate?: Date;
  action?: 'consume_first' | 'return_supplier' | 'dispose' | 'donate';
  notes?: string;
}

// Sales types
export interface SalesOrder {
  id: string;
  number: string;
  customerId: string;
  customer: BusinessPartner;
  date: Date;
  dueDate?: Date;
  status: 'draft' | 'open' | 'delivered' | 'closed' | 'cancelled';
  lines: SalesOrderLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  paymentTerms?: PaymentTerms;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesOrderLine {
  id: string;
  lineNumber: number;
  itemId: string;
  item: Item;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  warehouseId: string;
  deliveryDate?: Date;
  notes?: string;
}

// Purchase types
export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  supplier: BusinessPartner;
  date: Date;
  dueDate?: Date;
  status: 'draft' | 'open' | 'received' | 'closed' | 'cancelled';
  lines: PurchaseOrderLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  paymentTerms?: PaymentTerms;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderLine {
  id: string;
  lineNumber: number;
  itemId: string;
  item: Item;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  warehouseId: string;
  expectedDate?: Date;
  receivedQuantity: number;
  notes?: string;
}

// Financial types
export interface PaymentTerms {
  id: string;
  name: string;
  days: number;
  discountPercent?: number;
  discountDays?: number;
}

// INES-Ruhengeri Specific Types

// Student Account types
export interface Student {
  id: string;
  studentId: string; // Registration number
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  program: AcademicProgram;
  level: string; // Year 1, Year 2, etc.
  academicYear: string;
  enrollmentDate: Date;
  status: 'active' | 'suspended' | 'graduated' | 'withdrawn';
  guardianInfo?: GuardianInfo;
  address?: Address;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  department: string;
  duration: number; // in years
  tuitionFee: number;
  isActive: boolean;
}

export interface GuardianInfo {
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface StudentBilling {
  id: string;
  studentId: string;
  student: Student;
  academicYear: string;
  term: 'term1' | 'term2' | 'term3';
  tuitionFee: number;
  otherFees: FeeItem[];
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: Date;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  penalties: PenaltyItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FeeItem {
  id: string;
  name: string;
  description?: string;
  amount: number;
  category: 'tuition' | 'accommodation' | 'meals' | 'library' | 'laboratory' | 'examination' | 'other';
  isOptional: boolean;
}

export interface PenaltyItem {
  id: string;
  type: 'late_payment' | 'bounced_check' | 'other';
  description: string;
  amount: number;
  appliedDate: Date;
  waived: boolean;
  waivedBy?: string;
  waivedDate?: Date;
  waivedReason?: string;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  billingId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque' | 'card';
  paymentReference?: string;
  paymentDate: Date;
  receivedBy: string;
  notes?: string;
  receiptNumber: string;
  isReversed: boolean;
  reversedBy?: string;
  reversedDate?: Date;
  reversedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentStatement {
  studentId: string;
  student: Student;
  periodFrom: Date;
  periodTo: Date;
  openingBalance: number;
  charges: StudentBilling[];
  payments: StudentPayment[];
  closingBalance: number;
  generatedAt: Date;
  generatedBy: string;
}

// Project Account types
export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  donor: Donor;
  projectManager: string;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  approvedBudget: number;
  spentAmount: number;
  remainingBudget: number;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  milestones: ProjectMilestone[];
  budgetCategories: ProjectBudgetCategory[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Donor {
  id: string;
  name: string;
  type: 'government' | 'ngo' | 'private' | 'international' | 'individual';
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: Address;
  isActive: boolean;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  targetDate: Date;
  completionDate?: Date;
  budgetAllocation: number;
  disbursedAmount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  deliverables: string[];
  isActive: boolean;
}

export interface ProjectBudgetCategory {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  category: 'personnel' | 'equipment' | 'supplies' | 'travel' | 'training' | 'overhead' | 'other';
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  project: Project;
  milestoneId?: string;
  budgetCategoryId: string;
  description: string;
  amount: number;
  expenseDate: Date;
  vendor?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  approvedBy?: string;
  approvedDate?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  attachments: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDisbursement {
  id: string;
  projectId: string;
  milestoneId?: string;
  amount: number;
  disbursementDate: Date;
  disbursementMethod: 'bank_transfer' | 'cheque' | 'cash';
  reference: string;
  requestedBy: string;
  approvedBy: string;
  notes?: string;
  status: 'requested' | 'approved' | 'disbursed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Utility & Special Accounts types
export interface UtilityAccount {
  id: string;
  name: string;
  type: 'electricity' | 'water' | 'internet' | 'telephone' | 'gas' | 'waste_management' | 'security' | 'other';
  provider: string;
  accountNumber: string;
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UtilityBill {
  id: string;
  utilityAccountId: string;
  utilityAccount: UtilityAccount;
  billNumber: string;
  billingPeriodFrom: Date;
  billingPeriodTo: Date;
  previousReading?: number;
  currentReading?: number;
  unitsConsumed?: number;
  unitRate?: number;
  fixedCharges: number;
  variableCharges: number;
  taxes: number;
  totalAmount: number;
  dueDate: Date;
  paidDate?: Date;
  paidAmount?: number;
  status: 'pending' | 'paid' | 'overdue' | 'disputed';
  paymentMethod?: string;
  paymentReference?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringPayment {
  id: string;
  name: string;
  description?: string;
  payee: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  startDate: Date;
  endDate?: Date;
  nextPaymentDate: Date;
  lastPaymentDate?: Date;
  paymentMethod: 'bank_transfer' | 'cheque' | 'cash' | 'mobile_money';
  accountId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentalExpense {
  id: string;
  department: Department;
  expenseCategory: string;
  description: string;
  amount: number;
  expenseDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  vendor?: string;
  invoiceNumber?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  budgetAllocation?: number;
  remainingBudget?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  budget?: number;
  spentAmount?: number;
  isActive: boolean;
}

// Double Entry Accounting types
export interface ChartOfAccounts {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  accountSubType: string;
  parentAccountId?: string;
  level: number;
  isActive: boolean;
  balance: number;
  debitBalance: number;
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: Date;
  description: string;
  reference?: string;
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  entryType: 'manual' | 'automatic' | 'adjustment' | 'closing';
  source: 'general' | 'sales' | 'purchase' | 'payroll' | 'bank' | 'inventory';
  lines: JournalEntryLine[];
  createdBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  reversedBy?: string;
  reversedDate?: Date;
  reversedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  lineNumber: number;
  accountId: string;
  account: ChartOfAccounts;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  reference?: string;
}

export interface TrialBalance {
  id: string;
  periodFrom: Date;
  periodTo: Date;
  accounts: TrialBalanceAccount[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  generatedAt: Date;
  generatedBy: string;
}

export interface TrialBalanceAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  openingBalance: number;
  debitMovements: number;
  creditMovements: number;
  closingBalance: number;
}

export interface IncomeStatement {
  id: string;
  periodFrom: Date;
  periodTo: Date;
  revenue: IncomeStatementSection;
  expenses: IncomeStatementSection;
  netIncome: number;
  generatedAt: Date;
  generatedBy: string;
}

export interface IncomeStatementSection {
  total: number;
  categories: IncomeStatementCategory[];
}

export interface IncomeStatementCategory {
  name: string;
  amount: number;
  accounts: IncomeStatementAccount[];
}

export interface IncomeStatementAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface BalanceSheet {
  id: string;
  asOfDate: Date;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  generatedAt: Date;
  generatedBy: string;
}

export interface BalanceSheetSection {
  total: number;
  categories: BalanceSheetCategory[];
}

export interface BalanceSheetCategory {
  name: string;
  amount: number;
  accounts: BalanceSheetAccount[];
}

export interface BalanceSheetAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
}

// Cash Flow Statement Types
export interface CashFlowStatement {
  id: string;
  periodFrom: Date;
  periodTo: Date;
  operatingActivities: CashFlowSection;
  investingActivities: CashFlowSection;
  financingActivities: CashFlowSection;
  netCashFlow: number;
  openingCashBalance: number;
  closingCashBalance: number;
  generatedAt: Date;
  generatedBy: string;
}

export interface CashFlowSection {
  total: number;
  items: CashFlowItem[];
}

export interface CashFlowItem {
  description: string;
  amount: number;
  type: 'inflow' | 'outflow';
}

// General Ledger Types
export interface GeneralLedger {
  id: string;
  accountId: string;
  account: ChartOfAccounts;
  periodFrom: Date;
  periodTo: Date;
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  entries: GeneralLedgerEntry[];
  generatedAt: Date;
  generatedBy: string;
}

export interface GeneralLedgerEntry {
  id: string;
  entryDate: Date;
  journalEntryId: string;
  journalEntryNumber: string;
  description: string;
  reference?: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
}

// Period Closing Types
export interface AccountingPeriod {
  id: string;
  periodName: string;
  periodType: 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  status: 'open' | 'closed' | 'locked';
  closedBy?: string;
  closedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodClosing {
  id: string;
  periodId: string;
  period: AccountingPeriod;
  closingDate: Date;
  closedBy: string;
  trialBalanceId: string;
  incomeStatementId: string;
  balanceSheetId: string;
  closingEntries: JournalEntry[];
  status: 'in_progress' | 'completed' | 'reversed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Budget Types
export interface Budget {
  id: string;
  budgetName: string;
  budgetType: 'annual' | 'quarterly' | 'monthly' | 'project';
  fiscalYear: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'approved' | 'active' | 'closed';
  totalBudget: number;
  approvedBy?: string;
  approvedDate?: Date;
  lines: BudgetLine[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetLine {
  id: string;
  budgetId: string;
  accountId: string;
  account: ChartOfAccounts;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  notes?: string;
}

// Bank Reconciliation Types
export interface BankAccount {
  id: string;
  accountCode: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit' | 'other';
  currency: string;
  isActive: boolean;
  openingBalance: number;
  currentBalance: number;
  reconciledBalance: number;
  lastReconciledDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankReconciliation {
  id: string;
  bankAccountId: string;
  bankAccount: BankAccount;
  reconciliationDate: Date;
  statementDate: Date;
  statementBalance: number;
  bookBalance: number;
  reconciledBalance: number;
  status: 'draft' | 'completed' | 'approved';
  outstandingDeposits: BankTransaction[];
  outstandingChecks: BankTransaction[];
  bankCharges: BankTransaction[];
  interestEarned: BankTransaction[];
  adjustments: BankTransaction[];
  reconciledBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankTransaction {
  id: string;
  transactionDate: Date;
  description: string;
  reference?: string;
  debitAmount: number;
  creditAmount: number;
  isReconciled: boolean;
  reconciledDate?: Date;
  notes?: string;
}

// Payables & Receivables Types
export interface AccountsPayable {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendor: BusinessPartner;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms: string;
  description?: string;
  reference?: string;
  daysOverdue?: number;
  purchaseOrderId?: string;
  approvedBy?: string;
  approvedDate?: Date;
  lines: AccountsPayableLine[];
  payments: VendorPayment[];
  attachments: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountsPayableLine {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  accountId?: string;
  projectId?: string;
  departmentId?: string;
  notes?: string;
}

export interface AccountsReceivable {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: BusinessPartner;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'pending' | 'invoiced' | 'paid' | 'overdue' | 'written_off';
  paymentTerms: string;
  description?: string;
  reference?: string;
  daysOverdue?: number;
  salesOrderId?: string;
  approvedBy?: string;
  approvedDate?: Date;
  lines: AccountsReceivableLine[];
  payments: CustomerPayment[];
  attachments: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountsReceivableLine {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  accountId?: string;
  projectId?: string;
  departmentId?: string;
  notes?: string;
}

export interface VendorPayment {
  id: string;
  paymentNumber: string;
  vendorId: string;
  vendor: BusinessPartner;
  paymentDate: Date;
  amount: number;
  paymentMethod: 'bank_transfer' | 'cheque' | 'mobile_money' | 'cash' | 'other';
  reference?: string;
  bankAccountId?: string;
  status: 'pending' | 'approved' | 'processed' | 'cancelled';
  description?: string;
  invoices: AccountsPayable[];
  approvedBy?: string;
  approvedDate?: Date;
  processedBy?: string;
  processedDate?: Date;
  attachments: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerPayment {
  id: string;
  paymentNumber: string;
  customerId: string;
  customer: BusinessPartner;
  paymentDate: Date;
  amount: number;
  paymentMethod: 'bank_transfer' | 'cheque' | 'mobile_money' | 'cash' | 'card' | 'other';
  reference?: string;
  bankAccountId?: string;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  description?: string;
  invoices: AccountsReceivable[];
  processedBy?: string;
  processedDate?: Date;
  attachments: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Ageing Analysis Types
export interface AgeingAnalysis {
  id: string;
  analysisType: 'receivables' | 'payables';
  asOfDate: Date;
  summary: AgeingSummary;
  details: AgeingDetail[];
  generatedAt: Date;
  generatedBy: string;
}

export interface AgeingSummary {
  totalAmount: number;
  current: number;
  days0to30: number;
  days31to60: number;
  days61to90: number;
  daysOver90: number;
}

export interface AgeingDetail {
  customerId?: string;
  vendorId?: string;
  name: string;
  totalAmount: number;
  current: number;
  days0to30: number;
  days31to60: number;
  days61to90: number;
  daysOver90: number;
  invoices: AgeingInvoice[];
}

export interface AgeingInvoice {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  amount: number;
  daysOverdue: number;
  ageingBucket: 'current' | '0-30' | '31-60' | '61-90' | '90+';
}

// Billing, Invoicing & Receipting Types (RRA-compliant)
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: BusinessPartner;
  invoiceDate: Date;
  dueDate: Date;
  invoiceType: 'tuition' | 'training' | 'consultancy' | 'other';
  currency: string;
  exchangeRate?: number;
  subtotalAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms: string;
  description?: string;
  reference?: string;
  isRRACompliant: boolean;
  rraReceiptNumber?: string;
  lines: InvoiceLine[];
  payments: InvoicePayment[];
  attachments: string[];
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  sentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLine {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  vatRate: number;
  vatAmount: number;
  accountId?: string;
  projectId?: string;
  departmentId?: string;
  notes?: string;
}

export interface InvoicePayment {
  id: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: 'bank_transfer' | 'cheque' | 'mobile_money' | 'cash' | 'card' | 'other';
  reference?: string;
  notes?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  invoiceId?: string;
  invoice?: Invoice;
  customerId: string;
  customer: BusinessPartner;
  receiptDate: Date;
  amount: number;
  paymentMethod: 'bank_transfer' | 'cheque' | 'mobile_money' | 'cash' | 'card' | 'other';
  reference?: string;
  description: string;
  isRRACompliant: boolean;
  rraReceiptNumber?: string;
  vatAmount?: number;
  currency: string;
  exchangeRate?: number;
  status: 'issued' | 'cancelled';
  attachments: string[];
  notes?: string;
  issuedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// RRA Compliance Types
export interface RRACompliance {
  id: string;
  reportType: 'vat_return' | 'income_tax' | 'withholding_tax' | 'annual_return';
  periodName: string;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  totalSales: number;
  vatAmount: number;
  invoiceCount: number;
  status: 'pending' | 'submitted' | 'compliant' | 'non_compliant';
  submittedDate?: Date;
  submittedBy?: string;
  rraReference?: string;
  reportData: RRAReportData;
  attachments: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RRAReportData {
  totalSales: number;
  exemptSales: number;
  taxableSales: number;
  vatCollected: number;
  vatPaid: number;
  netVAT: number;
  penalties?: number;
  interest?: number;
  totalDue: number;
  invoices: RRAInvoiceData[];
}

export interface RRAInvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerTIN?: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  rraReceiptNumber?: string;
}

export interface VATReturn {
  id: string;
  periodMonth: number;
  periodYear: number;
  dueDate: Date;
  totalSales: number;
  exemptSales: number;
  taxableSales: number;
  outputVAT: number;
  inputVAT: number;
  netVAT: number;
  penalties: number;
  interest: number;
  totalDue: number;
  status: 'draft' | 'submitted' | 'paid' | 'overdue';
  submittedDate?: Date;
  paidDate?: Date;
  rraReference?: string;
  attachments: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxConfiguration {
  id: string;
  taxType: 'vat' | 'income_tax' | 'withholding_tax';
  taxName: string;
  taxRate: number;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  description?: string;
  rraCode?: string;
  applicableServices: string[];
  exemptions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Payroll & HR Types
export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  nationalId: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: Address;
  emergencyContact: EmergencyContact;
  department: Department;
  position: Position;
  employmentType: 'permanent' | 'contract' | 'temporary' | 'intern';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'terminated' | 'suspended';
  bankAccount: BankAccountInfo;
  taxInfo: EmployeeTaxInfo;
  socialSecurity: SocialSecurityInfo;
  salary: SalaryInfo;
  benefits: EmployeeBenefit[];
  documents: EmployeeDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  managerId?: string;
  manager?: Employee;
  costCenter?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  code: string;
  title: string;
  description?: string;
  departmentId: string;
  department: Department;
  level: number;
  minSalary: number;
  maxSalary: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branchCode?: string;
  swiftCode?: string;
}

export interface EmployeeTaxInfo {
  tinNumber?: string;
  taxExempt: boolean;
  exemptionReason?: string;
  payeRate: number;
  additionalTax?: number;
}

export interface SocialSecurityInfo {
  rssb: {
    number: string;
    employeeContribution: number;
    employerContribution: number;
  };
  medicalInsurance: {
    provider?: string;
    policyNumber?: string;
    premium?: number;
  };
}

export interface SalaryInfo {
  basicSalary: number;
  currency: string;
  payFrequency: 'monthly' | 'bi_weekly' | 'weekly';
  effectiveDate: Date;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
}

export interface EmployeeBenefit {
  id: string;
  benefitType: 'allowance' | 'bonus' | 'commission' | 'overtime' | 'other';
  name: string;
  amount: number;
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'annually';
  isTaxable: boolean;
  effectiveDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface EmployeeDocument {
  id: string;
  documentType: 'contract' | 'id_copy' | 'cv' | 'certificate' | 'other';
  fileName: string;
  filePath: string;
  uploadDate: Date;
  expiryDate?: Date;
  notes?: string;
}

export interface Payroll {
  id: string;
  payrollNumber: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
  status: 'draft' | 'calculated' | 'approved' | 'paid' | 'cancelled';
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  payslips: Payslip[];
  approvedBy?: string;
  approvedDate?: Date;
  paidBy?: string;
  paidDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payslip {
  id: string;
  payrollId: string;
  employeeId: string;
  employee: Employee;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
  basicSalary: number;
  allowances: PayslipItem[];
  deductions: PayslipItem[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  taxableIncome: number;
  paye: number;
  rssb: number;
  workingDays: number;
  actualDays: number;
  overtimeHours?: number;
  overtimePay?: number;
  leaveDeduction?: number;
  status: 'draft' | 'generated' | 'sent' | 'acknowledged';
  generatedAt: Date;
  sentAt?: Date;
  acknowledgedAt?: Date;
  notes?: string;
}

export interface PayslipItem {
  id: string;
  type: 'allowance' | 'deduction';
  name: string;
  amount: number;
  isTaxable: boolean;
  isStatutory: boolean;
  description?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  maxDaysPerYear: number;
  carryForward: boolean;
  maxCarryForward?: number;
  isPaid: boolean;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee: Employee;
  leaveTypeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  attachments: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employee: Employee;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  workingHours: number;
  overtimeHours: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Procurement & Supply Chain Types
export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  requestDate: Date;
  requestedBy: string;
  department: Department;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted' | 'cancelled';
  totalAmount: number;
  currency: string;
  justification: string;
  budgetCode?: string;
  expectedDeliveryDate?: Date;
  items: PurchaseRequestItem[];
  approvals: PurchaseApproval[];
  attachments: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRequestItem {
  id: string;
  lineNumber: number;
  itemId?: string;
  item?: Item;
  description: string;
  specification?: string;
  quantity: number;
  unitOfMeasure: string;
  estimatedUnitPrice: number;
  estimatedTotal: number;
  budgetCode?: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: Date;
  vendorId: string;
  vendor: BusinessPartner;
  requestId?: string;
  request?: PurchaseRequest;
  status: 'draft' | 'sent' | 'acknowledged' | 'partially_received' | 'completed' | 'cancelled';
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  currency: string;
  paymentTerms: string;
  deliveryDate: Date;
  deliveryAddress: string;
  items: PurchaseOrderItem[];
  receipts: GoodsReceiptNote[];
  invoices: AccountsPayable[];
  approvals: PurchaseApproval[];
  attachments: string[];
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  sentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  lineNumber: number;
  itemId?: string;
  item?: Item;
  description: string;
  specification?: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  lineTotal: number;
  vatRate: number;
  vatAmount: number;
  receivedQuantity: number;
  pendingQuantity: number;
  budgetCode?: string;
  notes?: string;
}

export interface PurchaseApproval {
  id: string;
  level: number;
  approverRole: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedDate?: Date;
  comments?: string;
  isRequired: boolean;
}

export interface Vendor extends BusinessPartner {
  vendorCode: string;
  vendorType: 'goods' | 'services' | 'both';
  paymentTerms: string;
  creditLimit?: number;
  taxId?: string;
  bankDetails?: BankAccountInfo;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  rating: number;
  isPreferred: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  categories: VendorCategory[];
  documents: VendorDocument[];
  evaluations: VendorEvaluation[];
}

export interface VendorCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface VendorDocument {
  id: string;
  documentType: 'registration' | 'tax_clearance' | 'insurance' | 'bank_statement' | 'other';
  fileName: string;
  filePath: string;
  uploadDate: Date;
  expiryDate?: Date;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
  notes?: string;
}

export interface VendorEvaluation {
  id: string;
  evaluationDate: Date;
  evaluatedBy: string;
  qualityScore: number;
  deliveryScore: number;
  serviceScore: number;
  priceScore: number;
  overallScore: number;
  comments?: string;
  recommendations?: string;
}

export interface RequestForQuotation {
  id: string;
  rfqNumber: string;
  rfqDate: Date;
  title: string;
  description: string;
  requestId?: string;
  request?: PurchaseRequest;
  status: 'draft' | 'sent' | 'responses_received' | 'evaluated' | 'awarded' | 'cancelled';
  submissionDeadline: Date;
  vendors: string[];
  items: RFQItem[];
  quotations: Quotation[];
  evaluation?: QuotationEvaluation;
  attachments: string[];
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RFQItem {
  id: string;
  lineNumber: number;
  description: string;
  specification: string;
  quantity: number;
  unitOfMeasure: string;
  deliveryDate: Date;
  notes?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  rfqId: string;
  rfq: RequestForQuotation;
  vendorId: string;
  vendor: BusinessPartner;
  quotationDate: Date;
  validUntil: Date;
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  items: QuotationItem[];
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  attachments: string[];
  notes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface QuotationItem {
  id: string;
  lineNumber: number;
  rfqItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  deliveryDate: Date;
  notes?: string;
}

export interface QuotationEvaluation {
  id: string;
  rfqId: string;
  evaluatedBy: string;
  evaluationDate: Date;
  criteria: EvaluationCriteria[];
  vendorScores: VendorScore[];
  recommendedVendor?: string;
  justification: string;
  notes?: string;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number;
  description?: string;
}

export interface VendorScore {
  vendorId: string;
  vendor: BusinessPartner;
  criteriaScores: CriteriaScore[];
  totalScore: number;
  rank: number;
  isRecommended: boolean;
}

export interface CriteriaScore {
  criteriaId: string;
  score: number;
  weightedScore: number;
  comments?: string;
}

export interface BudgetComparison {
  id: string;
  budgetCode: string;
  budgetName: string;
  allocatedAmount: number;
  committedAmount: number;
  spentAmount: number;
  availableAmount: number;
  utilizationPercentage: number;
  period: string;
  department?: string;
  project?: string;
}

// Fixed Assets & Asset Management Types
export interface FixedAsset {
  id: string;
  assetNumber: string;
  assetName: string;
  description?: string;
  assetCategory: AssetCategory;
  assetType: 'tangible' | 'intangible';
  acquisitionDate: Date;
  acquisitionCost: number;
  currentValue: number;
  depreciatedValue: number;
  residualValue: number;
  usefulLife: number;
  depreciationMethod: 'straight_line' | 'declining_balance' | 'units_of_production';
  depreciationRate: number;
  status: 'active' | 'disposed' | 'under_maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  location: AssetLocation;
  custodian: Employee;
  department: Department;
  supplier?: BusinessPartner;
  purchaseOrderId?: string;
  warrantyInfo?: WarrantyInfo;
  insuranceInfo?: InsuranceInfo;
  maintenanceSchedule?: MaintenanceSchedule[];
  depreciationHistory: DepreciationEntry[];
  movements: AssetMovement[];
  valuations: AssetValuation[];
  documents: AssetDocument[];
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  parentCategory?: AssetCategory;
  depreciationMethod: 'straight_line' | 'declining_balance' | 'units_of_production';
  defaultUsefulLife: number;
  defaultDepreciationRate: number;
  accountCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetLocation {
  id: string;
  code: string;
  name: string;
  description?: string;
  building?: string;
  floor?: string;
  room?: string;
  address?: Address;
  parentLocationId?: string;
  parentLocation?: AssetLocation;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarrantyInfo {
  provider: string;
  startDate: Date;
  endDate: Date;
  terms: string;
  contactInfo?: string;
  isActive: boolean;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  startDate: Date;
  endDate: Date;
  coverageAmount: number;
  premium: number;
  contactInfo?: string;
  isActive: boolean;
}

export interface MaintenanceSchedule {
  id: string;
  maintenanceType: 'preventive' | 'corrective' | 'emergency';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  description: string;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate: Date;
  estimatedCost: number;
  isActive: boolean;
}

export interface DepreciationEntry {
  id: string;
  assetId: string;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  openingValue: number;
  depreciationAmount: number;
  closingValue: number;
  method: 'straight_line' | 'declining_balance' | 'units_of_production';
  rate: number;
  calculatedAt: Date;
  calculatedBy: string;
}

export interface AssetMovement {
  id: string;
  assetId: string;
  movementType: 'transfer' | 'disposal' | 'maintenance' | 'return';
  movementDate: Date;
  fromLocationId?: string;
  fromLocation?: AssetLocation;
  toLocationId?: string;
  toLocation?: AssetLocation;
  fromCustodianId?: string;
  fromCustodian?: Employee;
  toCustodianId?: string;
  toCustodian?: Employee;
  reason: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  notes?: string;
  approvedBy: string;
  approvedDate: Date;
  createdBy: string;
  createdAt: Date;
}

export interface AssetValuation {
  id: string;
  assetId: string;
  valuationDate: Date;
  valuationType: 'market' | 'replacement' | 'insurance' | 'disposal';
  valuedAmount: number;
  valuedBy: string;
  valuationMethod: string;
  notes?: string;
  attachments: string[];
  createdAt: Date;
}

export interface AssetDocument {
  id: string;
  documentType: 'purchase_invoice' | 'warranty' | 'insurance' | 'manual' | 'certificate' | 'other';
  fileName: string;
  filePath: string;
  uploadDate: Date;
  expiryDate?: Date;
  notes?: string;
}

export interface AssetMaintenance {
  id: string;
  assetId: string;
  asset: FixedAsset;
  maintenanceNumber: string;
  maintenanceType: 'preventive' | 'corrective' | 'emergency';
  scheduledDate: Date;
  actualDate?: Date;
  description: string;
  workPerformed?: string;
  cost: number;
  vendor?: BusinessPartner;
  technician: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  downtime?: number;
  partsUsed: MaintenancePart[];
  attachments: string[];
  notes?: string;
  createdBy: string;
  completedBy?: string;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenancePart {
  id: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
}

export interface AssetDisposal {
  id: string;
  assetId: string;
  asset: FixedAsset;
  disposalNumber: string;
  disposalDate: Date;
  disposalMethod: 'sale' | 'donation' | 'scrap' | 'trade_in' | 'destruction';
  disposalReason: string;
  bookValue: number;
  disposalValue: number;
  gainLoss: number;
  buyer?: string;
  buyerContact?: string;
  approvedBy: string;
  approvedDate: Date;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  attachments: string[];
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetAudit {
  id: string;
  auditNumber: string;
  auditDate: Date;
  auditType: 'physical' | 'financial' | 'compliance' | 'full';
  auditScope: string;
  auditor: string;
  status: 'planned' | 'in_progress' | 'completed' | 'reported';
  totalAssetsAudited: number;
  assetsFound: number;
  assetsMissing: number;
  assetsDiscrepant: number;
  findings: AuditFinding[];
  recommendations: string[];
  reportPath?: string;
  completedDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditFinding {
  id: string;
  assetId: string;
  asset: FixedAsset;
  findingType: 'missing' | 'damaged' | 'location_mismatch' | 'custodian_mismatch' | 'value_discrepancy';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolvedBy?: string;
  resolvedDate?: Date;
  notes?: string;
}

// Comprehensive Financial Reporting Types
export interface FinancialReport {
  id: string;
  reportType: 'income_statement' | 'balance_sheet' | 'cash_flow' | 'trial_balance' | 'budget_variance' | 'custom';
  reportName: string;
  description?: string;
  periodType: 'monthly' | 'quarterly' | 'annually' | 'custom';
  periodStart: Date;
  periodEnd: Date;
  status: 'draft' | 'generated' | 'reviewed' | 'approved' | 'published';
  reportData: any;
  generatedBy: string;
  generatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  publishedAt?: Date;
  filePath?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeStatement {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  revenue: RevenueSection;
  expenses: ExpenseSection;
  netIncome: number;
  generatedAt: Date;
  generatedBy: string;
}

export interface RevenueSection {
  tuitionFees: number;
  trainingRevenue: number;
  consultancyRevenue: number;
  grantRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
}

export interface ExpenseSection {
  salariesAndWages: number;
  benefits: number;
  utilities: number;
  maintenance: number;
  supplies: number;
  depreciation: number;
  professionalServices: number;
  travelAndTransport: number;
  otherExpenses: number;
  totalExpenses: number;
}

export interface BalanceSheet {
  id: string;
  asOfDate: Date;
  currency: string;
  assets: AssetsSection;
  liabilities: LiabilitiesSection;
  equity: EquitySection;
  generatedAt: Date;
  generatedBy: string;
}

export interface AssetsSection {
  currentAssets: CurrentAssets;
  nonCurrentAssets: NonCurrentAssets;
  totalAssets: number;
}

export interface CurrentAssets {
  cash: number;
  accountsReceivable: number;
  inventory: number;
  prepaidExpenses: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;
}

export interface NonCurrentAssets {
  fixedAssets: number;
  accumulatedDepreciation: number;
  netFixedAssets: number;
  investments: number;
  otherNonCurrentAssets: number;
  totalNonCurrentAssets: number;
}

export interface LiabilitiesSection {
  currentLiabilities: CurrentLiabilities;
  nonCurrentLiabilities: NonCurrentLiabilities;
  totalLiabilities: number;
}

export interface CurrentLiabilities {
  accountsPayable: number;
  accruedExpenses: number;
  shortTermDebt: number;
  deferredRevenue: number;
  otherCurrentLiabilities: number;
  totalCurrentLiabilities: number;
}

export interface NonCurrentLiabilities {
  longTermDebt: number;
  deferredTaxLiabilities: number;
  otherNonCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
}

export interface EquitySection {
  retainedEarnings: number;
  currentYearEarnings: number;
  reserves: number;
  totalEquity: number;
}

export interface CashFlowStatement {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  operatingActivities: OperatingActivities;
  investingActivities: InvestingActivities;
  financingActivities: FinancingActivities;
  netCashFlow: number;
  openingCashBalance: number;
  closingCashBalance: number;
  generatedAt: Date;
  generatedBy: string;
}

export interface OperatingActivities {
  netIncome: number;
  depreciation: number;
  accountsReceivableChange: number;
  inventoryChange: number;
  accountsPayableChange: number;
  accruedExpensesChange: number;
  otherOperatingChanges: number;
  netCashFromOperating: number;
}

export interface InvestingActivities {
  assetPurchases: number;
  assetSales: number;
  investmentPurchases: number;
  investmentSales: number;
  otherInvestingActivities: number;
  netCashFromInvesting: number;
}

export interface FinancingActivities {
  debtProceeds: number;
  debtRepayments: number;
  equityContributions: number;
  dividendPayments: number;
  otherFinancingActivities: number;
  netCashFromFinancing: number;
}

export interface BudgetVarianceReport {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  revenueVariances: BudgetVarianceSection;
  expenseVariances: BudgetVarianceSection;
  totalVariance: BudgetVarianceItem;
  generatedAt: Date;
  generatedBy: string;
}

export interface BudgetVarianceSection {
  items: BudgetVarianceItem[];
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  totalVariancePercentage: number;
}

export interface BudgetVarianceItem {
  accountCode: string;
  accountName: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  varianceType: 'favorable' | 'unfavorable';
}

export interface FinancialRatio {
  id: string;
  ratioType: 'liquidity' | 'profitability' | 'efficiency' | 'leverage';
  ratioName: string;
  value: number;
  benchmark?: number;
  interpretation: string;
  calculationDate: Date;
}

export interface FinancialDashboard {
  id: string;
  dashboardName: string;
  periodStart: Date;
  periodEnd: Date;
  kpis: FinancialKPI[];
  charts: FinancialChart[];
  summaries: FinancialSummary[];
  generatedAt: Date;
  generatedBy: string;
}

export interface FinancialKPI {
  id: string;
  name: string;
  value: number;
  target?: number;
  previousValue?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export interface FinancialChart {
  id: string;
  chartType: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
}

export interface FinancialSummary {
  id: string;
  title: string;
  description: string;
  value: number;
  change: number;
  changePercentage: number;
  period: string;
}

// Advanced Reporting & Analytics Types
export interface CustomReport {
  id: string;
  reportName: string;
  description?: string;
  reportType: 'tabular' | 'chart' | 'dashboard' | 'pivot';
  category: 'financial' | 'academic' | 'operational' | 'compliance' | 'custom';
  dataSource: string;
  query: ReportQuery;
  visualization: ReportVisualization;
  filters: ReportFilter[];
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  recipients: string[];
  isPublic: boolean;
  tags: string[];
  createdBy: string;
  lastRunAt?: Date;
  nextRunAt?: Date;
  status: 'active' | 'inactive' | 'draft' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportQuery {
  tables: string[];
  fields: ReportField[];
  joins: ReportJoin[];
  conditions: ReportCondition[];
  groupBy: string[];
  orderBy: ReportOrderBy[];
  limit?: number;
}

export interface ReportField {
  fieldName: string;
  alias?: string;
  aggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'distinct';
  format?: string;
  isVisible: boolean;
}

export interface ReportJoin {
  table: string;
  type: 'inner' | 'left' | 'right' | 'full';
  condition: string;
}

export interface ReportCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between' | 'in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface ReportOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportVisualization {
  type: 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'area_chart' | 'scatter_plot' | 'gauge' | 'kpi';
  title?: string;
  xAxis?: string;
  yAxis?: string;
  colorScheme?: string;
  showLegend: boolean;
  showDataLabels: boolean;
  height?: number;
  width?: number;
}

export interface ReportFilter {
  id: string;
  name: string;
  field: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  defaultValue?: any;
  options?: FilterOption[];
  isRequired: boolean;
  isVisible: boolean;
}

export interface FilterOption {
  label: string;
  value: any;
}

export interface ReportParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  defaultValue?: any;
  description?: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  report: CustomReport;
  executedBy: string;
  executedAt: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  parameters: Record<string, any>;
  resultCount?: number;
  executionTime?: number;
  errorMessage?: string;
  outputPath?: string;
  outputFormat: 'pdf' | 'excel' | 'csv' | 'json';
}

export interface AnalyticsDashboard {
  id: string;
  dashboardName: string;
  description?: string;
  category: 'executive' | 'financial' | 'academic' | 'operational' | 'custom';
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval?: number;
  isPublic: boolean;
  tags: string[];
  createdBy: string;
  lastViewedAt?: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: number;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'kpi' | 'table' | 'text' | 'image' | 'iframe';
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  dataSource?: string;
  query?: string;
  visualization?: ReportVisualization;
  refreshInterval?: number;
  config: Record<string, any>;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date_range' | 'select' | 'multiselect' | 'text';
  field: string;
  defaultValue?: any;
  options?: FilterOption[];
  affectedWidgets: string[];
}

export interface DataVisualization {
  id: string;
  name: string;
  type: 'chart' | 'graph' | 'map' | 'table' | 'pivot';
  dataSource: string;
  config: VisualizationConfig;
  data: any[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisualizationConfig {
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'bubble' | 'radar';
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  series?: SeriesConfig[];
  colors?: string[];
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  animation?: boolean;
  responsive?: boolean;
}

export interface AxisConfig {
  field: string;
  label?: string;
  type?: 'category' | 'value' | 'time';
  format?: string;
  min?: number;
  max?: number;
}

export interface SeriesConfig {
  field: string;
  name?: string;
  type?: string;
  color?: string;
  stack?: string;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
}

export interface TooltipConfig {
  show: boolean;
  format?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  description?: string;
  category: 'financial' | 'academic' | 'operational' | 'compliance';
  value: number;
  target?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changeValue?: number;
  changePercentage?: number;
  period: string;
  calculatedAt: Date;
  calculatedBy: string;
}

export interface DataExport {
  id: string;
  exportName: string;
  dataSource: string;
  format: 'excel' | 'csv' | 'pdf' | 'json' | 'xml';
  filters: Record<string, any>;
  fields: string[];
  recordCount: number;
  fileSize: number;
  filePath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
  downloadCount: number;
  expiresAt?: Date;
}

// System Administration & User Management Types
export interface SystemUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended' | 'locked';
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  failedLoginAttempts: number;
  passwordChangedAt?: Date;
  mustChangePassword: boolean;
  twoFactorEnabled: boolean;
  roles: UserRole[];
  permissions: UserPermission[];
  preferences: UserPreferences;
  sessions: UserSession[];
  auditLogs: UserAuditLog[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: Permission[];
  isSystemRole: boolean;
  isActive: boolean;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
  category: 'system' | 'financial' | 'academic' | 'operational';
  isSystemPermission: boolean;
}

export interface UserPermission {
  id: string;
  userId: string;
  permissionId: string;
  permission: Permission;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  categories: string[];
}

export interface DashboardPreferences {
  defaultPage: string;
  widgetLayout: string;
  refreshInterval: number;
  showWelcomeMessage: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: string;
  isActive: boolean;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
}

export interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  isMobile: boolean;
}

export interface UserAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SystemConfiguration {
  id: string;
  category: 'general' | 'security' | 'email' | 'backup' | 'integration';
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  isEncrypted: boolean;
  isReadOnly: boolean;
  validationRules?: ValidationRule[];
  updatedBy: string;
  updatedAt: Date;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'enum';
  value: any;
  message: string;
}

export interface SystemBackup {
  id: string;
  backupName: string;
  backupType: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  fileSize?: number;
  filePath?: string;
  includedTables: string[];
  excludedTables: string[];
  compression: boolean;
  encryption: boolean;
  errorMessage?: string;
  triggeredBy: 'manual' | 'scheduled' | 'automatic';
  createdBy: string;
  createdAt: Date;
}

export interface SystemLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  category: 'system' | 'security' | 'application' | 'database' | 'api';
  source: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface SystemHealth {
  id: string;
  component: 'database' | 'api' | 'storage' | 'cache' | 'queue' | 'external_service';
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'down';
  responseTime?: number;
  uptime: number;
  lastCheck: Date;
  errorMessage?: string;
  metrics: HealthMetric[];
}

export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  category: 'system' | 'security' | 'maintenance' | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: NotificationRecipient[];
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  status: 'draft' | 'sent' | 'delivered' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionText?: string;
  createdBy: string;
  createdAt: Date;
}

export interface NotificationRecipient {
  type: 'user' | 'role' | 'group';
  id: string;
  name: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: Date;
  readAt?: Date;
}

export interface SystemIntegration {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'file_sync' | 'database' | 'sso';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  configuration: IntegrationConfig;
  lastSync?: Date;
  nextSync?: Date;
  syncFrequency?: string;
  errorCount: number;
  lastError?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationConfig {
  endpoint?: string;
  apiKey?: string;
  credentials?: Record<string, any>;
  settings: Record<string, any>;
  mappings?: FieldMapping[];
  filters?: Record<string, any>;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  isRequired: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  type: 'sales' | 'purchase';
  businessPartnerId: string;
  businessPartner: BusinessPartner;
  date: Date;
  dueDate: Date;
  status: 'draft' | 'open' | 'paid' | 'overdue' | 'cancelled';
  lines: InvoiceLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  paymentTerms?: PaymentTerms;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLine {
  id: string;
  lineNumber: number;
  itemId?: string;
  item?: Item;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
  accountId?: string;
}

// Common utility types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// UI Component types
export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  validation?: any;
}

// Dashboard and Analytics types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  data: any;
  refreshInterval?: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Error types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: any;
}
