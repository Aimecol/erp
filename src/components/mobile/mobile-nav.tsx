'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Bell,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePermissions } from '@/components/auth/permission-guard';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const { canRead, userRole } = usePermissions();
  const [isOpen, setIsOpen] = React.useState(false);

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      permission: 'dashboard',
    },
    {
      title: 'Students',
      href: '/students',
      icon: Users,
      permission: 'students',
    },
    {
      title: 'Financial',
      href: '/financial',
      icon: CreditCard,
      permission: 'financial',
    },
    {
      title: 'Reports',
      href: '/reports',
      icon: BarChart3,
      permission: 'reports',
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      permission: 'settings',
    },
  ];

  const filteredItems = navigationItems.filter(item => 
    canRead(item.permission)
  );

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          {filteredItems.slice(0, 4).map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            );
          })}
          
          {/* More Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gray-900">
                <Menu className="h-5 w-5" />
                <span className="text-xs font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {filteredItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  );
                })}
                
                <div className="border-t pt-4 mt-4">
                  <Link
                    href="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="font-medium">Notifications</span>
                    <Badge variant="secondary" className="ml-auto">3</Badge>
                  </Link>
                  
                  <Link
                    href="/mobile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Mobile Dashboard</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-semibold">INES-Ruhengeri</h1>
            <p className="text-sm text-gray-600">{userRole}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:hidden min-h-screen bg-gray-50 pb-16">
      <MobileNav />
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export function MobileCard({ 
  title, 
  description, 
  children, 
  className = '' 
}: { 
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export function MobileMetric({ 
  label, 
  value, 
  icon: Icon, 
  color = 'blue' 
}: { 
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  );
}

export function MobileActionButton({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  color = 'blue' 
}: { 
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
        <div>
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
    </button>
  );
}
