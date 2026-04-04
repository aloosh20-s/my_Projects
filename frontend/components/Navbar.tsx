"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Moon, Sun, Briefcase, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { user, logout } = useAuth();

  // Quick toggle dark mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Initial check
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">LocalWork</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/services" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
              Find Services
            </Link>
            <Link href="/workers" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
              Browse Workers
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href={user.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard'} className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
                    <UserIcon className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button onClick={logout} className="font-medium text-red-600 dark:text-red-400 hover:underline transition-colors">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Log in
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex md:hidden items-center gap-4">
             <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 dark:text-slate-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/services" className="block px-3 py-2 rounded-md font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              Find Services
            </Link>
            <Link href="/workers" className="block px-3 py-2 rounded-md font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              Browse Workers
            </Link>
            {user ? (
              <>
                <Link href={user.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard'} className="block px-3 py-2 rounded-md font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                  Dashboard
                </Link>
                <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md font-medium text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 rounded-md font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                  Log in
                </Link>
                <Link href="/register" className="block px-3 py-2 rounded-md font-medium text-blue-600 dark:text-blue-400">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
