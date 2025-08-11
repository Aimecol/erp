'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/data-table/data-table';
import { SalesOrder } from '@/types';
import { apiUtils } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PermissionGuard } from '@/components/auth/permission-guard';

const statusColors = {
  draft: 'secondary',
  open: 'default',
  delivered: 'success',
  closed: 'success',
  cancelled: 'destructive',
} as const;

export default function SalesOrdersPage() {
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState<Record<string, any>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['sales-orders', page, filters],
    queryFn: () => apiUtils.getPaginated<SalesOrder>('/v1/sales/orders', page, 20, filters),
  });

  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: 'number',
      header: 'Order Number',
      cell: ({ row }) => (
        <Link 
          href={`/sales/orders/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.getValue('number')}
        </Link>
      ),
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customer.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.customer.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Order Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const dueDate = row.getValue('dueDate') as Date;
        return dueDate ? formatDate(dueDate) : '-';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as keyof typeof statusColors;
        return (
          <Badge variant={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue('total'), row.original.currency)}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/sales/orders/${order.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <PermissionGuard resource="sales" action="update">
                <DropdownMenuItem asChild>
                  <Link href={`/sales/orders/${order.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              </PermissionGuard>
              <DropdownMenuSeparator />
              <PermissionGuard resource="sales" action="delete">
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load sales orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-muted-foreground">
            Manage your sales orders and track customer purchases
          </p>
        </div>
        <PermissionGuard resource="sales" action="create">
          <Button asChild>
            <Link href="/sales/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        </PermissionGuard>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        searchKey="number"
        searchPlaceholder="Search orders..."
        loading={isLoading}
        emptyMessage="No sales orders found."
      />
    </div>
  );
}
