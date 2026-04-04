"use client";

import { useEffect, useState } from 'react';
import { User as UserIcon, MapPin, Briefcase } from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Browse Workers</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Discover skilled professionals in your area ready to take on your next job.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading workers...</div>
      ) : workers.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No worker profiles available right now. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workers.map((profile) => (
            <div key={profile.id} className="glass rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg transition flex flex-col h-full p-6 text-center">
              <div className="mx-auto h-24 w-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-white dark:border-slate-800 shadow-sm">
                {profile.User?.profileImage ? (
                  <img src={profile.User.profileImage} alt={profile.User.name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-10 w-10 text-slate-400" />
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{profile.User?.name || 'Unknown Worker'}</h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">${profile.hourlyRate}/hour</p>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                {profile.description || "No description provided."}
              </p>
              
              <div className="mt-auto space-y-3">
                <div className="flex justify-center items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.User?.location || 'Remote'}</span>
                </div>
                <div className="flex justify-center items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Briefcase className="w-4 h-4" />
                  <span>{profile.experience} Exp</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
