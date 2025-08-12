'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
}

interface JournalEntryData {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  reference: string;
  entryType: 'manual' | 'automatic' | 'adjustment' | 'closing';
  source: 'general' | 'chart-of-accounts' | 'sales' | 'purchase' | 'payroll' | 'bank' | 'inventory' | 'transfer';
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  createdBy: string;
  createdAt: string;
  lines: JournalEntryLine[];
}

interface AccountBalance {
  accountCode: string;
  balance: number;
  debitBalance: number;
  creditBalance: number;
  previousBalance: number;
  lastTransactionAmount: number;
  lastTransactionType: 'debit' | 'credit';
  lastTransactionDate: string;
}

interface TransferRequest {
  fromAccountCode: string;
  toAccountCode: string;
  amount: number;
  description: string;
  reference?: string;
}

interface AccountingContextType {
  journalEntries: JournalEntryData[];
  accountBalances: Map<string, AccountBalance>;
  addJournalEntry: (entry: Omit<JournalEntryData, 'id' | 'entryNumber' | 'createdAt'>) => string;
  updateAccountBalances: (lines: JournalEntryLine[]) => void;
  getAccountBalance: (accountCode: string) => AccountBalance | null;
  getAccountBalanceChange: (accountCode: string) => { amount: number; type: 'increase' | 'decrease' } | null;
  calculateNetEffect: (accountCode: string, accountType: string, debitAmount: number, creditAmount: number) => { netEffect: number; effectType: 'increase' | 'decrease' };
  transferMoney: (transfer: TransferRequest) => string;
  getAvailableBalance: (accountCode: string, accountType: string) => number;
  canTransferFrom: (accountCode: string, amount: number) => boolean;
  postJournalEntry: (entryId: string) => void;
  reverseJournalEntry: (entryId: string) => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export function AccountingProvider({ children }: { children: React.ReactNode }) {
  const [journalEntries, setJournalEntries] = useState<JournalEntryData[]>([]);
  const [accountBalances, setAccountBalances] = useState<Map<string, AccountBalance>>(new Map());

  const generateEntryNumber = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const sequence = journalEntries.length + 1;
    return `JE-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }, [journalEntries.length]);

  const addJournalEntry = useCallback((entry: Omit<JournalEntryData, 'id' | 'entryNumber' | 'createdAt'>) => {
    const newEntry: JournalEntryData = {
      ...entry,
      id: `je-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryNumber: generateEntryNumber(),
      createdAt: new Date().toISOString(),
    };

    setJournalEntries(prev => [newEntry, ...prev]);
    
    // If the entry is posted, update account balances immediately
    if (newEntry.status === 'posted') {
      updateAccountBalances(newEntry.lines);
    }

