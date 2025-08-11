import { 
  BusinessPartner, 
  Item, 
  SalesOrder, 
  PurchaseOrder, 
  Warehouse,
  ItemCategory,
  Address,
  Contact,
  PaymentTerms
} from '@/types';

// Mock Payment Terms
export const mockPaymentTerms: PaymentTerms[] = [
  { id: 'pt-1', name: 'Net 30', days: 30 },
  { id: 'pt-2', name: 'Net 15', days: 15 },
  { id: 'pt-3', name: 'Due on Receipt', days: 0 },
  { id: 'pt-4', name: '2/10 Net 30', days: 30, discountPercent: 2, discountDays: 10 },
];

// Mock Addresses
export const mockAddresses: Address[] = [
  {
    id: 'addr-1',
    type: 'billing',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    isDefault: true,
  },
  {
    id: 'addr-2',
    type: 'shipping',
    street: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90210',
    country: 'USA',
    isDefault: false,
  },
];

// Mock Contacts
export const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '+1-555-0123',
    position: 'Purchasing Manager',
    isPrimary: true,
  },
  {
    id: 'contact-2',
    name: 'Jane Doe',
    email: 'jane@techsolutions.com',
    phone: '+1-555-0456',
    position: 'Sales Director',
    isPrimary: true,
  },
];

// Mock Business Partners
export const mockBusinessPartners: BusinessPartner[] = [
  {
    id: 'bp-1',
    code: 'ACME001',
    name: 'Acme Corporation',
    type: 'customer',
    email: 'contact@acmecorp.com',
    phone: '+1-555-0123',
    website: 'https://acmecorp.com',
    taxId: '12-3456789',
    addresses: [mockAddresses[0]!],
    contacts: [mockContacts[0]!],
    paymentTerms: mockPaymentTerms[0],
    creditLimit: 50000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'bp-2',
    code: 'TECH001',
    name: 'Tech Solutions Inc',
    type: 'supplier',
    email: 'orders@techsolutions.com',
    phone: '+1-555-0456',
    website: 'https://techsolutions.com',
    taxId: '98-7654321',
    addresses: [mockAddresses[1]!],
    contacts: [mockContacts[1]!],
    paymentTerms: mockPaymentTerms[1],
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-14'),
  },
];

// Mock Warehouses
export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    code: 'MAIN',
    name: 'Main Warehouse',
    address: mockAddresses[0]!,
    isActive: true,
    isDefault: true,
  },
  {
    id: 'wh-2',
    code: 'WEST',
    name: 'West Coast Warehouse',
    address: mockAddresses[1]!,
    isActive: true,
    isDefault: false,
  },
];

// Mock Item Categories
export const mockItemCategories: ItemCategory[] = [
  { id: 'cat-1', name: 'Electronics', description: 'Electronic components and devices' },
  { id: 'cat-2', name: 'Office Supplies', description: 'General office supplies' },
  { id: 'cat-3', name: 'Raw Materials', description: 'Manufacturing raw materials' },
];

// Mock Items
export const mockItems: Item[] = [
  {
    id: 'item-1',
    code: 'LAPTOP001',
    name: 'Business Laptop',
    description: 'High-performance business laptop',
    category: mockItemCategories[0]!,
    type: 'inventory',
    unitOfMeasure: 'Each',
    purchasePrice: 800,
    salesPrice: 1200,
    standardCost: 850,
    isActive: true,
    isBatchManaged: false,
    isSerialManaged: true,
    minStock: 10,
    maxStock: 100,
    reorderLevel: 20,
    preferredVendor: 'bp-2',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'item-2',
    code: 'PAPER001',
    name: 'A4 Paper',
    description: 'Premium A4 printing paper',
    category: mockItemCategories[1]!,
    type: 'inventory',
    unitOfMeasure: 'Ream',
    purchasePrice: 5,
    salesPrice: 8,
    standardCost: 5.5,
    isActive: true,
    isBatchManaged: true,
    isSerialManaged: false,
    minStock: 50,
    maxStock: 500,
    reorderLevel: 100,
    preferredVendor: 'bp-2',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
];

// Mock Sales Orders
export const mockSalesOrders: SalesOrder[] = [
  {
    id: 'so-1',
    number: 'SO-2024-001',
    customerId: 'bp-1',
    customer: mockBusinessPartners[0]!,
    date: new Date('2024-01-15'),
    dueDate: new Date('2024-01-30'),
    status: 'open',
    lines: [
      {
        id: 'sol-1',
        lineNumber: 1,
        itemId: 'item-1',
        item: mockItems[0]!,
        quantity: 5,
        unitPrice: 1200,
        discountPercent: 0,
        discountAmount: 0,
        lineTotal: 6000,
        warehouseId: 'wh-1',
        deliveryDate: new Date('2024-01-25'),
      },
    ],
    subtotal: 6000,
    taxAmount: 480,
    discountAmount: 0,
    total: 6480,
    currency: 'RWF',
    paymentTerms: mockPaymentTerms[0]!,
    createdBy: 'user-3',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

// Mock Purchase Orders
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    number: 'PO-2024-001',
    supplierId: 'bp-2',
    supplier: mockBusinessPartners[1]!,
    date: new Date('2024-01-10'),
    dueDate: new Date('2024-01-20'),
    status: 'open',
    lines: [
      {
        id: 'pol-1',
        lineNumber: 1,
        itemId: 'item-1',
        item: mockItems[0]!,
        quantity: 20,
        unitPrice: 800,
        discountPercent: 5,
        discountAmount: 800,
        lineTotal: 15200,
        warehouseId: 'wh-1',
        expectedDate: new Date('2024-01-18'),
        receivedQuantity: 0,
      },
    ],
    subtotal: 16000,
    taxAmount: 1280,
    discountAmount: 800,
    total: 16480,
    currency: 'RWF',
    paymentTerms: mockPaymentTerms[1]!,
    createdBy: 'user-4',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

// Dashboard KPI data
export const mockDashboardData = {
  revenue: {
    current: 125000,
    previous: 118000,
    change: 5.9,
  },
  orders: {
    current: 45,
    previous: 42,
    change: 7.1,
  },
  customers: {
    current: 1234,
    previous: 1198,
    change: 3.0,
  },
  inventory: {
    current: 89,
    previous: 92,
    change: -3.3,
  },
  revenueChart: [
    { month: 'Jan', revenue: 65000 },
    { month: 'Feb', revenue: 72000 },
    { month: 'Mar', revenue: 68000 },
    { month: 'Apr', revenue: 78000 },
    { month: 'May', revenue: 85000 },
    { month: 'Jun', revenue: 92000 },
  ],
  topProducts: [
    { name: 'Business Laptop', sales: 45, revenue: 54000 },
    { name: 'Office Chair', sales: 32, revenue: 16000 },
    { name: 'Desk Lamp', sales: 28, revenue: 8400 },
  ],
  lowStockItems: [
    { name: 'A4 Paper', current: 15, minimum: 50 },
    { name: 'Ink Cartridge', current: 8, minimum: 20 },
    { name: 'USB Cable', current: 12, minimum: 25 },
  ],
};
