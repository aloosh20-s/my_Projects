import Link from 'next/link';
import { Search, Star, Shield, Clock, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-blue-50 dark:bg-slate-900 -z-10" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Find the perfect <span className="text-blue-600 dark:text-blue-500">local professional</span> for your needs.
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10">
              Transform your projects into reality with trusted, vetted, and highly-rated experts near you.
            </p>
            
            <div className="glass p-2 rounded-2xl flex items-center max-w-2xl mx-auto shadow-xl">
              <div className="flex-grow flex items-center px-4">
                <Search className="h-5 w-5 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="What service do you need?" 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
              <div className="hidden sm:flex flex-grow border-l border-slate-200 dark:border-slate-700 px-4 items-center">
                <MapPin className="h-5 w-5 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Zip code or city" 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
              <button className="btn-primary py-3 px-8 rounded-xl shrink-0">
                Search
              </button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['Plumbing', 'Electricians', 'Tutors', 'Cleaners', 'Drivers', 'Handyman'].map((cat) => (
                <span key={cat} className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 cursor-pointer transition">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why choose LocalWork?</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              We provide the safest, easiest, and most transparent way to hire local talent for any job.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-blue-500" />,
                title: 'Verified Professionals',
                desc: 'Every worker undergoes a background check and identity verification process.'
              },
              {
                icon: <Star className="h-8 w-8 text-yellow-500" />,
                title: 'Trusted Reviews',
                desc: 'Read authentic reviews from actual customers who booked through our platform.'
              },
              {
                icon: <Clock className="h-8 w-8 text-blue-500" />,
                title: 'Quick Scheduling',
                desc: 'Book instantly or schedule for a specific date right from the app.'
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition duration-300">
                <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Are you a skilled professional?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of workers who use LocalWork to grow their business, find new clients, and manage their schedule.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register?role=worker" className="bg-white text-blue-600 hover:bg-slate-50 px-8 py-3 rounded-lg font-bold text-lg transition shadow-xl active:scale-95">
              Become a Worker
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
