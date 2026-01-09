import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevTutorials - Intermediate Developer Tutorials | Expert-Vetted, Project-Based Learning',
  description: 'Escape tutorial hell with expert-vetted, project-based tutorials for intermediate developers. 6-month freshness guarantee, one-time purchases, no subscriptions. Join 5,000+ developers advancing their careers.',
  keywords: 'intermediate developer tutorials, advanced react tutorial, project-based programming, full-stack development course, node.js tutorial, typescript course, web development learning path',
  openGraph: {
    title: 'DevTutorials - Finally, Tutorials for Intermediate Developers',
    description: 'Bridge the gap from junior to mid-level developer. Expert-vetted, project-based tutorials with a 6-month freshness guarantee. No subscriptions.',
    type: 'website',
    url: 'https://devtutorials.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
