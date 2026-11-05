import { Instrument_Sans } from 'next/font/google';
import './globals.css';

const ui = Instrument_Sans({ subsets: ['latin'], variable: '--font-ui', display: 'swap' });

export const metadata = {
  title: 'Land Management System',
  description: 'A simple, secure land management system for plots, buyers, sales, receipts and payments.',
  manifest: '/manifest.json',
  icons: { icon: '/assets/brand-logo.jpg', apple: '/assets/brand-logo.jpg' },
  appleWebApp: { capable: true, title: 'LandLedger', statusBarStyle: 'black-translucent' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b1f16',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={ui.variable}>
      <body className="auth-locked">{children}</body>
    </html>
  );
}
