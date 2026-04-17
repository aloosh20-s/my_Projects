"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api';

export default function CreateServicePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        // If it returns a local path, ensure it's absolute
        if (url.startsWith('/uploads')) url = `${API_BASE_URL.replace('/api', '')}${url}`;
        setImages([...images, url]);
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch {
      alert('Error uploading image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'worker') {
      setError('Only workers can create services');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title,
          category,
          description,
          price: parseFloat(price),
          estimatedTime,
          images
        })
      });

      if (res.ok) {
        router.push('/worker/services');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create service');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user || user.role !== 'worker') return <div className="p-10 text-center">Not authorized</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Add New Service</h1>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. Professional Plumbing Repair" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input type="text" required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. Plumbing" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 h-32" placeholder="Describe what you offer..."></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="50.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Time</label>
              <input type="text" required value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. 2 hours" />
            </div>
          </div>
          
          <div>
             <label className="block text-sm font-medium mb-1">Service Images</label>
             <div className="flex gap-4 mb-2 overflow-x-auto py-2">
               {images.map((img, i) => (
                 <img key={i} src={img} alt={`Uploaded ${i}`} className="h-24 w-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
               ))}
             </div>
             <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm" />
             {isUploadingImage && <p className="text-sm text-primary-light mt-1">Uploading image...</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3 mt-6">
            {isSubmitting ? 'Creating...' : 'Create Service'}
          </button>
        </form>
      </div>
    </div>
  );
}
