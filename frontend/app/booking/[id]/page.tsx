"use client";

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, DollarSign, User as UserIcon } from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [service, setService] = useState<any>(null);
  const [date, setDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services/${id}`);
        if (res.ok) {
          setService(await res.json());
        } else {
          setError('Service not found');
        }
      } catch (err) {
        setError('Failed to load service details');
      }
    };
    fetchService();
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'client') {
      setError('Only customers can book services');
      return;
    }

    setIsBooking(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          serviceId: id,
          date: new Date(date).toISOString()
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/customer');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to book service');
      }
    } catch (err) {
      setError('An error occurred during booking');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading || (!service && !error)) return <div className="p-10 text-center text-slate-900 dark:text-white">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="glass rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Book Service</h1>
        <p className="text-slate-500 mb-8">Confirm your details to hire this local professional.</p>

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm font-semibold text-primary dark:text-accent-amber uppercase tracking-wider mb-1">{service.category}</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{service.title}</h2>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">${service.price}</div>
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Estimated Time: {service.estimatedTime}</span>
            </div>
          </div>
        </div>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
            <h3 className="font-bold text-lg mb-2">Booking Confirmed!</h3>
            <p>Your request has been sent to the worker. Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-6">
            {!user && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 p-4 rounded-lg text-sm">
                You need to log in as a customer to book this service.
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date & Time</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="datetime-local" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isBooking || !user || user.role !== 'client'}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBooking ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
