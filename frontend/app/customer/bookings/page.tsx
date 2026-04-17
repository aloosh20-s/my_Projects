"use client";

import { useEffect, useState } from 'react';
import { Briefcase, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { socket } from '@/utils/socket';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerBookings() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'customer')) {
      router.replace('/login');
      return;
    }

    if (user && user.token) {
      if (!socket.connected) socket.connect();
      socket.emit('join', user.id);

      socket.on('booking_status_updated', (data) => {
        showToast(`Booking Update: Your booking is now ${data.status}!`, 'info');
        fetchBookings();
      });

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
      return () => {
        socket.off('booking_status_updated');
      };
    }
  }, [user, loading]);

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        showToast(`Booking ${newStatus}`, 'info');
      }
    } catch (error) {
      console.error("Failed to update status", error);
      showToast('Failed to update booking', 'error');
    }
  };

  if (loading || isLoadingBookings) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
      {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-primary-light" /> My Bookings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Manage all your active and past service bookings here.</p>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No bookings yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 target">You haven't requested any services yet.</p>
            <Link href="/services" className="btn-primary">Explore Services</Link>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg transition bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-6 items-start md:items-center">
              
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-xl text-slate-900 dark:text-white">
                    {booking.Service?.title || 'Unknown Service'}
                  </h4>
                  <span className={`badge-${booking.status} text-sm px-3 py-1 rounded-full`}>{booking.status}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
                  <span className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-primary-light" /> {booking.worker?.name || 'Worker'}</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> {new Date(booking.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-purple-500" /> Client Address</span>
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col gap-3 w-full md:w-32 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                {booking.status === 'pending' && (
                  <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="btn-secondary w-full text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Cancel
                  </button>
                )}
                {(booking.status === 'accepted' || booking.status === 'completed') && (
                  <Link href="/messages" className="btn-secondary w-full text-center flex items-center justify-center">Message</Link>
                )}
                {booking.status === 'completed' && (
                  <button className="btn-primary w-full shadow-sm">Review</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
