"use client";

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch the existing service data to populate the form
  useEffect(() => {
    if (!resolvedParams.id) return;

    const fetchService = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || '');
          setCategory(data.category || '');
          setDescription(data.description || '');
          setPrice(data.price?.toString() || '');
          setEstimatedTime(data.estimatedTime || '');
          setImages(data.images || []);
        } else {
          setError('Could not load service details');
        }
      } catch (err) {
        setError('Error loading service');
      } finally {
        setIsFetching(false);
      }
    };

    fetchService();
  }, [resolvedParams.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    e.target.value = ''; // Reset input to allow re-upload

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
        setImages([...images, url]);
      } else {
        showToast(data.message || 'Image upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'worker') {
      setError('Only workers can edit services');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/services/${resolvedParams.id}`, {
        method: 'PUT',
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
        showToast('Service updated successfully!', 'success');
        router.push('/worker/services');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update service');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isFetching) return <div className="p-10 text-center">Loading service details...</div>;
  if (!user || user.role !== 'worker') return <div className="p-10 text-center">Not authorized</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Edit Service</h1>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Title</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. Fix Leaky Faucets" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
              <option value="" disabled>Select a category</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Handyman">Handyman</option>
              <option value="Technology">Technology</option>
              <option value="Other">Other</option>
            </select>
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
                <div key={i} className="relative inline-block">
                  <img src={img} alt={`Uploaded ${i}`} className="h-24 w-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  <button type="button" onClick={() => setImages(images.filter((_, index) => index !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">X</button>
                </div>
              ))}
            </div>
            <div className="relative inline-block w-full">
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" />
              <button type="button" className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm text-left flex justify-between items-center">
                <span>{isUploadingImage ? 'Uploading...' : 'Click to add another image'}</span>
              </button>
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3 mt-6">
            {isSubmitting ? 'Updating...' : 'Update Service'}
          </button>
        </form>
      </div>
    </div>
  );
}
