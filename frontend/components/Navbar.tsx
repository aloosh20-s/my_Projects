"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun, User as UserIcon, Search, Bell, MessageSquare, LogOut, Settings, LayoutDashboard, PlusCircle, ClipboardList, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    setMounted(true);
    if (document.documentElement.classList.contains('dark')) setIsDarkMode(true);
    else setIsDarkMode(false);
  }, []);

  if (!mounted) return <header className="sticky top-0 z-50 glass h-20"></header>;

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TOP ROW */}
        <div className="flex items-center py-4">

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Logo horizontal={true} markSize={42} />
          </Link>

          {/* CENTER: Navigation */}
          <div className="hidden md:flex items-center gap-8 ml-10 text-sm">

            {!user && (
              <>
                <NavLink href="/services" pathname={pathname}>Services</NavLink>
                <NavLink href="/workers" pathname={pathname}>Workers</NavLink>
              </>
            )}

            {user?.role === 'client' && (
              <>
                <NavLink href="/services" pathname={pathname}>Services</NavLink>
                <NavLink href="/workers" pathname={pathname}>Workers</NavLink>
                <NavLink href="/messages" pathname={pathname}>Messages</NavLink>
              </>
            )}

            {user?.role === 'worker' && (
              <>
                <NavLink href="/worker/services" pathname={pathname}>My Services</NavLink>
                <NavLink href="/worker/bookings" pathname={pathname}>Bookings</NavLink>
                <NavLink href="/worker/requests" pathname={pathname}>Requests</NavLink>
                <NavLink href="/messages" pathname={pathname}>Messages</NavLink>
              </>
            )}

          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-4 ml-auto">

            {!user && (
              <>
                <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary text-sm">
                  Login
                </Link>
                <Link href="/register" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark">
                  Register
                </Link>
              </>
            )}

            {user && (
              <>
                <NotificationDropdown />
                <ProfileDropdown user={user} logout={logout} />
              </>
            )}

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <MobileLinks user={user} logout={logout} pathname={pathname} setIsOpen={setIsOpen} router={router} />
        </div>
      )}
    </header>
  );
}

/* ================= NAV LINK ================= */
function NavLink({ href, pathname, children }: any) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`font-medium transition-colors ${active
        ? "text-primary font-semibold"
        : "text-slate-600 dark:text-slate-300 hover:text-primary"
        }`}
    >
      {children}
    </Link>
  );
}

/* ================= PROFILE ================= */
function ProfileDropdown({ user, logout }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2">
        {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="h-7 w-7 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
        ) : (
            <UserIcon className="h-5 w-5" />
        )}
        <span className="text-sm font-medium">{user.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 shadow-lg rounded-lg">
          <Link href="/settings" className="block px-4 py-2 hover:bg-slate-100">Settings</Link>
          <button onClick={logout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= NOTIFICATIONS ================= */
function NotificationDropdown() {
  return (
    <button className="relative p-2">
      <Bell className="h-5 w-5" />
      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
    </button>
  );
}

/* ================= MOBILE ================= */
function MobileLinks({ user, logout, pathname, setIsOpen, router }: any) {
  const linkClass = "block px-3 py-2 rounded-md";

  return (
    <>
      <Link href="/services" className={linkClass} onClick={() => setIsOpen(false)}>Services</Link>
      <Link href="/workers" className={linkClass} onClick={() => setIsOpen(false)}>Workers</Link>

      {!user && (
        <>
          <Link href="/login" className={linkClass} onClick={() => setIsOpen(false)}>Login</Link>
          <Link href="/register" className={linkClass} onClick={() => setIsOpen(false)}>Register</Link>
        </>
      )}

      {user && (
        <>
          <Link href="/messages" className={linkClass} onClick={() => setIsOpen(false)}>Messages</Link>
          <button onClick={() => { logout(); setIsOpen(false); }} className="block px-3 py-2 text-red-600">
            Logout
          </button>
        </>
      )}
    </>
  );
}