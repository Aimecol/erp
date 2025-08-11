'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, Edit, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/data-table/data-table';
import { BusinessPartner } from '@/types';
import { useBusinessPartners } from '@/hooks/api/use-business-partners';
import { formatCurrency } from '@/lib/utils';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function CustomersPage() {
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState({ type: 'customer' });

  const { data, isLoading, error } = useBusinessPartners(page, 20, filters);

  const columns: ColumnDef<BusinessPartner>[] = [
    {
      accessorKey: 'code',
      header: 'Customer Code',
      cell: ({ row }) => (
        <Link 
          href={`/sales/customers/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.getValue('code')}
        </Link>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Customer Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.getValue('email') || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.getValue('phone') || '-',
    },
    {
      accessorKey: 'creditLimit',
      header: 'Credit Limit',
      cell: ({ row }) => {
        const limit = row.getValue('creditLimit') as number;
        return limit ? formatCurrency(limit) : '-';
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('isActive') ? 'success' : 'secondary'}>
          {row.getValue('isActive') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const customer = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/sales/customers/${customer.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <PermissionGuard resource="sales" action="update">
                <DropdownMenuItem asChild>
                  <Link href={`/sales/customers/${customer.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database and relationships
          </p>
        </div>
        <PermissionGuard resource="sales" action="create">
          <Button asChild>
            <Link href="/sales/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              New Customer
            </Link>
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        searchKey="name"
        searchPlaceholder="Search customers..."
        loading={isLoading}
        emptyMessage="No customers found."
      />
    </div>
  );
}
