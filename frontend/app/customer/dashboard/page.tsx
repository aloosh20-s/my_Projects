"use client";

import { useEffect, useState } from 'react';
import { Briefcase, Calendar, Star, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    if (user && user.token) {
      const fetchBookings = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/bookings/client`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setBookings(data);
          }
        } catch (error) {
          console.error("Failed to fetch bookings", error);
        } finally {
          setIsLoadingBookings(false);
        }
      };
      
      fetchBookings();
    }
  }, [user]);

  if (loading) return <div className="p-10 text-center text-slate-900 dark:text-white">Loading...</div>;
  if (!user) return <div className="p-10 text-center text-slate-900 dark:text-white">Please log in to view your dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Welcome, {user.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="glass p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Total Bookings</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-4">{bookings.length}</p>
        </div>
        <div className="glass p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Completed</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-4">
            {bookings.filter(b => b.status === 'completed').length}
          </p>
        </div>
        <div className="glass p-6 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Settings</h3>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Bookings</h2>
        <div className="space-y-4">
          {isLoadingBookings ? (
            <p className="text-slate-500 dark:text-slate-400">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">You don't have any bookings yet.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-lg flex justify-between items-center bg-white dark:bg-slate-900/50">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{booking.Service?.title || 'Unknown Service'}</h4>
                  <p className="text-sm text-slate-500">with {booking.worker?.name || 'Unknown Worker'} • {new Date(booking.date).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                  booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
