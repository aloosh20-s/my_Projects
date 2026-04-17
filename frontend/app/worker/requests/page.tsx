"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { MapPin, DollarSign, Calendar, CheckCircle } from 'lucide-react';

export default function WorkerRequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Protection
  if (!loading && (!user || user.role !== 'worker')) {
    router.replace('/login');
    return null;
  }

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/service-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'worker') fetchRequests();
  }, [user]);

  const handleAccept = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/service-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to accept request');
      // Refresh list
      fetchRequests();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customer Requests</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Browse custom jobs requested by customers and accept the ones that fit your skills.</p>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

      {fetching ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-lg text-slate-600 dark:text-slate-400">No open requests available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="glass border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">{req.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {req.status === 'open' ? 'Open' : 'Assigned to You'}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow">{req.description}</p>

              <div className="space-y-2 mb-6 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">${req.budget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary-light" />
                  <span>{req.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span>Deadline: {new Date(req.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              {req.status === 'open' ? (
                <button
                  onClick={() => handleAccept(req.id)}
                  className="w-full btn-primary py-3 flex justify-center items-center gap-2 rounded-xl"
                >
                  <CheckCircle className="h-4 w-4" /> Accept Job
                </button>
              ) : (
                <button disabled className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 py-3 rounded-xl cursor-not-allowed">
                  Job Accepted
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
