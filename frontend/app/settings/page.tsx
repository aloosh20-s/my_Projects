"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });
  
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || ''
      });
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      }
    }
  }, [user, loading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       setProfileImageFile(e.target.files[0]);
       setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImgUrl = user?.profileImage;

      // 1. Upload new image if selected
      if (profileImageFile && user) {
        const imgFormData = new FormData();
        imgFormData.append('image', profileImageFile);
        
        const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}` },
          body: imgFormData
        });
        
        if (!uploadRes.ok) throw new Error('Image upload failed');
        
        const uploadData = await uploadRes.json();
        finalImgUrl = uploadData.url;
        if (finalImgUrl?.startsWith('/uploads')) {
            finalImgUrl = `${API_BASE_URL.replace('/api', '')}${finalImgUrl}`;
        }
      }

      // 2. Update profile
      if (user) {
         const updateRes = await fetch(`${API_BASE_URL}/auth/profile`, {
           method: 'PUT',
           headers: { 
               'Content-Type': 'application/json',
               Authorization: `Bearer ${user.token}`
           },
           body: JSON.stringify({ ...formData, profileImage: finalImgUrl })
         });
         
         if (!updateRes.ok) throw new Error('Failed to update profile');
         
         const updatedData = await updateRes.json();
         // Update auth context
         login(updatedData);
         showToast('Profile updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) return <div className="p-20 text-center animate-pulse">Loading Profile...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 h-[calc(100vh-80px)] overflow-y-auto">
      <div className="glass rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B1120]/80">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Account Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4 border-2 border-primary/20 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-slate-400">{formData.name?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
            </div>
            <label className="cursor-pointer text-sm bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              Upload New Photo
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
            <input 
              type="text" required 
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
               <input 
                 type="tel" 
                 placeholder="+1 234 567 8900"
                 className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                 value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
               <input 
                 type="text" 
                 placeholder="Sana'a, Yemen"
                 className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                 value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
               />
             </div>
          </div>
          
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex gap-4">
            <button type="button" onClick={() => router.back()} className="w-1/3 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="w-2/3 btn-primary py-3 disabled:opacity-50">
              {isSubmitting ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
