"use client";

import { useEffect, useState } from 'react';
import { User, Settings, Save, UploadCloud } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function WorkerProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'worker')) {
      router.replace('/login');
      return;
    }

    if (user && user.token) {
      const fetchProfile = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/workers/profile`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setProfile(data);
            if (data.User?.profileImage) setProfileImageUrl(data.User.profileImage);
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      };

      fetchProfile();
    }
  }, [user, loading]);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    e.target.value = ''; // Reset input
    
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
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
        showToast('Profile image uploaded successfully', 'success');
      } else {
        showToast(data.message || 'Image upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const skillsString = formData.get('skills') as string;
    const skillsArray = skillsString ? skillsString.split(',').map(s => s.trim()).filter(s => s) : [];

    try {
      const res = await fetch(`${API_BASE_URL}/workers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          experience: formData.get('experience'),
          hourlyRate: parseFloat(formData.get('hourlyRate') as string) || 0,
          description: formData.get('description'),
          profileImage: profileImageUrl,
          skills: skillsArray
        })
      });
      if (res.ok) {
        showToast('Profile saved successfully!', 'success');
      } else {
        showToast('Failed to save profile', 'error');
      }
    } catch (error) {
      showToast('An error occurred while saving profile', 'error');
    }
  };

  if (loading || !profile) return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-6">
      <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <User className="w-8 h-8 text-primary-light" /> Profile Setup
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Complete your profile to attract more customers and build trust.</p>
      </div>

      <div className="card-modern p-6 md:p-10">
        <form onSubmit={handleSaveProfile} className="space-y-8">

          {/* Profile Image Section */}
          <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-200 dark:border-slate-800">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shrink-0 bg-slate-200 dark:bg-slate-900 shadow-inner group relative">
              <img
                src={profileImageUrl || 'https://placehold.co/200x200?text=Avatar'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Profile Photo</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-md">Upload a professional, clear photo of yourself. This is the first thing customers see.</p>
              <div className="relative inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  disabled={isUploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                />
                <button type="button" className="btn-secondary !py-2 inline-flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> {isUploadingImage ? 'Uploading...' : 'Choose Image'}
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Basic Background / Experience</label>
              <input
                name="experience"
                defaultValue={profile.experience}
                className="input-modern"
                placeholder="e.g. 5+ Years Certified Master Plumber"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Hourly Rate ($)</label>
              <input
                name="hourlyRate"
                type="number"
                step="0.01"
                defaultValue={profile.hourlyRate}
                className="input-modern"
                placeholder="50.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Skills (Comma separated)</label>
              <input
                name="skills"
                defaultValue={profile.skills?.join(', ')}
                className="input-modern"
                placeholder="e.g. Piping, Repairs, Installation"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Bio / Description</label>
              <textarea
                name="description"
                defaultValue={profile.description}
                className="input-modern h-32 resize-none"
                placeholder="Tell clients about your background, expertise, and what sets you apart..."
              ></textarea>
              <p className="text-xs text-slate-500 mt-2">Maximum 500 characters recommended.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="btn-primary py-3 px-8 text-lg flex items-center gap-2">
              <Save className="w-5 h-5" /> Save Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
