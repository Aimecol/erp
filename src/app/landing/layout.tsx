import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'INES-Ruhengeri ERP System | Higher Education Management',
  description: 'Comprehensive ERP solution for Institut d\'Enseignement Supérieur de Ruhengeri. Manage academics, finances, HR, and operations with beautiful dashboards and RWF currency support.',
  keywords: [
    'INES-Ruhengeri',
    'ERP System',
    'Higher Education',
    'Rwanda',
    'Academic Management',
    'Financial Management',
    'Student Information System',
    'RWF Currency',
    'University Management',
    'Educational Technology'
  ],
  authors: [{ name: 'INES-Ruhengeri Development Team' }],
  creator: 'INES-Ruhengeri',
  publisher: 'Institut d\'Enseignement Supérieur de Ruhengeri',
  openGraph: {
    title: 'INES-Ruhengeri ERP System',
    description: 'Comprehensive ERP solution for higher education institutions in Rwanda',
    url: 'https://erp.ines.ac.rw',
    siteName: 'INES-Ruhengeri ERP',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'INES-Ruhengeri ERP System Dashboard',
      },
    ],
    locale: 'en_RW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INES-Ruhengeri ERP System',
    description: 'Comprehensive ERP solution for higher education institutions in Rwanda',
    images: ['/og-image.png'],
    creator: '@ines_ruhengeri',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://erp.ines.ac.rw',
  },
  category: 'Education Technology',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-page">
      {children}
    </div>
  );
}
