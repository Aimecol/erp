'use client';

import React from 'react';
import { useTheme } from '@/hooks/use-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);
  const { theme } = useTheme();

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return children without theme-dependent styling during SSR
    return <>{children}</>;
  }

  return <>{children}</>;
}
