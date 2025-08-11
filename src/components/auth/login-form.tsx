'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const { login, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      onSuccess?.();
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };



  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign In
            </CardTitle>
          </div>
          <ThemeToggle className="h-8 w-8" />
        </div>
        <CardDescription className="text-center">
          Enter your credentials to access the ERP system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Input
              {...register('email')}
              type="email"
              placeholder="Enter your email"
              label="Email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                label="Password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <input
              {...register('rememberMe')}
              type="checkbox"
              id="rememberMe"
              className="rounded border-input text-primary focus:ring-primary"
              disabled={isLoading}
            />
            <label
              htmlFor="rememberMe"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>

          {/* Error Display */}
          {(error || errors.root) && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">
                {error || errors.root?.message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2 text-muted-foreground">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Admin:</strong> admin@ines.ac.rw / admin123</p>
              <p><strong>Bursar:</strong> bursar@ines.ac.rw / bursar123</p>
              <p><strong>Store Manager:</strong> storemanager@ines.ac.rw / store123</p>
              <p><strong>Auditor:</strong> auditor@ines.ac.rw / audit123</p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Quick login buttons for demo
export function DemoLoginButtons({ onSuccess }: { onSuccess?: () => void }) {
  const { login, isLoading } = useAuthStore();

  const demoUsers = [
    { role: 'Admin', email: 'admin@ines.ac.rw', password: 'admin123' },
    { role: 'Bursar', email: 'bursar@ines.ac.rw', password: 'bursar123' },
    { role: 'Store Manager', email: 'storemanager@ines.ac.rw', password: 'store123' },
    { role: 'Auditor', email: 'auditor@ines.ac.rw', password: 'audit123' },
  ];

  const handleDemoLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      onSuccess?.();
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-center">Quick Demo Login:</p>
      <div className="grid grid-cols-2 gap-2">
        {demoUsers.map((user, index) => (
          <Button
            key={`demo-login-${index}`}
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin(user.email, user.password)}
            disabled={isLoading}
          >
            {user.role}
          </Button>
        ))}
      </div>
    </div>
  );
}
