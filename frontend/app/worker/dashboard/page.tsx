"use client";

import { useEffect, useState } from 'react';
import { Briefcase, Calendar, DollarSign, Settings, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { API_BASE_URL } from '@/utils/api';

export default function WorkerDashboard() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (user && user.token) {
      const fetchData = async () => {
        try {
          const [bookingsRes, profileRes] = await Promise.all([
            fetch(`${API_BASE_URL}/bookings/worker`, {
              headers: { Authorization: `Bearer ${user.token}` }
            }),
            fetch(`${API_BASE_URL}/workers/profile`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
          ]);
          
          if (bookingsRes.ok) {
            setBookings(await bookingsRes.json());
          }
          if (profileRes.ok) {
            setProfile(await profileRes.json());
          }
        } catch (error) {
          console.error("Failed to fetch worker data", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      
      fetchData();
    }
  }, [user]);

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
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-900 dark:text-white">Loading...</div>;
  if (!user) return <div className="p-10 text-center text-slate-900 dark:text-white">Please log in to view your dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Worker Dashboard</h1>
        <Link href="/services/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="glass p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Earnings</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-4">$---</p>
        </div>
        <div className="glass p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Pending Jobs</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-4">
            {bookings.filter(b => b.status === 'pending').length}
          </p>
        </div>
        <div className="glass p-6 rounded-xl border border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Total Jobs</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-4">{bookings.length}</p>
        </div>
        <div className="glass p-6 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
              <Settings className="w-6 h-6" />
            </div>
             <h3 className="font-semibold text-slate-700 dark:text-slate-200">Profile Settings</h3>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Job Requests & Active Work</h2>
        <div className="space-y-4">
          {isLoadingData ? (
            <p className="text-slate-500 dark:text-slate-400">Loading your jobs...</p>
          ) : bookings.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">You don't have any jobs yet.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-lg flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/50 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{booking.Service?.title || 'Unknown Service'}</h4>
                  <p className="text-sm text-slate-500">Client: {booking.client?.name || 'Unknown Client'} • {new Date(booking.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500">Status: <strong className="capitalize">{booking.status}</strong></p>
                </div>
                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button onClick={() => updateBookingStatus(booking.id, 'accepted')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Accept</button>
                      <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="px-4 py-2 bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 text-sm font-medium">Decline</button>
                    </>
                  )}
                  {booking.status === 'accepted' && (
                    <button onClick={() => updateBookingStatus(booking.id, 'completed')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Mark Completed</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass rounded-xl border border-slate-200 dark:border-slate-800 p-6 mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Settings</h2>
        {profile ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const res = await fetch(`${API_BASE_URL}/workers/profile`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
              body: JSON.stringify({
                experience: formData.get('experience'),
                hourlyRate: parseFloat(formData.get('hourlyRate') as string),
                description: formData.get('description')
              })
            });
            if (res.ok) alert('Profile updated successfully');
          }} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Experience</label>
              <input name="experience" defaultValue={profile.experience} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hourly Rate ($)</label>
              <input name="hourlyRate" type="number" step="0.01" defaultValue={profile.hourlyRate} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Description</label>
              <textarea name="description" defaultValue={profile.description} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 h-24"></textarea>
            </div>
            <button type="submit" className="btn-primary py-2 px-6">Save Profile</button>
          </form>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </div>
  );
}
