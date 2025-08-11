'use client';

import { useRouter } from 'next/navigation';
import { LoginForm, DemoLoginButtons } from '@/components/auth/login-form';
import { PublicRoute } from '@/components/auth/auth-provider';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              ERP System
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Business Management Platform
            </p>
          </div>

          <LoginForm onSuccess={handleLoginSuccess} />

          <div className="mt-6">
            <DemoLoginButtons onSuccess={handleLoginSuccess} />
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
