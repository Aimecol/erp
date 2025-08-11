import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: number;
  previousValue?: number;
  change?: number;
  format?: 'currency' | 'number' | 'percentage';
  currency?: string;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function KpiCard({
  title,
  value,
  previousValue,
  change,
  format = 'number',
  currency = 'RWF',
  icon,
  className,
  loading = false,
}: KpiCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val, currency);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return formatNumber(val);
    }
  };

  const isPositive = change !== undefined ? change > 0 : false;
  const isNegative = change !== undefined ? change < 0 : false;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardTitle>
          {icon && (
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          )}
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            {isPositive && <FontAwesomeIcon icon={faArrowTrendUp} className="mr-1 h-3 w-3 text-success-600" />}
            {isNegative && <FontAwesomeIcon icon={faArrowTrendDown} className="mr-1 h-3 w-3 text-danger-600" />}
            <span
              className={cn(
                isPositive && 'text-success-600',
                isNegative && 'text-danger-600'
              )}
            >
              {isPositive && '+'}
              {change.toFixed(1)}%
            </span>
            <span className="ml-1">from last period</span>
          </div>
        )}
        {previousValue !== undefined && change === undefined && (
          <p className="text-xs text-muted-foreground">
            Previous: {formatValue(previousValue)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
