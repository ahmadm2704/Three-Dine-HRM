import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Three Dine Corporation - HRIS',
  description: 'Official Human Resources Information System for Three Dine Corporation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased selection:bg-primary/30", geist.variable)} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
