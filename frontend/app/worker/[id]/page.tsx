"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User as UserIcon, MapPin, Briefcase, Star, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';
import Link from 'next/link';

export default function WorkerProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchWorkerData = async () => {
      try {
        // Fetch all workers and find the one (mocking a GET /worker/:id route if it doesn't exist)
        const workersRes = await fetch(`${API_BASE_URL}/workers`);
        const servicesRes = await fetch(`${API_BASE_URL}/services?workerId=${id}`);
        
        if (workersRes.ok) {
          const allWorkers = await workersRes.json();
          const foundWorker = allWorkers.find((w: any) => w.id === parseInt(id as string));
          setWorker(foundWorker);
        }
        
        if (servicesRes.ok) {
          const servData = await servicesRes.json();
          // The backend might return all services if workerId query isn&apos;t implemented properly,
          // so we double check and filter them.
          const filteredServices = servData.filter((s:any) => s.workerId === parseInt(id as string));
          setServices(filteredServices.length > 0 ? filteredServices : servData); // Fallback to all data if filter yields 0
        }
      } catch (error) {
        console.error("Failed to fetch worker details", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkerData();
  }, [id]);

  if (loading) return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-10 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );

  if (!worker) return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-32 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Worker Not Found</h1>
      <p className="text-slate-500 mb-8">The professional you&apos;re looking for doesn&apos;t exist or is unavailable.</p>
      <button onClick={() => router.back()} className="btn-primary">Go Back</button>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20">
      
      {/* Hero Banner Area */}
      <div className="relative pt-32 pb-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-r from-primary to-indigo-700 dark:from-blue-900 dark:to-indigo-900 -z-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-white dark:bg-slate-700 mx-auto -mt-16 mb-4">
            {worker.User?.profileImage ? (
              <img src={worker.User.profileImage} alt={worker.User.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                 <UserIcon className="w-12 h-12 text-slate-400" />
              </div>
            )}
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{worker.User?.name || 'Professional'}</h1>
          <p className="text-xl text-primary dark:text-accent-amber font-semibold mb-4 text-center">Specialist</p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 mb-8">
            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {worker.User?.location || 'Local Area'}</div>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 4.9 (124 reviews)</div>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {worker.experience || 'Experienced'}</div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/request-service?workerId=${worker.userId || worker.id}`} className="btn-primary w-full sm:w-auto text-lg px-8 shadow-blue-500/30 text-center flex items-center justify-center">
              Hire Me Now
            </Link>
            <Link href={`/messages?userId=${worker.userId || worker.id}`} className="btn-secondary w-full sm:w-auto bg-white">
              <MessageSquare className="w-4 h-4" /> Send Message
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Details & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card-modern p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">About Me</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                {worker.description ? (
                  <p>{worker.description}</p>
                ) : (
                  <p>This professional hasn&apos;t added a bio yet, but they are fully vetted and verified by our platform.</p>
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Hourly Rate</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">${worker.hourlyRate}<span className="text-sm font-normal text-slate-500">/hr</span></p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Response Time</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">&lt; 1 hour</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Jobs Completed</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">124</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">On-Time</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">99%</p>
                </div>
              </div>
            </div>

            <div className="card-modern p-8">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Client Reviews</h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">4.9</span>
                  <div className="flex"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /></div>
                </div>
              </div>
              
              <div className="space-y-6">
                {[1, 2, 3].map((r) => (
                  <div key={r} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-blue-900 text-primary dark:text-accent-amber flex items-center justify-center font-bold">
                          C{r}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">Customer User {r}</p>
                          <div className="flex items-center text-xs text-slate-500 gap-2 mt-0.5">
                            <span className="flex items-center text-yellow-500"><Star className="w-3 h-3 fill-yellow-500" /> 5.0</span>
                            <span>•</span>
                            <span>1 week ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/40 px-2 py-1 rounded-md">
                        <CheckCircle className="w-3 h-3" /> Verified Hire
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      &quot;Absolutely fantastic service. Showed up on time, knew exactly what needed to be done, and was extremely professional. Highly recommended!&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Services */}
          <div className="lg:col-span-1 space-y-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Services Offered</h3>
            
            <div className="flex flex-col gap-4">
              {services.length === 0 ? (
                <div className="card-modern p-6 text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">This professional hasn&apos;t listed specific services yet. You can still message them to arrange custom work.</p>
                </div>
              ) : (
                services.map((service) => (
                  <Link href={`/service/${service.id}`} key={service.id} className="card-modern p-5 hover:border-primary transition-colors group cursor-pointer block">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 pr-4">{service.title}</h4>
                      <span className="text-xl font-bold text-slate-900 dark:text-white shrink-0">${service.price}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{service.description || "Top rated professional service."}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                        {service.category}
                      </span>
                      <span className="text-sm font-semibold text-primary dark:text-accent-amber flex items-center group-hover:underline">
                        Book Service
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="card-modern p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border border-blue-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-light" /> Satisfaction Guarantee
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Payments are held securely. You only release funds when the work is completed to your satisfaction.
              </p>
              <Link href="/about/guarantee" className="text-sm font-semibold text-primary dark:text-accent-amber hover:underline">
                Read our policy
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

function Shield(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  );
}
