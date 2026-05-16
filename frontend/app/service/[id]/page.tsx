"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { Star, Clock, MapPin, CheckCircle, Shield, User as UserIcon, Calendar as CalendarIcon, Flag } from 'lucide-react';
import Link from 'next/link';
import ReportModal from '@/components/ReportModal';

export default function ServiceDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchServiceData = async () => {
      try {
        // Fetch all services and find the specific one 
        const res = await fetch(`${API_BASE_URL}/services`, { cache: 'no-store' });
        if (res.ok) {
          const allServices = await res.json();
          const foundService = allServices.find((s: any) => s.id === parseInt(id as string));
          setService(foundService);
        }
      } catch (error) {
        console.error("Failed to fetch service details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceData();
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login to book this service", "error");
      router.push('/login');
      return;
    }
    if (!bookingDate) {
      showToast("Please select a date", "error");
      return;
    }

    setIsBooking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          serviceId: service.id,
          workerId: service.workerId,
          date: bookingDate
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast("Service booked successfully! Awaiting worker confirmation.", "success");
        router.push('/customer');
      } else {
        showToast(data.message || "Failed to book service", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Network error. Could not book service.", "error");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-10 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );

  if (!service) return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-32 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Service Not Found</h1>
      <p className="text-slate-500 mb-8 max-w-md text-center">We couldn&apos;t find the service you are looking for. It might have been removed by the professional.</p>
      <button onClick={() => router.push('/services')} className="btn-primary">Browse All Services</button>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-primary">Services</Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-300 font-medium">{service.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Service Header Info */}
            <div className="card-modern overflow-hidden">
              <div className="h-64 sm:h-80 md:h-96 bg-slate-200 dark:bg-slate-800 relative w-full">
                {/* Fallback image using a nice abstract gradient for services without images */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
                  <h1 className="text-white/20 text-4xl sm:text-6xl font-bold text-center px-4 leading-tight">{service.category} Service</h1>
                </div>
                {service.imageUrl && (
                  <img src={service.imageUrl} alt={service.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
              </div>
              
              <div className="p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-blue-800 dark:bg-blue-900/30 dark:text-accent-amber text-xs font-bold tracking-wider uppercase mb-3">
                      {service.category}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                      {service.title}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 py-4 border-y border-slate-100 dark:border-slate-800 my-6">
                  <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> <span className="text-slate-900 dark:text-white font-bold text-base">4.9</span> (34 reviews)</div>
                  <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-slate-400" /> Serves Local Area</div>
                  <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400" /> Approx. 2-4 hours</div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Description</h2>
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-lg leading-relaxed whitespace-pre-line">
                  {service.description || "The professional hasn&apos;t provided a detailed description for this service yet. Reach out to them for more specifications."}
                </div>
              </div>
            </div>

            {/* Worker Info Card */}
            <div className="card-modern p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">About the Professional</h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shrink-0">
                  {service.worker?.User?.profileImage ? (
                    <img src={service.worker.User.profileImage} alt={service.worker.User.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                      <UserIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {service.worker?.User?.name || 'Professional Worker'}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-yellow-500 mt-1 mb-2">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-500" />)}
                    <span className="text-slate-500 text-sm ml-1">(5.0)</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {service.worker?.description || "Experienced professional ready to assist you. Highly rated and vetted by Souq Yemen."}
                  </p>
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <Link href={`/worker/${service.workerId}`} className="btn-secondary !py-2 !px-4 text-sm inline-flex">
                      View Full Profile
                    </Link>
                    <Link href={`/messages?userId=${service.workerId}`} className="btn-primary !py-2 !px-4 text-sm inline-flex">
                      Message
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Booking Sticky Card */}
          <div className="lg:col-span-1">
             <div className="card-modern p-6 sticky top-24">
               
               <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                 <p className="text-sm text-slate-500 font-medium mb-1">Service Price</p>
                 <div className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-end gap-1">
                   ${service.price} <span className="text-lg font-normal text-slate-500 dark:text-slate-400 pb-1">/ job</span>
                 </div>
               </div>

               <form onSubmit={handleBooking} className="space-y-6">
                 <div>
                   <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Select Date</label>
                   <div className="relative">
                     <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input 
                       type="date" 
                       required
                       min={new Date().toISOString().split('T')[0]} // Cannot book in the past
                       value={bookingDate}
                       onChange={(e) => setBookingDate(e.target.value)}
                       className="input-modern !pl-10"
                     />
                   </div>
                 </div>

                 <button 
                  type="submit" 
                  disabled={isBooking}
                  className={`btn-primary w-full py-3.5 text-lg shadow-blue-500/30 ${isBooking ? 'opacity-70 cursor-not-allowed' : ''}`}
                 >
                   {isBooking ? 'Processing Booking...' : 'Book This Service'}
                 </button>

                 <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                   You won&apos;t be charged yet. The professional must first accept your request.
                 </p>
               </form>

               <div className="mt-8 space-y-4">
                 <div className="flex items-start gap-3">
                   <Shield className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                   <div>
                     <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">Souq Yemen Guarantee</p>
                     <p className="text-xs text-slate-500">Your satisfaction is guaranteed. Payments are held until the job is completed safely.</p>
                   </div>
                 </div>
                  <div className="flex items-start gap-3">
                   <CheckCircle className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />
                   <div>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">Verified Professional</p>
                     <p className="text-xs text-slate-500">Identity and background checks have been successfully cleared.</p>
                   </div>
                 </div>

                 <button
                   type="button"
                   onClick={() => setIsReportOpen(true)}
                   className="mt-6 flex items-center justify-center gap-2 w-full py-2 text-sm text-slate-500 hover:text-red-500 transition-colors"
                 >
                   <Flag className="w-4 h-4" /> Report this service
                 </button>
               </div>

             </div>
          </div>

        </div>

      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetId={service.id}
        targetType="service"
      />
    </div>
  );
}
