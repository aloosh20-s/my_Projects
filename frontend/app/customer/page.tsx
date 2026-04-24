"use client";

import { useEffect, useState } from 'react';
import { 
  Briefcase, Calendar, Star, Settings, User as UserIcon, 
  Search, Plus, Heart, Clock, ChevronRight, Activity, MapPin 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { socket } from '@/utils/socket';
import Link from 'next/link';

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [recommendedServices, setRecommendedServices] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (user && user.token) {
      if (!socket.connected) {
        socket.auth = { token: user.token };
        socket.connect();
      }
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
      
      const fetchRecommended = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/services`);
          if (res.ok) {
            const data = await res.json();
            // take 2 random services
            const shuffled = data.sort(() => 0.5 - Math.random());
            setRecommendedServices(shuffled.slice(0, 2));
          }
        } catch (error) {
          console.error("Failed to fetch recommended services", error);
        }
      };

      fetchBookings();
      fetchRecommended();
      return () => {
        socket.off('booking_status_updated');
      };
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
        showToast(`Booking ${newStatus}`, 'info');
      }
    } catch (error) {
      console.error("Failed to update status", error);
      showToast('Failed to update booking', 'error');
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />)}
      </div>
      <div className="h-96 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
    </div>
  );
  
  if (!user) return <div className="p-10 text-center text-slate-500">Please log in to view your dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary via-primary-light to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-3xl font-bold shadow-inner">
               {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Hello, {user.name.split(' ')[0]} ✨</h1>
              <p className="text-blue-100">What service do you need help with today?</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/services" className="bg-white text-primary hover:bg-[#FDFCF5] px-6 py-3 rounded-xl font-semibold transition shadow-sm flex items-center justify-center gap-2">
              <Search className="w-5 h-5" /> Find a Service
            </Link>
            <Link href="/request-service" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 border border-white/30">
              <Plus className="w-5 h-5" /> Post Custom Request
            </Link>
          </div>
        </div>
      </div>
      
      {/* Analytics & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card-modern p-6 flex items-center justify-between group">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Active Bookings</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {bookings.filter(b => b.status === 'pending' || b.status === 'accepted').length}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#FDFCF5] dark:bg-blue-900/40 flex items-center justify-center text-primary dark:text-accent-amber group-hover:scale-110 transition-transform">
            <Clock className="w-7 h-7" />
          </div>
        </div>
        <div className="card-modern p-6 flex items-center justify-between group">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Completed Services</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {bookings.filter(b => b.status === 'completed').length}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
            <Calendar className="w-7 h-7" />
          </div>
        </div>
        <div className="card-modern p-6 flex items-center justify-between group">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Saved Workers</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <Heart className="w-7 h-7 fill-rose-500/20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Main Content Area - Active & Past Bookings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card-modern p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-light" /> My Bookings
              </h2>
            </div>
            
            <div className="space-y-4">
              {isLoadingBookings ? (
                <div className="animate-pulse space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No bookings yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">You haven&apos;t requested any services yet.</p>
                  <Link href="/services" className="btn-primary inline-flex">Explore Services</Link>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="p-5 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:shadow-md transition bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-5">
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {booking.Service?.title || 'Unknown Service'}
                        </h4>
                        <span className={`badge-${booking.status}`}>{booking.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-slate-400" /> {booking.worker?.name || 'Worker'}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {new Date(booking.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> Client Address</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center gap-2 sm:border-l border-slate-100 dark:border-slate-800 sm:pl-5 sm:min-w-[120px]">
                      {booking.status === 'pending' && (
                        <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="btn-secondary !py-1.5 !text-sm text-red-600 !border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">
                          Cancel
                        </button>
                      )}
                      {(booking.status === 'accepted' || booking.status === 'completed') && (
                        <Link href={`/messages?userId=${booking.workerId}`} className="btn-primary !py-1.5 !text-sm w-full text-center">Message</Link>
                      )}
                      {booking.status === 'completed' && (
                        <button className="btn-secondary !py-1.5 !text-sm w-full">Leave Review</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Recommended Services Mockup */}
          <div className="card-modern p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" /> Recommended For You
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedServices.length > 0 ? recommendedServices.map((s, idx) => (
                <Link href={`/service/${s.id}`} key={idx} className="flex gap-4 p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <img src={s.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop'} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2">{s.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{s.category}</p>
                    <p className="font-bold text-primary dark:text-accent-amber mt-1">${s.price}</p>
                  </div>
                </Link>
              )) : (
                <p className="text-sm text-slate-500">No recommendations right now.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Content Area */}
        <div className="space-y-8">
          
          {/* Recent Activity */}
          <div className="card-modern p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Recent Activity
            </h2>
            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
              {bookings.length > 0 ? bookings.slice(0, 3).map((booking, i) => (
                <div key={i} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${booking.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Booking {booking.status}: {booking.Service?.title || 'Service'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(booking.date).toLocaleDateString()}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-500 pl-4">No recent activity.</p>
              )}
            </div>
          </div>

          <div id="customer-settings" className="card-modern p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" /> Profile Settings
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              showToast('Profile feature coming soon for customers!', 'info');
            }} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" defaultValue={user.name} className="input-modern !py-2 !text-sm" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" defaultValue={user.email} disabled className="input-modern !py-2 !text-sm bg-slate-50 dark:bg-slate-800/50 opacity-70" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input type="text" placeholder="Add your phone" className="input-modern !py-2 !text-sm" />
               </div>
               <button type="submit" className="btn-primary w-full mt-2">Save Changes</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
