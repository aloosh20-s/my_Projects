"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

function RegisterForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: searchParams.get('role') === 'worker' ? 'worker' : 'client'
  });
  const [error, setError] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       setProfileImageFile(e.target.files[0]);
       setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(user.role === 'worker' ? '/worker/bookings' : '/customer');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      let data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // If registered successfully and has image, upload it
      if (profileImageFile) {
        const imgFormData = new FormData();
        imgFormData.append('image', profileImageFile);
        
        const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${data.token}` },
          body: imgFormData
        });
        
        if (uploadRes.ok) {
           const uploadData = await uploadRes.json();
           let imgUrl = uploadData.url;
           // If it returns a local path, map it absolutely against exactly the backend domain
           if (imgUrl.startsWith('/uploads')) {
               imgUrl = `${API_BASE_URL.replace('/api', '')}${imgUrl}`;
           }
           
           // Now update user profile using our new PUT integration
           const updateRes = await fetch(`${API_BASE_URL}/auth/profile`, {
             method: 'PUT',
             headers: { 
                 'Content-Type': 'application/json',
                 Authorization: `Bearer ${data.token}`
             },
             body: JSON.stringify({ profileImage: imgUrl })
           });
           
           if (updateRes.ok) {
              const updatedData = await updateRes.json();
              data = updatedData; // Apply latest db changes including avatar into AuthContext
           }
        }
      }

      // Use AuthContext login so Navbar re-renders reactively
      login(data);

      if (data.role === 'worker') {
        router.push('/worker/bookings');
      } else {
        router.push('/customer');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="max-w-md w-full glass p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">Join Souq Yemen</h2>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3 border-2 border-primary/20 flex items-center justify-center relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400">
                  <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
              )}
            </div>
            <label className="cursor-pointer text-sm text-primary font-semibold hover:text-blue-700 transition">
              Upload Profile Photo
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
            <input 
              type="text" required 
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <input 
              type="email" required 
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input 
              type="password" required 
              minLength={6}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I want to:</label>
            <select 
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="client">Hire Professionals</option>
              <option value="worker">Work as a Professional</option>
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3 text-lg mt-4 disabled:opacity-50 transition">
              {isSubmitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
          Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
