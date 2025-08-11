'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const initMSW = async () => {
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('NEXT_PUBLIC_ENABLE_MSW:', process.env.NEXT_PUBLIC_ENABLE_MSW);

      // Enable MSW in development
      if (process.env.NODE_ENV === 'development') {
        try {
          console.log('Importing MSW worker...');
          const { worker } = await import('@/mocks/browser');
          console.log('Starting MSW worker...');
          await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
              url: '/mockServiceWorker.js',
            },
            quiet: false, // Enable logging to debug
          });
          console.log('MSW started successfully');
          setMswReady(true);
        } catch (error) {
          console.error('Failed to start MSW:', error);
          setMswReady(true); // Continue anyway
        }
      } else {
        console.log('MSW disabled in production');
        setMswReady(true);
      }
    };

    initMSW();
  }, []);

  if (!mswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
