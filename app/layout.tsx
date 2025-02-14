import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DU Desk',
  description: 'Chat assistant',
  icons: {
    icon: '/favicon.ico', // Standard .ico favicon for most browsers
    apple: '/apple-touch-icon.png', // Apple touch icon for Safari on macOS and iOS
    shortcut: '/favicon.svg', // Fallback for other browsers that support SVG
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
