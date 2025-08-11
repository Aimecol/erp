import React from 'react';
import { Clock, User, ShoppingCart, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelativeTime, getInitials } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'sales_order' | 'purchase_order' | 'payment' | 'inventory' | 'user';
  title: string;
  description: string;
  user?: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  title?: string;
  description?: string;
  className?: string;
  loading?: boolean;
  maxItems?: number;
}

const activityIcons = {
  sales_order: ShoppingCart,
  purchase_order: Package,
  payment: DollarSign,
  inventory: Package,
  user: User,
};

const activityColors = {
  sales_order: 'text-blue-600',
  purchase_order: 'text-green-600',
  payment: 'text-yellow-600',
  inventory: 'text-purple-600',
  user: 'text-gray-600',
};

export function RecentActivity({
  activities,
  title = 'Recent Activity',
  description = 'Latest system activities',
  className,
  loading = false,
  maxItems = 10,
}: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayActivities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const iconColor = activityColors[activity.type];

            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-muted ${iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    {activity.user && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground">by</span>
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(activity.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {activity.user.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {formatRelativeTime(activity.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Mock data for demonstration
export const mockRecentActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'sales_order',
    title: 'New Sales Order Created',
    description: 'SO-2024-001 for $6,480 created',
    user: { name: 'Mike Wilson' },
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    description: 'Invoice INV-2024-001 paid in full',
    user: { name: 'Sarah Johnson' },
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  },
  {
    id: '3',
    type: 'inventory',
    title: 'Stock Level Alert',
    description: 'A4 Paper below minimum stock level',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: '4',
    type: 'purchase_order',
    title: 'Purchase Order Approved',
    description: 'PO-2024-001 for $16,480 approved',
    user: { name: 'Lisa Chen' },
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
  },
  {
    id: '5',
    type: 'user',
    title: 'New User Registered',
    description: 'David Brown joined as Production Manager',
    user: { name: 'John Admin' },
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  },
];
