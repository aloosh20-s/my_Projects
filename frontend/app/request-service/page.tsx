"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';

function RequestServiceForm() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId');
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    location: '',
    deadline: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Protection
  if (!loading && (!user || (user.role !== 'customer' && user.role !== 'client'))) {
    // router.replace('/login');
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
         <h2 className="text-2xl font-bold mb-4">Please log in to hire professionals.</h2>
         <button onClick={() => router.push('/login')} className="btn-primary">Log in</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          workerId: workerId ? parseInt(workerId) : undefined
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit request');
      }

      setSuccess(true);
      setTimeout(() => router.push('/customer'), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8 text-center pt-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          {workerId ? 'Hire Professional Directly' : 'Request a Custom Service'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
           {workerId ? 'Send a detailed job request specifically to this worker. They will receive it instantly.' : 'Describe exactly what you need and let professionals come to you.'}
        </p>
      </div>

      <div className="glass p-8 rounded-2xl shadow-xl">
        {error && <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6">Success! Your request has been posted. Redirecting...</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Title</label>
            <input 
              type="text" 
              required 
              placeholder="e.g., Need a plumber for a leaky sink"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none dark:text-white"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Detailed Description</label>
            <textarea 
              required 
              rows={4}
              placeholder="Provide all the details about the job..."
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none dark:text-white"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Budget ($)</label>
              <input 
                type="number" 
                required 
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
              <input 
                type="text" 
                required 
                placeholder="City or Zip Code"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deadline Date</label>
            <input 
              type="date" 
              required 
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none dark:text-white"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full btn-primary py-4 text-lg rounded-xl mt-4">
            Post Request
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RequestServicePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center animate-pulse">Loading form...</div>}>
      <RequestServiceForm />
    </Suspense>
  );
}
