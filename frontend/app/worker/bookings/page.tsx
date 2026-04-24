"use client";

import { useEffect, useState } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { socket } from '@/utils/socket';
import { useRouter } from 'next/navigation';

export default function WorkerBookingsPage() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'worker')) {
      router.replace('/login');
      return;
    }

    if (user && user.token) {
      if (!socket.connected) {
        socket.auth = { token: user.token };
        socket.connect();
      }
      socket.emit('join', user.id);

      socket.on('new_booking', (data) => {
        showToast(`New Booking: ${data.serviceTitle} from ${data.clientName}`, 'success');
        fetchBookings();
      });

      const fetchBookings = async () => {
        try {
          const [bookingsRes, requestsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/bookings/worker`, {
              headers: { Authorization: `Bearer ${user.token}` }
            }),
            fetch(`${API_BASE_URL}/service-requests`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
          ]);
          
          let fetchedBookings = [];
          if (bookingsRes.ok) fetchedBookings = await bookingsRes.json();
          
          let fetchedRequests = [];
          if (requestsRes.ok) fetchedRequests = await requestsRes.json();
          
          // Filter requests to only show ones assigned to THIS worker
          const assignedRequests = fetchedRequests
            .filter((r: any) => r.workerId === user.id && r.status !== 'open')
            .map((r: any) => ({
              id: `req_${r.id}`, // prefix ID to avoid collision with booking IDs
              isRequest: true,
              originalId: r.id,
              Service: { title: `Custom Request: ${r.title}` },
              client: r.customer,
              date: r.deadline,
              status: r.status === 'assigned' ? 'accepted' : r.status // Map assigned to accepted
            }));

          const combined = [...fetchedBookings, ...assignedRequests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setBookings(combined);
        } catch (error) {
          console.error("Failed to fetch bookings", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchBookings();
      return () => {
        socket.off('new_booking');
      };
    }
  }, [user, loading]);

  const updateBookingStatus = async (item: any, newStatus: string) => {
    if (item.isRequest) {
      showToast('Custom request status updates coming soon.', 'info');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${item.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === item.id ? { ...b, status: newStatus } : b));
        showToast(`Booking marked as ${newStatus}`, 'success');
      }
    } catch (error) {
      console.error("Failed to update status", error);
      showToast('Failed to update status', 'error');
    }
  };

  if (loading || isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary-light" /> Manage Bookings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">View and respond to client requested bookings.</p>
      </div>

      <div className="card-modern p-0 overflow-hidden">
        <div className="overflow-x-auto p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
              <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No bookings yet</p>
              <p className="text-slate-500 dark:text-slate-400">When customers book your services, they will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                  <th className="pb-4 font-semibold">Service & Customer</th>
                  <th className="pb-4 font-semibold">Date</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="py-5 pr-4">
                      <p className="font-semibold text-slate-900 dark:text-white text-lg">{booking.Service?.title || 'Unknown Service'}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <span className="w-6 h-6 rounded-full bg-primary/10 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-primary dark:text-accent-amber">
                          {booking.client?.name?.charAt(0) || '?'}
                        </span>
                        {booking.client?.name || 'Unknown Client'}
                      </p>
                    </td>
                    <td className="py-5">
                      <p className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(booking.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="py-5">
                      <span className={`badge-${booking.status}`}>{booking.status}</span>
                    </td>
                    <td className="py-5 text-right">
                      <div className="flex justify-end gap-2 text-sm">
                        {booking.status === 'pending' && !booking.isRequest && (
                          <>
                            <button onClick={() => updateBookingStatus(booking, 'accepted')} className="btn-primary">Accept</button>
                            <button onClick={() => updateBookingStatus(booking, 'cancelled')} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">Decline</button>
                          </>
                        )}
                        {booking.status === 'accepted' && !booking.isRequest && (
                          <button onClick={() => updateBookingStatus(booking, 'completed')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-xl transition shadow-sm">Mark Complete</button>
                        )}
                        {booking.status === 'completed' && !booking.isRequest && (
                          <button disabled className="bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium py-2 px-4 rounded-xl cursor-not-allowed">Completed</button>
                        )}
                        {booking.isRequest && (
                          <span className="text-slate-500 text-sm font-medium">Custom Request</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
