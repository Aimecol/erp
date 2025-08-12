'use client';

import React from 'react';
import {
  Plus, Search, Download, Eye, Edit, BarChart3, DollarSign, TrendingUp,
  Building, FileText, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft,
  Target, Activity, Layers, BookOpen, CreditCard, Receipt, AlertTriangle,
  Minus, Calculator, Save, RefreshCw, History, Trash2, ArrowRightLeft, Send
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { usePermissions } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccounting } from '@/contexts/accounting-context';
import { formatCurrency } from '@/lib/utils';

interface JournalEntry {
  id: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
}

interface TransactionForm {
  description: string;
  reference: string;
  date: string;
  entries: JournalEntry[];
}

export default function ChartOfAccountsPage() {
  const { canRead, canCreate, canUpdate } = usePermissions();
  const { addJournalEntry: saveJournalEntry, getAccountBalance, getAccountBalanceChange, calculateNetEffect, transferMoney, getAvailableBalance, canTransferFrom, accountBalances } = useAccounting();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [showTransactionDialog, setShowTransactionDialog] = React.useState(false);
  const [showQuickEntryDialog, setShowQuickEntryDialog] = React.useState(false);
  const [quickEntryAccount, setQuickEntryAccount] = React.useState<any>(null);
  const [quickEntryType, setQuickEntryType] = React.useState<'debit' | 'credit'>('debit');
  const [quickEntryAmount, setQuickEntryAmount] = React.useState('');
  const [quickEntryDescription, setQuickEntryDescription] = React.useState('');
  const [showTransferDialog, setShowTransferDialog] = React.useState(false);
  const [transferForm, setTransferForm] = React.useState({
    fromAccountCode: '',
    toAccountCode: '',
    amount: '',
    description: '',
    reference: ''
  });
  const [transactionForm, setTransactionForm] = React.useState<TransactionForm>({
    description: '',
    reference: '',
    date: new Date().toISOString().split('T')[0] || '',
    entries: []
  });

  // Mock comprehensive chart of accounts data
  const mockChartOfAccounts = [
    // ASSETS (1000-1999)
    { id: '1', accountCode: '1000', accountName: 'ASSETS', accountType: 'asset', accountSubType: 'Header', level: 1, parentAccountId: null, balance: 2500000000, debitBalance: 2500000000, creditBalance: 0, isActive: true },
    { id: '2', accountCode: '1100', accountName: 'Current Assets', accountType: 'asset', accountSubType: 'Header', level: 2, parentAccountId: '1', balance: 850000000, debitBalance: 850000000, creditBalance: 0, isActive: true },
    { id: '3', accountCode: '1110', accountName: 'Cash and Cash Equivalents', accountType: 'asset', accountSubType: 'Header', level: 3, parentAccountId: '2', balance: 450000000, debitBalance: 450000000, creditBalance: 0, isActive: true },
    { id: '4', accountCode: '1111', accountName: 'Cash - Main Account (BNR)', accountType: 'asset', accountSubType: 'Bank', level: 4, parentAccountId: '3', balance: 250000000, debitBalance: 250000000, creditBalance: 0, isActive: true },
    { id: '5', accountCode: '1112', accountName: 'Cash - USD Account (BNR)', accountType: 'asset', accountSubType: 'Bank', level: 4, parentAccountId: '3', balance: 150000000, debitBalance: 150000000, creditBalance: 0, isActive: true },
    { id: '6', accountCode: '1113', accountName: 'Petty Cash', accountType: 'asset', accountSubType: 'Cash', level: 4, parentAccountId: '3', balance: 5000000, debitBalance: 5000000, creditBalance: 0, isActive: true },
    { id: '7', accountCode: '1114', accountName: 'Cash - Equity Bank', accountType: 'asset', accountSubType: 'Bank', level: 4, parentAccountId: '3', balance: 45000000, debitBalance: 45000000, creditBalance: 0, isActive: true },

    { id: '8', accountCode: '1200', accountName: 'Accounts Receivable', accountType: 'asset', accountSubType: 'Header', level: 3, parentAccountId: '2', balance: 125000000, debitBalance: 125000000, creditBalance: 0, isActive: true },
    { id: '9', accountCode: '1210', accountName: 'Student Fees Receivable', accountType: 'asset', accountSubType: 'Receivable', level: 4, parentAccountId: '8', balance: 85000000, debitBalance: 85000000, creditBalance: 0, isActive: true },
    { id: '10', accountCode: '1220', accountName: 'Government Grants Receivable', accountType: 'asset', accountSubType: 'Receivable', level: 4, parentAccountId: '8', balance: 25000000, debitBalance: 25000000, creditBalance: 0, isActive: true },
    { id: '11', accountCode: '1230', accountName: 'Other Receivables', accountType: 'asset', accountSubType: 'Receivable', level: 4, parentAccountId: '8', balance: 15000000, debitBalance: 15000000, creditBalance: 0, isActive: true },

    { id: '12', accountCode: '1300', accountName: 'Inventory', accountType: 'asset', accountSubType: 'Header', level: 3, parentAccountId: '2', balance: 45000000, debitBalance: 45000000, creditBalance: 0, isActive: true },
    { id: '13', accountCode: '1310', accountName: 'Office Supplies', accountType: 'asset', accountSubType: 'Inventory', level: 4, parentAccountId: '12', balance: 15000000, debitBalance: 15000000, creditBalance: 0, isActive: true },
    { id: '14', accountCode: '1320', accountName: 'Laboratory Supplies', accountType: 'asset', accountSubType: 'Inventory', level: 4, parentAccountId: '12', balance: 25000000, debitBalance: 25000000, creditBalance: 0, isActive: true },
    { id: '15', accountCode: '1330', accountName: 'Books and Publications', accountType: 'asset', accountSubType: 'Inventory', level: 4, parentAccountId: '12', balance: 5000000, debitBalance: 5000000, creditBalance: 0, isActive: true },

    { id: '16', accountCode: '1400', accountName: 'Prepaid Expenses', accountType: 'asset', accountSubType: 'Header', level: 3, parentAccountId: '2', balance: 35000000, debitBalance: 35000000, creditBalance: 0, isActive: true },
    { id: '17', accountCode: '1410', accountName: 'Prepaid Insurance', accountType: 'asset', accountSubType: 'Prepaid', level: 4, parentAccountId: '16', balance: 20000000, debitBalance: 20000000, creditBalance: 0, isActive: true },
    { id: '18', accountCode: '1420', accountName: 'Prepaid Rent', accountType: 'asset', accountSubType: 'Prepaid', level: 4, parentAccountId: '16', balance: 15000000, debitBalance: 15000000, creditBalance: 0, isActive: true },

    // Fixed Assets
    { id: '19', accountCode: '1500', accountName: 'Fixed Assets', accountType: 'asset', accountSubType: 'Header', level: 2, parentAccountId: '1', balance: 1650000000, debitBalance: 1650000000, creditBalance: 0, isActive: true },
    { id: '20', accountCode: '1510', accountName: 'Land and Buildings', accountType: 'asset', accountSubType: 'Fixed Asset', level: 3, parentAccountId: '19', balance: 1200000000, debitBalance: 1200000000, creditBalance: 0, isActive: true },
    { id: '21', accountCode: '1520', accountName: 'Equipment and Machinery', accountType: 'asset', accountSubType: 'Fixed Asset', level: 3, parentAccountId: '19', balance: 350000000, debitBalance: 350000000, creditBalance: 0, isActive: true },
    { id: '22', accountCode: '1530', accountName: 'Furniture and Fixtures', accountType: 'asset', accountSubType: 'Fixed Asset', level: 3, parentAccountId: '19', balance: 100000000, debitBalance: 100000000, creditBalance: 0, isActive: true },

    // LIABILITIES (2000-2999)
    { id: '23', accountCode: '2000', accountName: 'LIABILITIES', accountType: 'liability', accountSubType: 'Header', level: 1, parentAccountId: null, balance: 850000000, debitBalance: 0, creditBalance: 850000000, isActive: true },
    { id: '24', accountCode: '2100', accountName: 'Current Liabilities', accountType: 'liability', accountSubType: 'Header', level: 2, parentAccountId: '23', balance: 450000000, debitBalance: 0, creditBalance: 450000000, isActive: true },
    { id: '25', accountCode: '2110', accountName: 'Accounts Payable', accountType: 'liability', accountSubType: 'Payable', level: 3, parentAccountId: '24', balance: 125000000, debitBalance: 0, creditBalance: 125000000, isActive: true },
    { id: '26', accountCode: '2120', accountName: 'Accrued Expenses', accountType: 'liability', accountSubType: 'Accrued', level: 3, parentAccountId: '24', balance: 85000000, debitBalance: 0, creditBalance: 85000000, isActive: true },
    { id: '27', accountCode: '2130', accountName: 'Student Deposits', accountType: 'liability', accountSubType: 'Deposit', level: 3, parentAccountId: '24', balance: 65000000, debitBalance: 0, creditBalance: 65000000, isActive: true },
    { id: '28', accountCode: '2140', accountName: 'Taxes Payable', accountType: 'liability', accountSubType: 'Tax', level: 3, parentAccountId: '24', balance: 175000000, debitBalance: 0, creditBalance: 175000000, isActive: true },

    { id: '29', accountCode: '2200', accountName: 'Long-term Liabilities', accountType: 'liability', accountSubType: 'Header', level: 2, parentAccountId: '23', balance: 400000000, debitBalance: 0, creditBalance: 400000000, isActive: true },
    { id: '30', accountCode: '2210', accountName: 'Bank Loans', accountType: 'liability', accountSubType: 'Loan', level: 3, parentAccountId: '29', balance: 300000000, debitBalance: 0, creditBalance: 300000000, isActive: true },
    { id: '31', accountCode: '2220', accountName: 'Government Loans', accountType: 'liability', accountSubType: 'Loan', level: 3, parentAccountId: '29', balance: 100000000, debitBalance: 0, creditBalance: 100000000, isActive: true },

    // EQUITY (3000-3999)
    { id: '32', accountCode: '3000', accountName: 'EQUITY', accountType: 'equity', accountSubType: 'Header', level: 1, parentAccountId: null, balance: 1650000000, debitBalance: 0, creditBalance: 1650000000, isActive: true },
    { id: '33', accountCode: '3100', accountName: 'Institutional Capital', accountType: 'equity', accountSubType: 'Capital', level: 2, parentAccountId: '32', balance: 1200000000, debitBalance: 0, creditBalance: 1200000000, isActive: true },
    { id: '34', accountCode: '3200', accountName: 'Retained Earnings', accountType: 'equity', accountSubType: 'Retained Earnings', level: 2, parentAccountId: '32', balance: 350000000, debitBalance: 0, creditBalance: 350000000, isActive: true },
    { id: '35', accountCode: '3300', accountName: 'Current Year Surplus', accountType: 'equity', accountSubType: 'Current Earnings', level: 2, parentAccountId: '32', balance: 100000000, debitBalance: 0, creditBalance: 100000000, isActive: true },

    // INCOME (4000-4999)
    { id: '36', accountCode: '4000', accountName: 'INCOME', accountType: 'income', accountSubType: 'Header', level: 1, parentAccountId: null, balance: 450000000, debitBalance: 0, creditBalance: 450000000, isActive: true },
    { id: '37', accountCode: '4100', accountName: 'Tuition and Fees', accountType: 'income', accountSubType: 'Header', level: 2, parentAccountId: '36', balance: 320000000, debitBalance: 0, creditBalance: 320000000, isActive: true },
    { id: '38', accountCode: '4110', accountName: 'Undergraduate Tuition', accountType: 'income', accountSubType: 'Tuition', level: 3, parentAccountId: '37', balance: 200000000, debitBalance: 0, creditBalance: 200000000, isActive: true },
    { id: '39', accountCode: '4120', accountName: 'Graduate Tuition', accountType: 'income', accountSubType: 'Tuition', level: 3, parentAccountId: '37', balance: 80000000, debitBalance: 0, creditBalance: 80000000, isActive: true },
    { id: '40', accountCode: '4130', accountName: 'Application Fees', accountType: 'income', accountSubType: 'Fees', level: 3, parentAccountId: '37', balance: 25000000, debitBalance: 0, creditBalance: 25000000, isActive: true },
    { id: '41', accountCode: '4140', accountName: 'Examination Fees', accountType: 'income', accountSubType: 'Fees', level: 3, parentAccountId: '37', balance: 15000000, debitBalance: 0, creditBalance: 15000000, isActive: true },

    { id: '42', accountCode: '4200', accountName: 'Grants and Donations', accountType: 'income', accountSubType: 'Header', level: 2, parentAccountId: '36', balance: 85000000, debitBalance: 0, creditBalance: 85000000, isActive: true },
    { id: '43', accountCode: '4210', accountName: 'Government Grants', accountType: 'income', accountSubType: 'Grant', level: 3, parentAccountId: '42', balance: 60000000, debitBalance: 0, creditBalance: 60000000, isActive: true },
    { id: '44', accountCode: '4220', accountName: 'Private Donations', accountType: 'income', accountSubType: 'Donation', level: 3, parentAccountId: '42', balance: 25000000, debitBalance: 0, creditBalance: 25000000, isActive: true },

    { id: '45', accountCode: '4300', accountName: 'Other Income', accountType: 'income', accountSubType: 'Header', level: 2, parentAccountId: '36', balance: 45000000, debitBalance: 0, creditBalance: 45000000, isActive: true },
    { id: '46', accountCode: '4310', accountName: 'Consultancy Income', accountType: 'income', accountSubType: 'Service', level: 3, parentAccountId: '45', balance: 25000000, debitBalance: 0, creditBalance: 25000000, isActive: true },
    { id: '47', accountCode: '4320', accountName: 'Investment Income', accountType: 'income', accountSubType: 'Investment', level: 3, parentAccountId: '45', balance: 20000000, debitBalance: 0, creditBalance: 20000000, isActive: true },

    // EXPENSES (5000-5999)
    { id: '48', accountCode: '5000', accountName: 'EXPENSES', accountType: 'expense', accountSubType: 'Header', level: 1, parentAccountId: null, balance: 320000000, debitBalance: 320000000, creditBalance: 0, isActive: true },
    { id: '49', accountCode: '5100', accountName: 'Personnel Expenses', accountType: 'expense', accountSubType: 'Header', level: 2, parentAccountId: '48', balance: 180000000, debitBalance: 180000000, creditBalance: 0, isActive: true },
    { id: '50', accountCode: '5110', accountName: 'Salaries and Wages', accountType: 'expense', accountSubType: 'Salary', level: 3, parentAccountId: '49', balance: 120000000, debitBalance: 120000000, creditBalance: 0, isActive: true },
    { id: '51', accountCode: '5120', accountName: 'Employee Benefits', accountType: 'expense', accountSubType: 'Benefits', level: 3, parentAccountId: '49', balance: 35000000, debitBalance: 35000000, creditBalance: 0, isActive: true },
    { id: '52', accountCode: '5130', accountName: 'Professional Development', accountType: 'expense', accountSubType: 'Training', level: 3, parentAccountId: '49', balance: 25000000, debitBalance: 25000000, creditBalance: 0, isActive: true },

    { id: '53', accountCode: '5200', accountName: 'Operating Expenses', accountType: 'expense', accountSubType: 'Header', level: 2, parentAccountId: '48', balance: 85000000, debitBalance: 85000000, creditBalance: 0, isActive: true },
    { id: '54', accountCode: '5210', accountName: 'Utilities', accountType: 'expense', accountSubType: 'Utility', level: 3, parentAccountId: '53', balance: 35000000, debitBalance: 35000000, creditBalance: 0, isActive: true },
    { id: '55', accountCode: '5220', accountName: 'Maintenance and Repairs', accountType: 'expense', accountSubType: 'Maintenance', level: 3, parentAccountId: '53', balance: 25000000, debitBalance: 25000000, creditBalance: 0, isActive: true },
    { id: '56', accountCode: '5230', accountName: 'Office Supplies', accountType: 'expense', accountSubType: 'Supplies', level: 3, parentAccountId: '53', balance: 15000000, debitBalance: 15000000, creditBalance: 0, isActive: true },
    { id: '57', accountCode: '5240', accountName: 'Communications', accountType: 'expense', accountSubType: 'Communication', level: 3, parentAccountId: '53', balance: 10000000, debitBalance: 10000000, creditBalance: 0, isActive: true },

    { id: '58', accountCode: '5300', accountName: 'Academic Expenses', accountType: 'expense', accountSubType: 'Header', level: 2, parentAccountId: '48', balance: 55000000, debitBalance: 55000000, creditBalance: 0, isActive: true },
    { id: '59', accountCode: '5310', accountName: 'Library and Research', accountType: 'expense', accountSubType: 'Academic', level: 3, parentAccountId: '58', balance: 25000000, debitBalance: 25000000, creditBalance: 0, isActive: true },
    { id: '60', accountCode: '5320', accountName: 'Laboratory Expenses', accountType: 'expense', accountSubType: 'Academic', level: 3, parentAccountId: '58', balance: 20000000, debitBalance: 20000000, creditBalance: 0, isActive: true },
    { id: '61', accountCode: '5330', accountName: 'Student Activities', accountType: 'expense', accountSubType: 'Student', level: 3, parentAccountId: '58', balance: 10000000, debitBalance: 10000000, creditBalance: 0, isActive: true }
  ];

  // Helper functions
  const addJournalEntry = () => {
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      accountCode: '',
      accountName: '',
      debitAmount: 0,
      creditAmount: 0
    };
    setTransactionForm(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry]
    }));
  };

  const updateJournalEntry = (index: number, field: keyof JournalEntry, value: any) => {
    setTransactionForm(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const removeJournalEntry = (index: number) => {
    setTransactionForm(prev => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index)
    }));
  };

  const getTotalDebits = () => {
    return transactionForm.entries.reduce((sum, entry) => sum + entry.debitAmount, 0);
  };

  const getTotalCredits = () => {
    return transactionForm.entries.reduce((sum, entry) => sum + entry.creditAmount, 0);
  };

  const isBalanced = () => {
    return getTotalDebits() === getTotalCredits() && getTotalDebits() > 0;
  };

  const handleAccountSelect = (accountCode: string, accountName: string, index: number) => {
    updateJournalEntry(index, 'accountCode', accountCode);
    updateJournalEntry(index, 'accountName', accountName);
  };

  const submitTransaction = () => {
    if (!isBalanced()) {
      alert('Transaction must be balanced (Total Debits = Total Credits)');
      return;
    }

    if (!transactionForm.description.trim()) {
      alert('Please enter a transaction description');
      return;
    }

    // Create journal entry data
    const journalEntryData = {
      entryDate: transactionForm.date,
      description: transactionForm.description,
      reference: transactionForm.reference || `JE-${Date.now()}`,
      entryType: 'manual' as const,
      source: 'chart-of-accounts' as const,
      totalDebit: getTotalDebits(),
      totalCredit: getTotalCredits(),
      status: 'posted' as const, // Post immediately for chart of accounts transactions
      createdBy: 'Current User', // In real app, get from auth context
      lines: transactionForm.entries.map(entry => ({
        id: entry.id,
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        debitAmount: entry.debitAmount,
        creditAmount: entry.creditAmount
      }))
    };

    // Save to journal entries and update account balances
    const entryId = saveJournalEntry(journalEntryData);

    // Show success message
    alert(`Transaction posted successfully! Journal Entry ID: ${entryId}`);

    // Reset form and close dialog
    setShowTransactionDialog(false);
    setTransactionForm({
      description: '',
      reference: '',
      date: new Date().toISOString().split('T')[0] || '',
      entries: []
    });
  };

  // Quick entry functions for direct debit/credit
  const openQuickEntry = (account: any, type: 'debit' | 'credit') => {
    setQuickEntryAccount(account);
    setQuickEntryType(type);
    setQuickEntryAmount('');
    setQuickEntryDescription('');
    setShowQuickEntryDialog(true);
  };

  const submitQuickEntry = () => {
    if (!quickEntryAccount || !quickEntryAmount || parseFloat(quickEntryAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(quickEntryAmount);
    const description = quickEntryDescription || `${quickEntryType === 'debit' ? 'Debit' : 'Credit'} to ${quickEntryAccount.accountName}`;

    // Create a balanced journal entry
    const entries: JournalEntry[] = [
      {
        id: `entry-${Date.now()}-1`,
        accountCode: quickEntryAccount.accountCode,
        accountName: quickEntryAccount.accountName,
        debitAmount: quickEntryType === 'debit' ? amount : 0,
        creditAmount: quickEntryType === 'credit' ? amount : 0
      }
    ];

    // Add a balancing entry (default to main cash account)
    const balancingAccountCode = quickEntryType === 'debit' ? '1111' : '1111'; // Default to main cash account
    const balancingAccount = updatedAccounts.find(acc => acc.accountCode === balancingAccountCode);

    if (balancingAccount) {
      entries.push({
        id: `entry-${Date.now()}-2`,
        accountCode: balancingAccount.accountCode,
        accountName: balancingAccount.accountName,
        debitAmount: quickEntryType === 'credit' ? amount : 0,
        creditAmount: quickEntryType === 'debit' ? amount : 0
      });
    }

    // Create and save journal entry directly
    const journalEntryData = {
      entryDate: new Date().toISOString().split('T')[0] || '',
      description: description,
      reference: `QE-${Date.now()}`,
      entryType: 'manual' as const,
      source: 'chart-of-accounts' as const,
      totalDebit: amount,
      totalCredit: amount,
      status: 'posted' as const,
      createdBy: 'Current User',
      lines: entries.map(entry => ({
        id: entry.id,
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        debitAmount: entry.debitAmount,
        creditAmount: entry.creditAmount
      }))
    };

    // Save to journal entries and update account balances
    const entryId = saveJournalEntry(journalEntryData);

    // Show success message
    alert(`Quick ${quickEntryType} posted successfully! Journal Entry ID: ${entryId}`);

    // Close quick entry dialog
    setShowQuickEntryDialog(false);
    setQuickEntryAmount('');
    setQuickEntryDescription('');
  };

  const addAccountToJournal = (account: any, type: 'debit' | 'credit') => {
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      accountCode: account.accountCode,
      accountName: account.accountName,
      debitAmount: type === 'debit' ? 0 : 0,
      creditAmount: type === 'credit' ? 0 : 0
    };

    setTransactionForm(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry]
    }));

    setShowTransactionDialog(true);
  };

  // Transfer functions
  const openTransferDialog = (account: any) => {
    setTransferForm({
      fromAccountCode: account.accountCode,
      toAccountCode: '',
      amount: '',
      description: `Transfer from ${account.accountName}`,
      reference: `TRF-${Date.now()}`
    });
    setShowTransferDialog(true);
  };

  const submitTransfer = () => {
    try {
      if (!transferForm.fromAccountCode || !transferForm.toAccountCode || !transferForm.amount) {
        alert('Please fill in all required fields');
        return;
      }

      const amount = parseFloat(transferForm.amount);
      if (amount <= 0) {
        alert('Transfer amount must be positive');
        return;
      }

      if (transferForm.fromAccountCode === transferForm.toAccountCode) {
        alert('Cannot transfer to the same account');
        return;
      }

      const transferId = transferMoney({
        fromAccountCode: transferForm.fromAccountCode,
        toAccountCode: transferForm.toAccountCode,
        amount: amount,
        description: transferForm.description,
        reference: transferForm.reference
      });

      alert(`Transfer completed successfully! Transfer ID: ${transferId}`);
      setShowTransferDialog(false);
      setTransferForm({
        fromAccountCode: '',
        toAccountCode: '',
        amount: '',
        description: '',
        reference: ''
      });
    } catch (error: any) {
      alert(`Transfer failed: ${error.message}`);
    }
  };

  // Check permissions
  if (!canRead('accounting')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view chart of accounts.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Get updated accounts with real-time balances
  const updatedAccounts = React.useMemo(() => {
    return mockChartOfAccounts.map(account => {
      const contextBalance = getAccountBalance(account.accountCode);
      if (contextBalance) {
        return {
          ...account,
          balance: contextBalance.balance,
          debitBalance: contextBalance.debitBalance,
          creditBalance: contextBalance.creditBalance
        };
      }
      return account;
    });
  }, [accountBalances, getAccountBalance]);

  // Filter accounts based on search and filters
  const filteredAccounts = React.useMemo(() => {
    return updatedAccounts.filter(account => {
      const matchesSearch = searchTerm === '' ||
        account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountCode.includes(searchTerm);

      const matchesType = selectedType === 'all' || account.accountType === selectedType;
      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'active' && account.isActive) ||
        (selectedStatus === 'inactive' && !account.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [updatedAccounts, searchTerm, selectedType, selectedStatus]);

  // Calculate stats from updated accounts
  const stats = React.useMemo(() => {
    const assetAccounts = updatedAccounts.filter(acc => acc.accountType === 'asset');
    const liabilityAccounts = updatedAccounts.filter(acc => acc.accountType === 'liability');
    const equityAccounts = updatedAccounts.filter(acc => acc.accountType === 'equity');
    const incomeAccounts = updatedAccounts.filter(acc => acc.accountType === 'income');
    const expenseAccounts = updatedAccounts.filter(acc => acc.accountType === 'expense');

    return {
      assetAccounts: assetAccounts.length,
      totalAssets: assetAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0),
      liabilityAccounts: liabilityAccounts.length,
      totalLiabilities: liabilityAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0),
      equityAccounts: equityAccounts.length,
      totalEquity: equityAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0),
      incomeAccounts: incomeAccounts.length,
      totalIncome: incomeAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0),
      expenseAccounts: expenseAccounts.length,
      totalExpenses: expenseAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0),
    };
  }, [updatedAccounts]);

  const getAccountTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      asset: 'default',
      liability: 'secondary',
      equity: 'outline',
      income: 'default',
      expense: 'destructive'
    };
    return variants[type] || 'outline';
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'asset':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'liability':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'equity':
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      case 'income':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'expense':
        return <DollarSign className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'accountCode',
      header: 'Account Code',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.accountCode}</div>
      ),
    },
    {
      accessorKey: 'accountName',
      header: 'Account Name',
      cell: ({ row }: any) => {
        const account = row.original;
        const indent = account.level * 15;
        const canTransact = account.level > 2 && account.isActive;

        return (
          <div style={{ paddingLeft: `${indent}px` }} className="flex items-center gap-2">
            <div>
              <div className={`font-medium ${account.level <= 2 ? 'text-blue-600' : ''}`}>
                {account.accountName}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                Level {account.level} {account.parentAccountId && '(Sub-account)'}
                {account.level <= 2 && (
                  <Badge variant="outline" className="text-xs">
                    Header
                  </Badge>
                )}
                {canTransact && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Transactable
                  </Badge>
                )}
                {!account.isActive && (
                  <Badge variant="destructive" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'accountType',
      header: 'Account Type',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getAccountTypeIcon(row.original.accountType)}
          <Badge variant={getAccountTypeBadge(row.original.accountType)}>
            {row.original.accountType.toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'accountSubType',
      header: 'Sub Type',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.accountSubType}</div>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Current Balance',
      cell: ({ row }: any) => {
        const account = row.original;
        const isNormalDebit = ['asset', 'expense'].includes(account.accountType);
        const balanceColor = account.balance >= 0
          ? (isNormalDebit ? 'text-green-600' : 'text-blue-600')
          : (isNormalDebit ? 'text-red-600' : 'text-green-600');

        const balanceChange = getAccountBalanceChange(account.accountCode);
        const contextBalance = getAccountBalance(account.accountCode);

        return (
          <div>
            <div className={`font-medium ${balanceColor}`}>
              {formatCurrency(Math.abs(account.balance))}
              <span className="text-xs ml-1">
                {isNormalDebit
                  ? (account.balance >= 0 ? 'Dr' : 'Cr')
                  : (account.balance >= 0 ? 'Cr' : 'Dr')
                }
              </span>
            </div>
            {balanceChange && (
              <div className={`text-xs ${balanceChange.type === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                {balanceChange.type === 'increase' ? '↗' : '↘'} {formatCurrency(balanceChange.amount)}
                <span className="ml-1 text-gray-400">
                  (was {formatCurrency(Math.abs(contextBalance?.previousBalance || 0))})
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'debitBalance',
      header: 'Debit Balance',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.debitBalance || 0)}</div>
      ),
    },
    {
      accessorKey: 'creditBalance',
      header: 'Credit Balance',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.creditBalance || 0)}</div>
      ),
    },
    {
      accessorKey: 'lastTransaction',
      header: 'Last Transaction',
      cell: ({ row }: any) => {
        const account = row.original;
        const contextBalance = getAccountBalance(account.accountCode);

        if (!contextBalance || contextBalance.lastTransactionAmount === 0) {
          return <div className="text-xs text-gray-400">No recent transactions</div>;
        }

        const effect = calculateNetEffect(
          account.accountCode,
          account.accountType,
          contextBalance.lastTransactionType === 'debit' ? contextBalance.lastTransactionAmount : 0,
          contextBalance.lastTransactionType === 'credit' ? contextBalance.lastTransactionAmount : 0
        );

        return (
          <div className="text-xs">
            <div className={`font-medium ${contextBalance.lastTransactionType === 'debit' ? 'text-green-600' : 'text-blue-600'}`}>
              {contextBalance.lastTransactionType === 'debit' ? 'Debited' : 'Credited'}: {formatCurrency(contextBalance.lastTransactionAmount)}
            </div>
            <div className={`text-xs ${effect.effectType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
              Balance {effect.effectType}d by {formatCurrency(effect.netEffect)}
            </div>
            <div className="text-gray-500">
              {new Date(contextBalance.lastTransactionDate).toLocaleString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'ACTIVE' : 'INACTIVE'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const account = row.original;
        const canTransact = account.level > 2 && account.isActive; // Only allow transactions on detail accounts

        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" title="View Details">
              <Eye className="h-4 w-4" />
            </Button>
            {canUpdate('accounting') && (
              <Button variant="ghost" size="sm" title="Edit Account">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canTransact && canCreate('accounting') && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  title="Debit Account"
                  onClick={() => openQuickEntry(account, 'debit')}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  title="Credit Account"
                  onClick={() => openQuickEntry(account, 'credit')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title="Add to Journal"
                  onClick={() => addAccountToJournal(account, 'debit')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  title="Transfer Money"
                  onClick={() => openTransferDialog(account)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
              <p className="text-muted-foreground">
                Manage accounts, create journal entries, and perform debit/credit transactions
              </p>
            </div>
            {canCreate('accounting') && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTransactionDialog(true)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  New Journal Entry
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
            )}
          </div>

          {/* Account Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assets</CardTitle>
                <Building className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.assetAccounts || 45}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalAssets || 2500000000)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Liabilities</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.liabilityAccounts || 28}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalLiabilities || 850000000)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equity</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.equityAccounts || 12}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalEquity || 1650000000)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.incomeAccounts || 35}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalIncome || 450000000)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.expenseAccounts || 68}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalExpenses || 320000000)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Activity Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Activity className="h-5 w-5" />
                Session Activity Summary
              </CardTitle>
              <CardDescription>
                Real-time tracking of account balance changes during this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {updatedAccounts.filter(acc => getAccountBalanceChange(acc.accountCode)).length}
                  </div>
                  <div className="text-sm text-gray-600">Accounts Modified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {updatedAccounts.filter(acc => {
                      const change = getAccountBalanceChange(acc.accountCode);
                      return change && change.type === 'increase';
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Balances Increased</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {updatedAccounts.filter(acc => {
                      const change = getAccountBalanceChange(acc.accountCode);
                      return change && change.type === 'decrease';
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Balances Decreased</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Array.from(accountBalances.values()).reduce((sum, balance) => sum + balance.lastTransactionAmount, 0) > 0
                      ? formatCurrency(Array.from(accountBalances.values()).reduce((sum, balance) => sum + balance.lastTransactionAmount, 0))
                      : '0'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Total Transaction Volume</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="accounts" className="space-y-6">
            <TabsList>
              <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
              <TabsTrigger value="journal">Journal Entry</TabsTrigger>
              <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
              <TabsTrigger value="account-analysis">Account Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="space-y-6">
              {/* Quick Actions Guide */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <BookOpen className="h-5 w-5" />
                    Quick Actions Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-800">Debit Account</div>
                        <div className="text-green-700">Click the green arrow to debit any account directly</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowDownLeft className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800">Credit Account</div>
                        <div className="text-blue-700">Click the blue arrow to credit any account directly</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Plus className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-800">Add to Journal</div>
                        <div className="text-gray-700">Add account to journal entry for complex transactions</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart of Accounts List */}
              <Card>
                <CardHeader>
                  <CardTitle>Chart of Accounts</CardTitle>
                  <CardDescription>
                    View and manage all general ledger accounts. Use action buttons to debit/credit accounts directly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search accounts by code or name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Account Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="asset">Assets</SelectItem>
                        <SelectItem value="liability">Liabilities</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expenses</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <DataTable
                    columns={columns}
                    data={filteredAccounts}
                    loading={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="journal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Journal Entry
                  </CardTitle>
                  <CardDescription>
                    Create journal entries by selecting accounts and entering debit/credit amounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Transaction Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={transactionForm.date}
                          onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Reference</label>
                        <Input
                          placeholder="JE-2024-001"
                          value={transactionForm.reference}
                          onChange={(e) => setTransactionForm(prev => ({ ...prev, reference: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          placeholder="Transaction description"
                          value={transactionForm.description}
                          onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Journal Entries */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Journal Entries</h3>
                        <Button onClick={addJournalEntry}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Entry
                        </Button>
                      </div>

                      {transactionForm.entries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="h-12 w-12 mx-auto mb-4" />
                          <p>No journal entries added yet. Click "Add Entry" to start.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {transactionForm.entries.map((entry, index) => (
                            <div key={entry.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium">Account</label>
                                <Select
                                  value={entry.accountCode}
                                  onValueChange={(value) => {
                                    const account = updatedAccounts.find(acc => acc.accountCode === value);
                                    if (account) {
                                      handleAccountSelect(account.accountCode, account.accountName, index);
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {updatedAccounts
                                      .filter(acc => acc.level > 2 && acc.isActive) // Only show detail accounts
                                      .map(account => (
                                        <SelectItem key={account.id} value={account.accountCode}>
                                          {account.accountCode} - {account.accountName}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Debit</label>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={entry.debitAmount || ''}
                                  onChange={(e) => updateJournalEntry(index, 'debitAmount', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Credit</label>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={entry.creditAmount || ''}
                                  onChange={(e) => updateJournalEntry(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeJournalEntry(index)}
                                  className="w-full"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Transaction Summary */}
                      {transactionForm.entries.length > 0 && (
                        <div className="border-t pt-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-sm text-muted-foreground">Total Debits</div>
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(getTotalDebits())}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Total Credits</div>
                              <div className="text-lg font-bold text-blue-600">
                                {formatCurrency(getTotalCredits())}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Difference</div>
                              <div className={`text-lg font-bold ${isBalanced() ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(Math.abs(getTotalDebits() - getTotalCredits()))}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-center mt-4">
                            <Button
                              onClick={submitTransaction}
                              disabled={!isBalanced()}
                              className="w-48"
                            >
                              {isBalanced() ? 'Post Transaction' : 'Transaction Not Balanced'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trial-balance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Trial Balance
                  </CardTitle>
                  <CardDescription>
                    View trial balance showing all account balances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 font-medium border-b pb-2">
                      <div>Account Code</div>
                      <div>Account Name</div>
                      <div className="text-right">Debit Balance</div>
                      <div className="text-right">Credit Balance</div>
                      <div className="text-right">Net Balance</div>
                      <div className="text-right">Recent Change</div>
                    </div>

                    {updatedAccounts
                      .filter(acc => acc.level > 2 && acc.balance !== 0) // Only show accounts with balances
                      .map(account => {
                        const balanceChange = getAccountBalanceChange(account.accountCode);
                        return (
                          <div key={account.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 py-2 border-b">
                            <div className="font-medium">{account.accountCode}</div>
                            <div>{account.accountName}</div>
                            <div className="text-right">
                              {account.debitBalance > 0 ? formatCurrency(account.debitBalance) : '-'}
                            </div>
                            <div className="text-right">
                              {account.creditBalance > 0 ? formatCurrency(account.creditBalance) : '-'}
                            </div>
                            <div className="text-right font-medium">
                              {formatCurrency(Math.abs(account.balance))}
                              <span className="text-sm ml-1">
                                {['asset', 'expense'].includes(account.accountType)
                                  ? (account.balance >= 0 ? 'Dr' : 'Cr')
                                  : (account.balance >= 0 ? 'Cr' : 'Dr')
                                }
                              </span>
                            </div>
                            <div className="text-right">
                              {balanceChange ? (
                                <div className={`text-sm ${balanceChange.type === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                                  {balanceChange.type === 'increase' ? '↗' : '↘'} {formatCurrency(balanceChange.amount)}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">No change</div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 py-4 border-t-2 font-bold text-lg">
                      <div className="md:col-span-2">TOTALS</div>
                      <div className="text-right">
                        {formatCurrency(updatedAccounts.reduce((sum, acc) => sum + acc.debitBalance, 0))}
                      </div>
                      <div className="text-right">
                        {formatCurrency(updatedAccounts.reduce((sum, acc) => sum + acc.creditBalance, 0))}
                      </div>
                      <div className="text-right">
                        {formatCurrency(0)} {/* Should always be zero in a balanced system */}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {updatedAccounts.filter(acc => getAccountBalanceChange(acc.accountCode)).length} changed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account-analysis" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Account Type Distribution
                    </CardTitle>
                    <CardDescription>Breakdown of accounts by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Assets</span>
                        </div>
                        <span className="text-sm font-medium">{stats.assetAccounts} accounts</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Liabilities</span>
                        </div>
                        <span className="text-sm font-medium">{stats.liabilityAccounts} accounts</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Equity</span>
                        </div>
                        <span className="text-sm font-medium">{stats.equityAccounts} accounts</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">Income</span>
                        </div>
                        <span className="text-sm font-medium">{stats.incomeAccounts} accounts</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm">Expenses</span>
                        </div>
                        <span className="text-sm font-medium">{stats.expenseAccounts} accounts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Financial Position
                    </CardTitle>
                    <CardDescription>Key financial metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Assets</span>
                        <span className="text-sm font-medium text-blue-600">
                          {formatCurrency(stats.totalAssets)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Liabilities</span>
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(stats.totalLiabilities)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Equity</span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(stats.totalEquity)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-sm font-medium">Net Worth</span>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(stats.totalAssets - stats.totalLiabilities)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Entry Dialog */}
          {showQuickEntryDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Quick {quickEntryType === 'debit' ? 'Debit' : 'Credit'} Entry
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickEntryDialog(false)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">{quickEntryAccount?.accountCode} - {quickEntryAccount?.accountName}</div>
                      <div className="text-sm text-gray-500">
                        Current Balance: {formatCurrency(Math.abs(quickEntryAccount?.balance || 0))}
                        {quickEntryAccount && ['asset', 'expense'].includes(quickEntryAccount.accountType)
                          ? (quickEntryAccount.balance >= 0 ? ' Dr' : ' Cr')
                          : (quickEntryAccount.balance >= 0 ? ' Cr' : ' Dr')
                        }
                      </div>
                      {quickEntryAmount && parseFloat(quickEntryAmount) > 0 && quickEntryAccount && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border">
                          <div className="text-sm font-medium text-blue-800">Predicted Effect:</div>
                          {(() => {
                            const amount = parseFloat(quickEntryAmount);
                            const effect = calculateNetEffect(
                              quickEntryAccount.accountCode,
                              quickEntryAccount.accountType,
                              quickEntryType === 'debit' ? amount : 0,
                              quickEntryType === 'credit' ? amount : 0
                            );

                            const currentBalance = quickEntryAccount.balance || 0;
                            const newBalance = quickEntryType === 'debit'
                              ? (['asset', 'expense'].includes(quickEntryAccount.accountType) ? currentBalance + amount : currentBalance - amount)
                              : (['asset', 'expense'].includes(quickEntryAccount.accountType) ? currentBalance - amount : currentBalance + amount);

                            return (
                              <div className="text-sm">
                                <div className={`${effect.effectType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                  Balance will {effect.effectType} by {formatCurrency(effect.netEffect)}
                                </div>
                                <div className="text-gray-600">
                                  New Balance: {formatCurrency(Math.abs(newBalance))}
                                  {['asset', 'expense'].includes(quickEntryAccount.accountType)
                                    ? (newBalance >= 0 ? ' Dr' : ' Cr')
                                    : (newBalance >= 0 ? ' Cr' : ' Dr')
                                  }
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {quickEntryType === 'debit' ? 'Debit' : 'Credit'} Amount (RWF)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={quickEntryAmount}
                      onChange={(e) => setQuickEntryAmount(e.target.value)}
                      className="mt-1"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <Input
                      placeholder="Enter transaction description"
                      value={quickEntryDescription}
                      onChange={(e) => setQuickEntryDescription(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Note:</p>
                        <p>This will create a journal entry that needs to be balanced. You'll be able to select the offsetting account in the next step.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowQuickEntryDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitQuickEntry}
                      disabled={!quickEntryAmount || parseFloat(quickEntryAmount) <= 0}
                      className={`flex-1 ${
                        quickEntryType === 'debit'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {quickEntryType === 'debit' ? 'Debit Account' : 'Credit Account'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Transaction Dialog */}
          {showTransactionDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Journal Entry</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTransactionDialog(false)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Transaction Header */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={transactionForm.date}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Reference</label>
                      <Input
                        placeholder="JE-2024-001"
                        value={transactionForm.reference}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, reference: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        placeholder="Transaction description"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Journal Entries */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium">Journal Entries</h4>
                      <Button onClick={addJournalEntry} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    </div>

                    {transactionForm.entries.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4" />
                        <p>No journal entries added yet. Click "Add Entry" to start.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactionForm.entries.map((entry, index) => (
                          <div key={entry.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg bg-gray-50">
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium">Account</label>
                              <Select
                                value={entry.accountCode}
                                onValueChange={(value) => {
                                  const account = updatedAccounts.find(acc => acc.accountCode === value);
                                  if (account) {
                                    handleAccountSelect(account.accountCode, account.accountName, index);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                  {updatedAccounts
                                    .filter(acc => acc.level > 2 && acc.isActive)
                                    .map(account => (
                                      <SelectItem key={account.id} value={account.accountCode}>
                                        {account.accountCode} - {account.accountName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Debit</label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={entry.debitAmount || ''}
                                onChange={(e) => updateJournalEntry(index, 'debitAmount', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Credit</label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={entry.creditAmount || ''}
                                onChange={(e) => updateJournalEntry(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeJournalEntry(index)}
                                className="w-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Transaction Summary */}
                    {transactionForm.entries.length > 0 && (
                      <div className="border-t pt-4 bg-white rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                          <div>
                            <div className="text-sm text-gray-500">Total Debits</div>
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(getTotalDebits())}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Total Credits</div>
                            <div className="text-lg font-bold text-blue-600">
                              {formatCurrency(getTotalCredits())}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Difference</div>
                            <div className={`text-lg font-bold ${isBalanced() ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(Math.abs(getTotalDebits() - getTotalCredits()))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowTransactionDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={submitTransaction}
                            disabled={!isBalanced()}
                            className={isBalanced() ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            {isBalanced() ? 'Post Transaction' : 'Transaction Not Balanced'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Money Dialog */}
          {showTransferDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                    Transfer Money Between Accounts
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTransferDialog(false)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Transfer Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">From Account *</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <div className="font-medium">{transferForm.fromAccountCode}</div>
                        <div className="text-sm text-gray-500">
                          {updatedAccounts.find(acc => acc.accountCode === transferForm.fromAccountCode)?.accountName}
                        </div>
                        <div className="text-sm text-blue-600">
                          Available: {formatCurrency(getAvailableBalance(
                            transferForm.fromAccountCode,
                            updatedAccounts.find(acc => acc.accountCode === transferForm.fromAccountCode)?.accountType || ''
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">To Account *</label>
                      <Select
                        value={transferForm.toAccountCode}
                        onValueChange={(value) => setTransferForm(prev => ({ ...prev, toAccountCode: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select destination account" />
                        </SelectTrigger>
                        <SelectContent>
                          {updatedAccounts
                            .filter(acc => acc.level > 2 && acc.isActive && acc.accountCode !== transferForm.fromAccountCode)
                            .map(account => (
                              <SelectItem key={account.id} value={account.accountCode}>
                                {account.accountCode} - {account.accountName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Amount (RWF) *</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={transferForm.amount}
                        onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="mt-1"
                        min="0"
                        step="0.01"
                      />
                      {transferForm.amount && (
                        <div className="mt-1 text-xs">
                          {canTransferFrom(transferForm.fromAccountCode, parseFloat(transferForm.amount) || 0) ? (
                            <span className="text-green-600">✓ Transfer amount is valid</span>
                          ) : (
                            <span className="text-red-600">⚠ Insufficient balance for transfer</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Reference</label>
                      <Input
                        placeholder="Transfer reference"
                        value={transferForm.reference}
                        onChange={(e) => setTransferForm(prev => ({ ...prev, reference: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Description *</label>
                      <Input
                        placeholder="Transfer description"
                        value={transferForm.description}
                        onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Transfer Preview */}
                  {transferForm.fromAccountCode && transferForm.toAccountCode && transferForm.amount && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Transfer Preview</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">From Account:</div>
                          <div className="font-medium">{transferForm.fromAccountCode}</div>
                          <div className="text-red-600">- {formatCurrency(parseFloat(transferForm.amount))}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">To Account:</div>
                          <div className="font-medium">{transferForm.toAccountCode}</div>
                          <div className="text-green-600">+ {formatCurrency(parseFloat(transferForm.amount))}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Important:</p>
                        <p>This will create a journal entry to transfer money between accounts. Both account balances will be updated immediately.</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowTransferDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitTransfer}
                      disabled={!transferForm.fromAccountCode || !transferForm.toAccountCode || !transferForm.amount || !transferForm.description}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Transfer Money
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
