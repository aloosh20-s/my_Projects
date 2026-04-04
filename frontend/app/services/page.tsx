"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Clock, User as UserIcon } from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services`);
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Find Local Services</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Browse through our directory of verified local professionals ready to help you with your next project.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No services available right now. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="glass rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg transition flex flex-col h-full">
              <div className="h-48 bg-slate-200 dark:bg-slate-800 relative">
                {service.images && service.images.length > 0 ? (
                  <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                    No Image
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white dark:bg-slate-900 px-3 py-1 rounded-full text-sm font-semibold text-slate-900 dark:text-white shadow-sm">
                  ${service.price}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase mb-2">{service.category}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{service.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <UserIcon className="w-4 h-4" />
                    <span>{service.User?.name || 'Local Pro'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{service.estimatedTime}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <Link href={`/booking/${service.id}`} className="w-full block text-center btn-primary py-2 text-sm">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
