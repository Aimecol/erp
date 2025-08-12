'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search, HelpCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function NotFoundPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const quickLinks = [
    { href: '/dashboard', label: 'Dashboard', description: 'Main system overview' },
    { href: '/students', label: 'Student Accounts', description: 'Manage student billing and statements' },
    { href: '/accounting', label: 'Accounting', description: 'Financial management and reporting' },
    { href: '/payroll', label: 'Payroll', description: 'Employee payroll and benefits' },
    { href: '/procurement', label: 'Procurement', description: 'Purchase orders and vendor management' },
    { href: '/assets', label: 'Asset Management', description: 'Track and manage institutional assets' },
    { href: '/reports', label: 'Financial Reports', description: 'Comprehensive financial statements' },
    { href: '/admin', label: 'System Administration', description: 'User management and system settings' },
  ];

  const supportOptions = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: 'Email Support',
      description: 'Send us an email for technical assistance',
      contact: 'support@ines.ac.rw',
      action: 'mailto:support@ines.ac.rw'
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: 'Phone Support',
      description: 'Call our technical support team',
      contact: '+250 788 123 456',
      action: 'tel:+250788123456'
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: 'Help Documentation',
      description: 'Browse our comprehensive user guides',
      contact: 'View Documentation',
      action: '/help'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400 mb-4">404</h1>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The page you're looking for doesn't exist in the INES-Ruhengeri ERP System. 
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button onClick={() => router.back()} variant="outline" size="lg">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </Button>
            <Link href="/dashboard">
              <Button size="lg">
                <Home className="h-5 w-5 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Section */}
        <Card className="max-w-2xl mx-auto mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search the System
            </CardTitle>
            <CardDescription>
              Try searching for what you were looking for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for pages, features, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Quick Access to System Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Link key={index} href={link.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
                  <CardHeader>
                    <CardTitle className="text-lg">{link.label}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Need Help? Contact Support
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportOptions.map((option, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                      {option.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={option.action}>
                    <Button variant="outline" className="w-full">
                      {option.contact}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            © 2024 Institut d'Enseignement Supérieur de Ruhengeri (INES-Ruhengeri)
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            ERP System - Comprehensive Institutional Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}
