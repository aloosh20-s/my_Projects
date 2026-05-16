"use client";

import { useEffect, useState } from 'react';
import { 
  Briefcase, Calendar, DollarSign, Settings, Plus, Star, 
  MapPin, Clock, Edit, Trash2, CheckCircle, XCircle, AlertCircle, BarChart3 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { socket } from '@/utils/socket';

export default function WorkerDashboard() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [myServices, setMyServices] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (user && user.token) {
      if (!socket.connected) {
        socket.auth = { token: user.token };
        socket.connect();
      }
      socket.emit('join', user.id);

      socket.on('new_booking', (data) => {
        showToast(`New Booking: ${data.serviceTitle} from ${data.clientName}`, 'success');
        fetchData();
      });

      socket.on('new_request', (data) => {
        showToast(`New Request: ${data.title} from ${data.customerName}`, 'info');
      });

      const fetchData = async () => {
        try {
          const [bookingsRes, profileRes, servicesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/bookings/worker`, {
              headers: { Authorization: `Bearer ${user.token}` }
            }),
            fetch(`${API_BASE_URL}/workers/profile`, {
              headers: { Authorization: `Bearer ${user.token}` }
            }),
            fetch(`${API_BASE_URL}/services?workerId=${user.id}`, {
              headers: { Authorization: `Bearer ${user.token}` },
              cache: 'no-store'
            })
          ]);
          
          if (bookingsRes.ok) setBookings(await bookingsRes.json());
          if (profileRes.ok) {
            const data = await profileRes.json();
            setProfile(data);
            if (data.User?.profileImage) setProfileImageUrl(data.User.profileImage);
          }
          if (servicesRes.ok) setMyServices(await servicesRes.json());
        } catch (error) {
          console.error("Failed to fetch worker data", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      
      fetchData();
      return () => {
        socket.off('new_booking');
        socket.off('new_request');
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
        showToast(`Booking marked as ${newStatus}`, 'success');
      }
    } catch (error) {
      console.error("Failed to update status", error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user?.token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        let url = data.url;
        if (url.startsWith('/uploads')) url = `${API_BASE_URL.replace('/api', '')}${url}`;
        setProfileImageUrl(url);
        showToast('Profile image updated successfully', 'success');
      } else {
        showToast(data.message || 'Image upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Profile completion logic
  const getProfileCompletion = () => {
    let score = 0;
    if (profileImageUrl) score += 25;
    if (profile?.experience) score += 25;
    if (profile?.hourlyRate) score += 25;
    if (myServices.length > 0) score += 25;
    return score;
  };
  const completionScore = getProfileCompletion();

  if (loading || isLoadingData) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />)}
      </div>
      <div className="h-96 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
    </div>
  );
  
  if (!user) return <div className="p-10 text-center text-slate-500">Please log in to view your dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-indigo-700 dark:from-blue-900 dark:to-indigo-950 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center p-1 shrink-0 overflow-hidden">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-3xl font-bold">{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                Welcome back, {user.name.split(' ')[0]}! <span className="text-2xl">👋</span>
              </h1>
              <div className="flex items-center gap-4 text-blue-100 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Local Area Worker</span>
                <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full"><Star className="w-3 h-3 text-yellow-300 fill-yellow-300" /> 4.9 Rating</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link href="/services/create" className="bg-white text-primary hover:bg-[#FDFCF5] px-5 py-2.5 rounded-xl font-semibold transition shadow-sm flex items-center gap-2 w-full md:w-auto justify-center">
              <Plus className="w-4 h-4" /> Add Service
            </Link>
          </div>
        </div>
      </div>
      
      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="card-modern p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl text-green-600 dark:text-green-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-slate-500 dark:text-slate-400">Total Earnings</h3>
            </div>
          </div>
          <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">$0.00</p>
          <p className="text-sm text-green-500 flex items-center gap-1"><Plus className="w-3 h-3" /> 0% this month</p>
        </div>

        <div className="card-modern p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 dark:bg-blue-900/40 rounded-xl text-primary dark:text-accent-amber">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-slate-500 dark:text-slate-400">Pending Jobs</h3>
            </div>
          </div>
          <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {bookings.filter(b => b.status === 'pending').length}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Awaiting your response</p>
        </div>

        <div className="card-modern p-6">
           <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-primary dark:text-indigo-400">
              <CheckCircle className="w-6 h-6" />
            </div>
             <h3 className="font-medium text-slate-500 dark:text-slate-400">Completed Jobs</h3>
          </div>
          <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {bookings.filter(b => b.status === 'completed').length}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Jobs done successfully</p>
        </div>

        <div className="card-modern p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 relative overflow-hidden group border-blue-100 dark:border-slate-700">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-24 h-24" />
          </div>
          <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-4 relative z-10">Profile Completion</h3>
          <div className="flex items-end gap-2 mb-3 relative z-10">
            <p className="text-4xl font-bold text-primary dark:text-accent-amber">{completionScore}%</p>
            <span className="text-sm text-slate-500 pb-1">ready</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2 relative z-10">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${completionScore}%` }}></div>
          </div>
          {completionScore < 100 && (
            <p className="text-xs text-slate-500 relative z-10 hover:text-primary cursor-pointer" onClick={() => document.getElementById('profile-settings')?.scrollIntoView({ behavior: 'smooth' })}>
              Finish your profile to boost visibility →
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area - Bookings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card-modern p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-light" /> Recent Bookings
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              {bookings.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No bookings yet</p>
                  <p className="text-sm text-slate-400">When customers book you, they will appear here.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-semibold">Service & Customer</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{booking.Service?.title || 'Unknown Service'}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                              {booking.client?.name?.charAt(0) || '?'}
                            </span>
                            {booking.client?.name || 'Unknown Client'}
                          </p>
                        </td>
                        <td className="py-4">
                          <p className="text-slate-700 dark:text-slate-300 text-sm flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="py-4">
                          <span className={`badge-${booking.status}`}>{booking.status}</span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2 text-sm">
                            {booking.status === 'pending' && (
                              <>
                                <button onClick={() => updateBookingStatus(booking.id, 'accepted')} className="btn-primary !py-1.5 !px-3 !text-sm">Accept</button>
                                <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="btn-danger !py-1.5 !px-3 !text-sm">Decline</button>
                              </>
                            )}
                            {booking.status === 'accepted' && (
                              <button onClick={() => updateBookingStatus(booking.id, 'completed')} className="bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-3 rounded-lg transition">Complete</button>
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

          <div className="card-modern p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" /> Earnings Overview
            </h2>
            <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-slate-200 dark:border-slate-700 p-4">
              {/* Dummy Bar Chart */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const height = Math.random() * 80 + 10;
                return (
                  <div key={day} className="flex flex-col items-center gap-2 w-full group">
                    <div className="w-full max-w-[40px] bg-primary/10 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 rounded-t-lg relative transition-all" style={{ height: `${height}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ${Math.floor(height * 2)}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-8">
          
          <div className="card-modern p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Services</h2>
              <Link href="/services/create" className="text-sm font-medium text-primary hover:text-blue-700 dark:text-accent-amber dark:hover:text-blue-300">View All</Link>
            </div>
            
            <div className="space-y-4">
              {myServices.length === 0 ? (
                <p className="text-slate-500 text-sm">You haven&apos;t added any services yet. Add one to get started.</p>
              ) : (
                myServices.slice(0,4).map((service) => (
                  <div key={service.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-md transition bg-slate-50 dark:bg-slate-900/50 group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{service.title}</h4>
                        <span className="text-xs font-medium px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">{service.category}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">${service.price}</span>
                    </div>
                    <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/services/edit/${service.id}`} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition inline-block"><Edit className="w-4 h-4" /></Link>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Delete this service?')) {
                            const res = await fetch(`${API_BASE_URL}/services/${service.id}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${user.token}` }
                            });
                            if (res.ok) setMyServices(myServices.filter(s => s.id !== service.id));
                          }
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div id="profile-settings" className="card-modern p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" /> Settings
            </h2>
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
                    description: formData.get('description'),
                    profileImage: profileImageUrl
                  })
                });
                if (res.ok) showToast('Profile updated successfully', 'success');
                else showToast('Failed to update profile', 'error');
              }} className="space-y-4">
                <div className="flex flex-col gap-4 mb-4">
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0">
                        <img src={profileImageUrl || 'https://placehold.co/100'} alt="Avatar" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                       <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Avatar Update</label>
                       <input type="file" accept="image/*" onChange={handleProfileImageUpload} disabled={isUploadingImage} className="text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FDFCF5] file:text-blue-700 hover:file:bg-primary/10 dark:file:bg-slate-800 dark:file:text-slate-300 transition w-full" />
                     </div>
                   </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Experience</label>
                  <input name="experience" defaultValue={profile.experience} className="input-modern !py-2 !text-sm" placeholder="e.g. 5 Years as Master Plumber" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hourly Rate ($)</label>
                  <input name="hourlyRate" type="number" step="0.01" defaultValue={profile.hourlyRate} className="input-modern !py-2 !text-sm" placeholder="50.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Bio / Description</label>
                  <textarea name="description" defaultValue={profile.description} className="input-modern !py-2 !text-sm h-24 resize-none" placeholder="Tell clients about yourself..."></textarea>
                </div>
                <button type="submit" className="btn-primary w-full mt-2">Save Profile</button>
              </form>
            ) : (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
