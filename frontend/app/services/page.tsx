"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star, Clock, User as UserIcon, Search, Filter } from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services`, { cache: 'no-store' });
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

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? service.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(services.map(s => s.category)));

  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Find Local Services</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Browse through our directory of verified local professionals ready to help you with your next project.</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-10 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search for a service..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <select
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 mb-2">No services found matching your criteria.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory(''); }} className="text-primary font-semibold hover:underline">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="glass rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg transition flex flex-col h-full group">
              <Link href={`/service/${service.id}`} className="block h-48 bg-slate-200 dark:bg-slate-800 relative">
                <img src={service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&fit=crop'} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white dark:bg-slate-900 px-3 py-1 rounded-full text-sm font-semibold text-slate-900 dark:text-white shadow-sm">
                  ${service.price}
                </div>
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs font-semibold tracking-wider text-primary dark:text-accent-amber uppercase mb-2">{service.category}</div>
                <Link href={`/service/${service.id}`}>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                </Link>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{service.description}</p>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <UserIcon className="w-4 h-4" />
                    <span>{service.User?.name || 'Local Pro'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{service.estimatedTime || '1-2 Hours'}</span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <Link href={`/booking/${service.id}`} className="w-full block text-center btn-primary py-2 text-sm shadow-sm group-hover:shadow-md transition">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense fallback={<div className="p-20 text-center">Loading services...</div>}>
        <ServicesContent />
      </Suspense>
    </div>
  );
}