    return newEntry.id;
  }, [generateEntryNumber]);

  const updateAccountBalances = useCallback((lines: JournalEntryLine[]) => {
    setAccountBalances(prev => {
      const newBalances = new Map(prev);
      const currentDate = new Date().toISOString();

      lines.forEach(line => {
        const currentBalance = newBalances.get(line.accountCode) || {
          accountCode: line.accountCode,
          balance: 0,
          debitBalance: 0,
          creditBalance: 0,
          previousBalance: 0,
          lastTransactionAmount: 0,
          lastTransactionType: 'debit' as const,
          lastTransactionDate: currentDate
        };

        // Store previous balance before updating
        const previousBalance = currentBalance.balance;

        // Update balances based on debit/credit amounts
        const newDebitBalance = currentBalance.debitBalance + line.debitAmount;
        const newCreditBalance = currentBalance.creditBalance + line.creditAmount;
        const newBalance = newDebitBalance - newCreditBalance;

        // Determine transaction type and amount
        const transactionAmount = line.debitAmount > 0 ? line.debitAmount : line.creditAmount;
        const transactionType = line.debitAmount > 0 ? 'debit' : 'credit';

        newBalances.set(line.accountCode, {
          accountCode: line.accountCode,
          balance: newBalance,
          debitBalance: newDebitBalance,
          creditBalance: newCreditBalance,
          previousBalance: previousBalance,
          lastTransactionAmount: transactionAmount,
          lastTransactionType: transactionType,
          lastTransactionDate: currentDate
        });
      });

      return newBalances;
    });
  }, []);

  const getAccountBalance = useCallback((accountCode: string) => {
    return accountBalances.get(accountCode) || null;
  }, [accountBalances]);

  const getAccountBalanceChange = useCallback((accountCode: string) => {
    const balance = accountBalances.get(accountCode);
    if (!balance || balance.previousBalance === balance.balance) {
      return null;
    }

    const change = balance.balance - balance.previousBalance;
    return {
      amount: Math.abs(change),
      type: change > 0 ? 'increase' : 'decrease'
    };
  }, [accountBalances]);

  const calculateNetEffect = useCallback((accountCode: string, accountType: string, debitAmount: number, creditAmount: number) => {
    // Determine the net effect based on account type and transaction amounts
    let netEffect = 0;
    let effectType: 'increase' | 'decrease' = 'increase';

    if (['asset', 'expense'].includes(accountType.toLowerCase())) {
      // For assets and expenses: Debits increase, Credits decrease
      netEffect = debitAmount - creditAmount;
      effectType = netEffect >= 0 ? 'increase' : 'decrease';
    } else if (['liability', 'equity', 'income', 'revenue'].includes(accountType.toLowerCase())) {
      // For liabilities, equity, and income: Credits increase, Debits decrease
      netEffect = creditAmount - debitAmount;
      effectType = netEffect >= 0 ? 'increase' : 'decrease';
    }

    return {
      netEffect: Math.abs(netEffect),
      effectType
    };
  }, []);

  const getAvailableBalance = useCallback((accountCode: string, accountType: string) => {
    const balance = accountBalances.get(accountCode);
    if (!balance) return 0;

    // For asset accounts, available balance is the positive balance
    // For liability/equity accounts, available balance is the credit balance
    if (['asset', 'expense'].includes(accountType.toLowerCase())) {
      return Math.max(0, balance.balance);
    } else {
      return Math.max(0, -balance.balance); // Negative balance means credit balance for these accounts
    }
  }, [accountBalances]);

  const canTransferFrom = useCallback((accountCode: string, amount: number) => {
    const balance = accountBalances.get(accountCode);
    if (!balance) return false;

    // For simplicity, we'll allow transfers from any account with sufficient balance
    // In a real system, you might have more complex rules
    return Math.abs(balance.balance) >= amount;
  }, [accountBalances]);

  const transferMoney = useCallback((transfer: TransferRequest) => {
    // Validate transfer
    if (transfer.amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    if (transfer.fromAccountCode === transfer.toAccountCode) {
      throw new Error('Cannot transfer to the same account');
    }

    if (!canTransferFrom(transfer.fromAccountCode, transfer.amount)) {
      throw new Error('Insufficient balance in source account');
    }

    // Create transfer journal entry
    const transferLines: JournalEntryLine[] = [
      {
        id: `transfer-${Date.now()}-from`,
        accountCode: transfer.fromAccountCode,
        accountName: `Transfer from ${transfer.fromAccountCode}`,
        debitAmount: 0,
        creditAmount: transfer.amount
      },
      {
        id: `transfer-${Date.now()}-to`,
        accountCode: transfer.toAccountCode,
        accountName: `Transfer to ${transfer.toAccountCode}`,
        debitAmount: transfer.amount,
        creditAmount: 0
      }
    ];

    const journalEntry = {
      entryDate: new Date().toISOString().split('T')[0],
      description: transfer.description,
      reference: transfer.reference || `TRF-${Date.now()}`,
      entryType: 'manual' as const,
      source: 'transfer' as const,
      totalDebit: transfer.amount,
      totalCredit: transfer.amount,
      status: 'posted' as const,
      createdBy: 'Current User',
      lines: transferLines
    };

    return addJournalEntry(journalEntry);
  }, [addJournalEntry, canTransferFrom]);

  const postJournalEntry = useCallback((entryId: string) => {
    setJournalEntries(prev => prev.map(entry => {
      if (entry.id === entryId && entry.status === 'draft') {
        const updatedEntry = { ...entry, status: 'posted' as const };
        // Update account balances when posting
        updateAccountBalances(entry.lines);
        return updatedEntry;
      }
      return entry;
    }));
  }, [updateAccountBalances]);

  const reverseJournalEntry = useCallback((entryId: string) => {
    setJournalEntries(prev => prev.map(entry => {
      if (entry.id === entryId && entry.status === 'posted') {
        // Create reverse entries to undo the balance changes
        const reverseLines = entry.lines.map(line => ({
          ...line,
          id: `reverse-${line.id}`,
          debitAmount: line.creditAmount,
          creditAmount: line.debitAmount
        }));
        
        // Update balances with reverse entries
        updateAccountBalances(reverseLines);
        
        return { ...entry, status: 'reversed' as const };
      }
      return entry;
    }));
  }, [updateAccountBalances]);

  const value: AccountingContextType = {
    journalEntries,
    accountBalances,
    addJournalEntry,
    updateAccountBalances,
    getAccountBalance,
    getAccountBalanceChange,
    calculateNetEffect,
    transferMoney,
    getAvailableBalance,
    canTransferFrom,
    postJournalEntry,
    reverseJournalEntry,
  };

  return (
    <AccountingContext.Provider value={value}>
      {children}
    </AccountingContext.Provider>
  );
}

export function useAccounting() {
  const context = useContext(AccountingContext);
  if (context === undefined) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
}
