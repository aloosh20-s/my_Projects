import Link from 'next/link';
import { Briefcase } from 'lucide-react';
export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Briefcase className="h-6 w-6 text-primary dark:text-primary-light" />
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Souq Yemen | سوق اليمن</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Connect with top-rated local professionals for any job, any time.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">For Clients</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/services" className="hover:text-primary dark:hover:text-accent-amber transition">How to hire</Link></li>
              <li><Link href="/services" className="hover:text-primary dark:hover:text-accent-amber transition">Search workers</Link></li>
              <li><Link href="/" className="hover:text-primary dark:hover:text-accent-amber transition">Post a job</Link></li>
              <li><Link href="/" className="hover:text-primary dark:hover:text-accent-amber transition">Trust & Safety</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">For Workers</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/register" className="hover:text-primary dark:hover:text-accent-amber transition">How to find work</Link></li>
              <li><Link href="/register" className="hover:text-primary dark:hover:text-accent-amber transition">Create a profile</Link></li>
              <li><Link href="/" className="hover:text-primary dark:hover:text-accent-amber transition">Success stories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/" className="hover:text-primary dark:hover:text-accent-amber transition">Help & Support</Link></li>
              <li><Link href="/" className="hover:text-primary dark:hover:text-accent-amber transition">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-primary dark:hover:text-accent-amber transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Souq Yemen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}