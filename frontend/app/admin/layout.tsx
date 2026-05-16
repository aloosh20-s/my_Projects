"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Dashboard</Link>
          <Link href="/admin/users" className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Users</Link>
          <Link href="/admin/workers" className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Workers</Link>
          <Link href="/admin/services" className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Services</Link>
          <Link href="/admin/bookings" className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Bookings</Link>
          <Link href="/admin/reports" className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Reports</Link>
          <Link href="/admin/security-logs" className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Security Logs</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
