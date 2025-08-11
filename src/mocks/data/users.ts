import { User, Role, Permission } from '@/types';

// Mock permissions for INES-Ruhengeri ERP
export const mockPermissions: Permission[] = [
  // Student Accounts permissions
  { id: 'students-create', name: 'Create Student Records', resource: 'students', action: 'create' },
  { id: 'students-read', name: 'Read Student Records', resource: 'students', action: 'read' },
  { id: 'students-update', name: 'Update Student Records', resource: 'students', action: 'update' },
  { id: 'students-delete', name: 'Delete Student Records', resource: 'students', action: 'delete' },
  { id: 'students-billing', name: 'Student Billing', resource: 'students', action: 'create' },

  // Project Accounts permissions
  { id: 'projects-create', name: 'Create Projects', resource: 'projects', action: 'create' },
  { id: 'projects-read', name: 'Read Projects', resource: 'projects', action: 'read' },
  { id: 'projects-update', name: 'Update Projects', resource: 'projects', action: 'update' },
  { id: 'projects-delete', name: 'Delete Projects', resource: 'projects', action: 'delete' },
  { id: 'projects-approve', name: 'Approve Project Budgets', resource: 'projects', action: 'approve' },

  // Utility & Special Accounts permissions
  { id: 'utilities-create', name: 'Create Utility Records', resource: 'utilities', action: 'create' },
  { id: 'utilities-read', name: 'Read Utility Records', resource: 'utilities', action: 'read' },
  { id: 'utilities-update', name: 'Update Utility Records', resource: 'utilities', action: 'update' },
  { id: 'utilities-delete', name: 'Delete Utility Records', resource: 'utilities', action: 'delete' },

  // Stores & Inventory permissions
  { id: 'inventory-create', name: 'Create Inventory', resource: 'inventory', action: 'create' },
  { id: 'inventory-read', name: 'Read Inventory', resource: 'inventory', action: 'read' },
  { id: 'inventory-update', name: 'Update Inventory', resource: 'inventory', action: 'update' },
  { id: 'inventory-delete', name: 'Delete Inventory', resource: 'inventory', action: 'delete' },
  { id: 'inventory-transfer', name: 'Transfer Inventory', resource: 'inventory', action: 'update' },

  // Accounting & Finance permissions
  { id: 'accounting-create', name: 'Create Accounting Entries', resource: 'accounting', action: 'create' },
  { id: 'accounting-read', name: 'Read Accounting Records', resource: 'accounting', action: 'read' },
  { id: 'accounting-update', name: 'Update Accounting Records', resource: 'accounting', action: 'update' },
  { id: 'accounting-delete', name: 'Delete Accounting Records', resource: 'accounting', action: 'delete' },
  { id: 'accounting-approve', name: 'Approve Accounting Entries', resource: 'accounting', action: 'approve' },

  // Payables & Receivables permissions
  { id: 'payables-create', name: 'Create Payables', resource: 'payables', action: 'create' },
  { id: 'payables-read', name: 'Read Payables', resource: 'payables', action: 'read' },
  { id: 'payables-update', name: 'Update Payables', resource: 'payables', action: 'update' },
  { id: 'payables-delete', name: 'Delete Payables', resource: 'payables', action: 'delete' },
  { id: 'receivables-create', name: 'Create Receivables', resource: 'receivables', action: 'create' },
  { id: 'receivables-read', name: 'Read Receivables', resource: 'receivables', action: 'read' },
  { id: 'receivables-update', name: 'Update Receivables', resource: 'receivables', action: 'update' },
  { id: 'receivables-delete', name: 'Delete Receivables', resource: 'receivables', action: 'delete' },

  // Billing & Invoicing permissions
  { id: 'billing-create', name: 'Create Invoices', resource: 'billing', action: 'create' },
  { id: 'billing-read', name: 'Read Invoices', resource: 'billing', action: 'read' },
  { id: 'billing-update', name: 'Update Invoices', resource: 'billing', action: 'update' },
  { id: 'billing-delete', name: 'Delete Invoices', resource: 'billing', action: 'delete' },

  // Payroll permissions
  { id: 'payroll-create', name: 'Create Payroll', resource: 'payroll', action: 'create' },
  { id: 'payroll-read', name: 'Read Payroll', resource: 'payroll', action: 'read' },
  { id: 'payroll-update', name: 'Update Payroll', resource: 'payroll', action: 'update' },
  { id: 'payroll-delete', name: 'Delete Payroll', resource: 'payroll', action: 'delete' },
  { id: 'payroll-approve', name: 'Approve Payroll', resource: 'payroll', action: 'approve' },

  // Procurement permissions
  { id: 'procurement-create', name: 'Create Procurement', resource: 'procurement', action: 'create' },
  { id: 'procurement-read', name: 'Read Procurement', resource: 'procurement', action: 'read' },
  { id: 'procurement-update', name: 'Update Procurement', resource: 'procurement', action: 'update' },
  { id: 'procurement-delete', name: 'Delete Procurement', resource: 'procurement', action: 'delete' },
  { id: 'procurement-approve', name: 'Approve Procurement', resource: 'procurement', action: 'approve' },

  // Fixed Assets permissions
  { id: 'assets-create', name: 'Create Assets', resource: 'assets', action: 'create' },
  { id: 'assets-read', name: 'Read Assets', resource: 'assets', action: 'read' },
  { id: 'assets-update', name: 'Update Assets', resource: 'assets', action: 'update' },
  { id: 'assets-delete', name: 'Delete Assets', resource: 'assets', action: 'delete' },

  // Reports permissions
  { id: 'reports-read', name: 'Read Reports', resource: 'reports', action: 'read' },
  { id: 'reports-export', name: 'Export Reports', resource: 'reports', action: 'export' },
  { id: 'reports-create', name: 'Create Custom Reports', resource: 'reports', action: 'create' },

  // Audit permissions
  { id: 'audit-read', name: 'Read Audit Logs', resource: 'audit', action: 'read' },
  { id: 'audit-export', name: 'Export Audit Logs', resource: 'audit', action: 'export' },

  // Admin permissions
  { id: 'admin-create', name: 'Create Admin', resource: 'admin', action: 'create' },
  { id: 'admin-read', name: 'Read Admin', resource: 'admin', action: 'read' },
  { id: 'admin-update', name: 'Update Admin', resource: 'admin', action: 'update' },
  { id: 'admin-delete', name: 'Delete Admin', resource: 'admin', action: 'delete' },
];

