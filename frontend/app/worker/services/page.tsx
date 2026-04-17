"use client";

import { useEffect, useState } from 'react';
import { Briefcase, Settings, Edit, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WorkerServicesPage() {
  const { user, loading } = useAuth();
  const [myServices, setMyServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'worker')) {
      router.replace('/login');
      return;
    }

    if (user && user.token) {
      const fetchServices = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/services?workerId=${user.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (res.ok) setMyServices(await res.json());
        } catch (error) {
          console.error("Failed to fetch services", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchServices();
    }
  }, [user, loading]);

  const handleDelete = async (serviceId: number) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (res.ok) {
          setMyServices(myServices.filter(s => s.id !== serviceId));
          showToast('Service deleted successfully', 'success');
        } else {
          showToast('Failed to delete service', 'error');
        }
      } catch (err) {
        showToast('Error deleting service', 'error');
      }
    }
  };

  if (loading || isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary-light" /> My Services
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage the services you offer to customers on the marketplace.</p>
        </div>
        <Link href="/services/create" className="btn-primary flex items-center gap-2 justify-center py-3">
          <Plus className="w-5 h-5" /> Create New Service
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myServices.length === 0 ? (
          <div className="col-span-full text-center py-20 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <Settings className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No services yet</p>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Create your first service offering to start attracting local customers.</p>
            <Link href="/services/create" className="btn-secondary text-primary border-blue-200 hover:bg-[#FDFCF5]">Create Service</Link>
          </div>
        ) : (
          myServices.map((service) => (
            <div key={service.id} className="card-modern rounded-2xl overflow-hidden group flex flex-col">
              <div className="h-40 overflow-hidden relative bg-slate-200 dark:bg-slate-800">
                <img src={service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&fit=crop'} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-bold shadow-sm">
                  ${service.price}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">{service.title}</h3>
                </div>
                <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full w-fit mb-4">
                  {service.category}
                </span>
                
                <div className="mt-auto border-t border-slate-100 dark:border-slate-800/80 pt-4 flex gap-2">
                   <Link href={`/services/edit/${service.id}`} className="flex-1 btn-secondary !py-2 justify-center flex gap-2">
                     <Edit className="w-4 h-4" /> Edit
                   </Link>
                   <button onClick={() => handleDelete(service.id)} className="btn-secondary !py-2 !px-3 border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
