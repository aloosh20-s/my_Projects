"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';

export default function AdminBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) setBookings(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr><th className="p-4">ID</th><th className="p-4">Service ID</th><th className="p-4">Client ID</th><th className="p-4">Worker ID</th><th className="p-4">Date</th><th className="p-4">Status</th></tr>
          </thead>
          <tbody>
            {bookings.map((b: any) => (
              <tr key={b.id} className="border-b last:border-0">
                <td className="p-4">{b.id}</td>
                <td className="p-4">{b.serviceId}</td>
                <td className="p-4">{b.clientId}</td>
                <td className="p-4">{b.workerId}</td>
                <td className="p-4">{new Date(b.date).toLocaleDateString()}</td>
                <td className="p-4"><span className="px-2 py-1 text-xs font-bold rounded-md bg-slate-100 dark:bg-slate-700">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <div className="p-8 text-center text-slate-500">No bookings found.</div>}
      </div>
    </div>
  );
}
