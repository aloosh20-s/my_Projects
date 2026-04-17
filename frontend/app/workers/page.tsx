"use client";

import { useEffect, useState } from 'react';
import { User as UserIcon, MapPin, Briefcase, Star, Search, Filter } from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';
import Link from 'next/link';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/workers`);
        if (res.ok) {
          const data = await res.json();
          setWorkers(data);
        }
      } catch (error) {
        console.error("Failed to fetch workers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Browse Professionals</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Find the right expert for your project from our verified network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Filter Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="card-modern p-6 sticky top-24">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
              </h2>
              
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Search Name or Skill</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="e.g. Plumber..." className="input-modern !py-2 !pl-9 !text-sm" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  <div className="space-y-2">
                    {['All Categories', 'Plumbing', 'Electrical', 'Cleaning', 'Handyman'].map((cat, i) => (
                      <label key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input type="checkbox" className="rounded text-primary focus:ring-primary bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700" defaultChecked={i === 0} />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Max Hourly Rate</label>
                  <input type="range" min="10" max="200" defaultValue="100" className="w-full accent-blue-600" />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>$10</span>
                    <span>$200+</span>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Minimum Rating</label>
                  <div className="space-y-2">
                    {[4, 3, 2].map((r) => (
                      <label key={r} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input type="radio" name="rating" className="text-primary focus:ring-primary" />
                        <span className="flex items-center"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1" /> {r}.0 & up</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workers Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[350px] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                ))}
              </div>
            ) : workers.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No professionals found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Try adjusting your filters or check back later as new workers join daily.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map((profile) => (
                  <div key={profile.id} className="card-modern flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden group">
                    <div className="h-24 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 relative">
                       {/* Rating Badge */}
                       <div className="absolute top-3 right-3 bg-white dark:bg-slate-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                         <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> 4.9
                       </div>
                    </div>
                    
                    <div className="flex-1 px-6 pb-6 text-center relative -mt-12">
                      <div className="mx-auto h-24 w-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform duration-300">
                        {profile.User?.profileImage ? (
                          <img src={profile.User.profileImage} alt={profile.User.name} className="h-full w-full object-cover" />
                        ) : (
                          <UserIcon className="h-10 w-10 text-slate-400" />
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                        {profile.User?.name || 'Unknown Worker'}
                      </h3>
                      <p className="text-primary dark:text-accent-amber font-semibold mb-4 text-lg">${profile.hourlyRate}<span className="text-sm text-slate-400 font-normal">/hr</span></p>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6">
                        {profile.description || "Experienced professional ready to help with your next project."}
                      </p>
                      
                      <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/50 py-2 rounded-lg">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Local Area</div>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                        <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {profile.experience || '1+ Year'}</div>
                      </div>

                      <Link href={`/worker/${profile.id}`} className="btn-secondary w-full group-hover:bg-primary group-hover:text-white group-hover:border-blue-600">
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination Mock */}
            {!loading && workers.length > 0 && (
              <div className="mt-12 flex justify-center gap-2">
                <button className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">1</button>
                <button className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-md">2</button>
                <button className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">3</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