// Mock roles for INES-Ruhengeri ERP
export const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'admin',
    description: 'System Administrator - Full access to all modules',
    permissions: mockPermissions, // Admin has all permissions
  },
  {
    id: 'bursar',
    name: 'bursar',
    description: 'Bursar - Financial management and student accounts',
    permissions: mockPermissions.filter(p =>
      p.resource === 'students' ||
      p.resource === 'accounting' ||
      p.resource === 'payables' ||
      p.resource === 'receivables' ||
      p.resource === 'billing' ||
      p.resource === 'payroll' ||
      p.resource === 'projects' ||
      p.resource === 'utilities' ||
      p.resource === 'reports' ||
      (p.resource === 'audit' && p.action === 'read')
    ),
  },
  {
    id: 'store_manager',
    name: 'store_manager',
    description: 'Store Manager - Inventory and procurement management',
    permissions: mockPermissions.filter(p =>
      p.resource === 'inventory' ||
      p.resource === 'procurement' ||
      p.resource === 'assets' ||
      (p.resource === 'accounting' && p.action === 'read') ||
      (p.resource === 'reports' && (p.action === 'read' || p.action === 'export')) ||
      (p.resource === 'audit' && p.action === 'read')
    ),
  },
  {
    id: 'auditor',
    name: 'auditor',
    description: 'Auditor - Read-only access for audit and compliance',
    permissions: mockPermissions.filter(p =>
      p.action === 'read' || p.action === 'export'
    ),
  },
];

// Mock users for INES-Ruhengeri ERP
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@ines.ac.rw',
    name: 'Dr. Jean Baptiste Nzeyimana',
    avatar: undefined,
    roles: [mockRoles[0]!], // admin
    permissions: [],
    tenantId: 'ines-ruhengeri',
    isActive: true,
    lastLoginAt: new Date('2024-01-15T10:30:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: 'user-2',
    email: 'bursar@ines.ac.rw',
    name: 'Mrs. Marie Claire Uwimana',
    avatar: undefined,
    roles: [mockRoles[1]!], // bursar
    permissions: [],
    tenantId: 'ines-ruhengeri',
    isActive: true,
    lastLoginAt: new Date('2024-01-15T09:15:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T09:15:00Z'),
  },
  {
    id: 'user-3',
    email: 'storemanager@ines.ac.rw',
    name: 'Mr. Paul Kagame Muhire',
    avatar: undefined,
    roles: [mockRoles[2]!], // store_manager
    permissions: [],
    tenantId: 'ines-ruhengeri',
    isActive: true,
    lastLoginAt: new Date('2024-01-15T08:45:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T08:45:00Z'),
  },
  {
    id: 'user-4',
    email: 'auditor@ines.ac.rw',
    name: 'Ms. Grace Mukamana',
    avatar: undefined,
    roles: [mockRoles[3]!], // auditor
    permissions: [],
    tenantId: 'ines-ruhengeri',
    isActive: true,
    lastLoginAt: new Date('2024-01-15T07:30:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T07:30:00Z'),
  },
  {
    id: 'user-5',
    email: 'admin@example.com',
    name: 'Test Admin',
    avatar: undefined,
    roles: [mockRoles[0]!], // admin
    permissions: [],
    tenantId: 'ines-ruhengeri',
    isActive: true,
    lastLoginAt: new Date('2024-01-15T10:30:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  },
];

// Mock credentials for INES-Ruhengeri ERP demo
export const mockCredentials = [
  { email: 'admin@ines.ac.rw', password: 'admin123' },
  { email: 'bursar@ines.ac.rw', password: 'bursar123' },
  { email: 'storemanager@ines.ac.rw', password: 'store123' },
  { email: 'auditor@ines.ac.rw', password: 'audit123' },
  // Additional common test credentials
  { email: 'admin@example.com', password: 'password' },
  { email: 'admin@example.com', password: 'admin123' },
];
