import type { Metadata } from 'next';
import './globals.css';
import { CommandCenterProvider } from '../context/CommandCenterContext';

export const metadata: Metadata = {
  title: 'PRINCE — Personal Productivity Command Center',
  description: 'High-signal personal operating system for deep research, academic planning, habit tracking, and cognitive load minimization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        <CommandCenterProvider>
          {children}
        </CommandCenterProvider>
      </body>
    </html>
  );
}
