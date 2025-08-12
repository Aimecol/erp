'use client';

import React from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, CheckCircle, XCircle, FileText, Calendar, RefreshCw, Trash2, ArrowRightLeft, Send, AlertTriangle } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/auth-provider';
import { usePermissions } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccounting } from '@/contexts/accounting-context';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function JournalEntriesPage() {
  const { canRead, canCreate, canUpdate, canApprove } = usePermissions();
  const { journalEntries, postJournalEntry, reverseJournalEntry, transferMoney, getAvailableBalance, canTransferFrom } = useAccounting();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedType, setSelectedType] = React.useState('all');
  const [selectedSource, setSelectedSource] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('month');
  const [showTransferDialog, setShowTransferDialog] = React.useState(false);
  const [selectedEntry, setSelectedEntry] = React.useState<any>(null);
  const [transferForm, setTransferForm] = React.useState({
    fromAccountCode: '',
    toAccountCode: '',
    amount: '',
    description: '',
    reference: ''
  });

  // Check permissions
  if (!canRead('accounting')) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">You don't have permission to view journal entries.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Filter journal entries based on search and filters
  const filteredJournalEntries = React.useMemo(() => {
    return journalEntries.filter(entry => {
      const matchesSearch = searchTerm === '' ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;
      const matchesType = selectedType === 'all' || entry.entryType === selectedType;
      const matchesSource = selectedSource === 'all' || entry.source === selectedSource;

      // Simple period filtering
      const entryDate = new Date(entry.entryDate);
      const now = new Date();
      let matchesPeriod = true;

      if (dateRange === 'month') {
        matchesPeriod = entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'year') {
        matchesPeriod = entryDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesStatus && matchesType && matchesSource && matchesPeriod;
    });
  }, [journalEntries, searchTerm, selectedStatus, selectedType, selectedSource, dateRange]);

  // Calculate stats from journal entries
  const stats = React.useMemo(() => {
    const totalEntries = journalEntries.length;
    const postedEntries = journalEntries.filter(e => e.status === 'posted').length;
    const draftEntries = journalEntries.filter(e => e.status === 'draft').length;
    const reversedEntries = journalEntries.filter(e => e.status === 'reversed').length;
    const totalDebits = journalEntries.reduce((sum, entry) => sum + entry.totalDebit, 0);
    const totalCredits = journalEntries.reduce((sum, entry) => sum + entry.totalCredit, 0);

    return {
      totalEntries,
      postedEntries,
      draftEntries,
      reversedEntries,
      totalDebits,
      totalCredits
    };
  }, [journalEntries]);

  const entries = filteredJournalEntries;

  // Transfer functions
  const openTransferDialog = (entry: any) => {
    setSelectedEntry(entry);
    setTransferForm({
      fromAccountCode: '',
      toAccountCode: '',
      amount: '',
      description: `Transfer from Journal Entry ${entry.entryNumber}`,
      reference: `TRF-${entry.entryNumber}`
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
      setSelectedEntry(null);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      posted: 'default',
      reversed: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      manual: 'default',
      automatic: 'secondary',
      adjustment: 'outline',
      closing: 'destructive'
    };
    return variants[type] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'reversed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      accessorKey: 'entryNumber',
      header: 'Entry Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.entryNumber}</div>
      ),
    },
    {
      accessorKey: 'entryDate',
      header: 'Entry Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.entryDate)}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.description}</div>
          <div className="text-sm text-muted-foreground">{row.original.reference}</div>
        </div>
      ),
    },
    {
      accessorKey: 'entryType',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant={getTypeBadge(row.original.entryType)}>
          {row.original.entryType.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }: any) => {
        const source = row.original.source;
        const isTransfer = source === 'transfer';
        return (
          <div className={`text-sm flex items-center gap-1 ${isTransfer ? 'text-purple-600 font-medium' : ''}`}>
            {isTransfer && <ArrowRightLeft className="h-3 w-3" />}
            {source.toUpperCase().replace('-', ' ')}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalDebit',
      header: 'Total Debit',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.totalDebit)}</div>
      ),
    },
    {
      accessorKey: 'totalCredit',
      header: 'Total Credit',
      cell: ({ row }: any) => (
        <div className="font-medium">{formatCurrency(row.original.totalCredit)}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <Badge variant={getStatusBadge(row.original.status)}>
            {row.original.status.toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'createdBy',
      header: 'Created By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.createdBy}</div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const entry = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" title="View Details">
              <Eye className="h-4 w-4" />
            </Button>
            {canUpdate('accounting') && entry.status === 'draft' && (
              <Button variant="ghost" size="sm" title="Edit Entry">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canApprove('accounting') && entry.status === 'draft' && (
              <Button
                variant="ghost"
                size="sm"
                title="Post Entry"
                onClick={() => {
                  postJournalEntry(entry.id);
                  alert(`Journal entry ${entry.entryNumber} has been posted successfully!`);
                }}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            {canApprove('accounting') && entry.status === 'posted' && (
              <Button
                variant="ghost"
                size="sm"
                title="Reverse Entry"
                onClick={() => {
                  if (confirm(`Are you sure you want to reverse journal entry ${entry.entryNumber}? This action cannot be undone.`)) {
                    reverseJournalEntry(entry.id);
                    alert(`Journal entry ${entry.entryNumber} has been reversed successfully!`);
                  }
                }}
                className="text-red-600 hover:text-red-700"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {canCreate('accounting') && entry.status === 'posted' && (
              <Button
                variant="ghost"
                size="sm"
                title="Transfer Money"
                onClick={() => openTransferDialog(entry)}
                className="text-blue-600 hover:text-blue-700"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" title="Download">
              <Download className="h-4 w-4" />
            </Button>
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
              <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
              <p className="text-muted-foreground">
                Manage general journal entries and accounting transactions
              </p>
            </div>
            {canCreate('accounting') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Entry
              </Button>
            )}
          </div>

          {/* Entry Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEntries}</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalDebits)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All entries
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft Entries</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.draftEntries}</div>
                <p className="text-xs text-muted-foreground">
                  Pending posting
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Posted Entries</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.postedEntries}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully posted
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Journal Entries List */}
          <Card>
            <CardHeader>
              <CardTitle>Journal Entries</CardTitle>
              <CardDescription>
                View and manage all journal entries and accounting transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Entry Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="closing">Closing</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="chart-of-accounts">Chart of Accounts</SelectItem>
                    <SelectItem value="transfer">Transfers</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="reversed">Reversed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={entries}
                loading={false}
                searchable={false}
                filterable={false}
              />
            </CardContent>
          </Card>

          {/* Transfer Money Dialog */}
          {showTransferDialog && selectedEntry && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                    Transfer Money from Journal Entry
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
                  {/* Source Entry Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Source Journal Entry</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Entry Number:</span>
                        <span className="ml-2 font-medium">{selectedEntry.entryNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-2">{formatDate(selectedEntry.entryDate)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Description:</span>
                        <span className="ml-2">{selectedEntry.description}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Debit:</span>
                        <span className="ml-2 font-medium text-green-600">{formatCurrency(selectedEntry.totalDebit)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Credit:</span>
                        <span className="ml-2 font-medium text-blue-600">{formatCurrency(selectedEntry.totalCredit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">From Account *</label>
                      <Select
                        value={transferForm.fromAccountCode}
                        onValueChange={(value) => setTransferForm(prev => ({ ...prev, fromAccountCode: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select source account" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedEntry.lines?.map((line: any) => (
                            <SelectItem key={line.id} value={line.accountCode}>
                              {line.accountCode} - {line.accountName}
                              {line.debitAmount > 0 && (
                                <span className="ml-2 text-green-600">
                                  (Dr: {formatCurrency(line.debitAmount)})
                                </span>
                              )}
                              {line.creditAmount > 0 && (
                                <span className="ml-2 text-blue-600">
                                  (Cr: {formatCurrency(line.creditAmount)})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">To Account *</label>
                      <Input
                        placeholder="Enter destination account code"
                        value={transferForm.toAccountCode}
                        onChange={(e) => setTransferForm(prev => ({ ...prev, toAccountCode: e.target.value }))}
                        className="mt-1"
                      />
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
                      {transferForm.fromAccountCode && transferForm.amount && (
                        <div className="mt-1 text-xs">
                          {canTransferFrom(transferForm.fromAccountCode, parseFloat(transferForm.amount) || 0) ? (
                            <span className="text-green-600">✓ Sufficient balance available</span>
                          ) : (
                            <span className="text-red-600">⚠ Insufficient balance</span>
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

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Important:</p>
                        <p>This will create a new journal entry to transfer money between accounts. The original journal entry will remain unchanged.</p>
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
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
