"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Star, Shield, Clock, MapPin, 
  CheckCircle, Zap, CreditCard, ChevronRight, 
  Wrench, Zap as ZapIcon, Droplets, BookOpen, Truck, Briefcase,
  Users, LogIn, UserPlus, MessageSquare
} from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative pt-28 pb-32 overflow-hidden bg-gradient-to-br from-red-50 via-amber-50 to-blue-50 dark:from-slate-900 dark:via-red-950 dark:to-blue-950">
        {/* Animated Background Waves */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-gradient-to-tr from-amber-400/20 to-red-600/20 dark:from-amber-600/10 dark:to-red-600/10 rounded-full blur-3xl -z-10 animate-wave" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-red-400/20 to-blue-400/20 dark:from-red-600/10 dark:to-blue-800/10 rounded-full blur-3xl -z-10 animate-wave" style={{ animationDelay: '5s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              Find Trusted <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-900 to-amber-600 dark:from-red-500 dark:to-amber-400">
                Local Services Across Yemen
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Souq Yemen connects you with skilled professionals for all your needs — fast, reliable, and local.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
              <Link href="/services" className="btn-primary py-3 px-8 rounded-xl text-lg flex items-center justify-center">
                Find Services
              </Link>
              <Link href="/register?role=worker" className="bg-white dark:bg-slate-800 text-red-900 dark:text-red-400 border-2 border-slate-200 dark:border-slate-700 hover:border-red-900 dark:hover:border-red-400 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center transition-colors">
                Become a Worker
              </Link>
            </div>
            
            {/* Advanced Search Bar */}
            <form onSubmit={handleSearch} className="glass-card p-3 rounded-2xl flex flex-col md:flex-row items-center max-w-4xl mx-auto mb-10 gap-2">
              <div className="w-full md:w-1/3 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
                <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
                <input 
                  type="text" 
                  placeholder="What service do you need?" 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/3 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
                <Briefcase className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
                <select className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-300 outline-none cursor-pointer">
                  <option value="" className="text-slate-900">All Categories</option>
                  <option value="plumbing" className="text-slate-900">Plumbing</option>
                  <option value="electrical" className="text-slate-900">Electrical</option>
                  <option value="cleaning" className="text-slate-900">Cleaning</option>
                  <option value="tutoring" className="text-slate-900">Tutoring</option>
                </select>
              </div>
              <div className="w-full md:w-1/3 flex items-center px-4 py-2">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
                <input 
                  type="text" 
                  placeholder="Zip code or city" 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
              <button type="submit" className="btn-primary w-full md:w-auto py-3 px-8 rounded-xl shrink-0">
                Search
              </button>
            </form>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> <span>500+ Verified Workers</span></div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> <span>95% Satisfaction Rate</span></div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary-light" /> <span>10,000+ Jobs Completed</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-12 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Plumbing', icon: <Droplets className="w-5 h-5 text-primary-light" /> },
              { name: 'Electrical', icon: <ZapIcon className="w-5 h-5 text-yellow-500" /> },
              { name: 'Cleaning', icon: <Search className="w-5 h-5 text-teal-500" /> },
              { name: 'Tutoring', icon: <BookOpen className="w-5 h-5 text-purple-500" /> },
              { name: 'Moving', icon: <Truck className="w-5 h-5 text-orange-500" /> },
              { name: 'Handyman', icon: <Wrench className="w-5 h-5 text-slate-500" /> }
            ].map((cat, i) => (
              <div key={i} className="card-modern py-4 px-6 flex items-center gap-3 cursor-pointer group">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition">
                  {cat.icon}
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Why choose Souq Yemen?</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              We provide the safest, easiest, and most transparent way to hire local talent for any job.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-primary dark:text-accent-amber" />,
                title: 'Verified Professionals',
                desc: 'Every worker undergoes a background check and identity verification process.'
              },
              {
                icon: <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
                title: 'Secure Payments',
                desc: 'Your money is held safely until the job is completed to your satisfaction.'
              },
              {
                icon: <Clock className="h-8 w-8 text-teal-600 dark:text-teal-400" />,
                title: 'Quick Scheduling & 24/7 Support',
                desc: 'Book instantly or schedule for a specific date right from the app with anytime support.'
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-red-200 via-amber-200 to-blue-200 dark:from-slate-700 dark:via-red-900 dark:to-slate-700 -z-10"></div>
            
            {[
              { step: '1', title: 'Post a Request', desc: 'Describe the service you need and your budget.' },
              { step: '2', title: 'Get Quotes', desc: 'Receive offers from interested local professionals.' },
              { step: '3', title: 'Hire & Track', desc: 'Hire the best fit, communicate securely, and pay when done.' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-blue-50 dark:border-slate-700 flex items-center justify-center text-3xl font-bold text-primary dark:text-accent-amber mb-6 shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Services Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Popular Services</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400">Hire trusted professionals for your immediate needs.</p>
              </div>
              <Link href="/services" className="hidden md:flex items-center text-primary dark:text-accent-amber font-semibold hover:underline">
                View All <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Full House Deep Cleaning', price: 150, rating: 4.9, worker: 'Sarah Jenkins', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop' },
                { title: 'Emergency Plumbing Repair', price: 95, rating: 4.8, worker: 'Mike Roberts', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199fc?q=80&w=600&auto=format&fit=crop' },
                { title: 'Electrical Panel Upgrade', price: 200, rating: 5.0, worker: 'David Chen', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop' },
                { title: 'Math Tutoring (High School)', price: 40, rating: 4.9, worker: 'Elena Rodriguez', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop' },
                { title: 'Furniture Assembly', price: 60, rating: 4.7, worker: 'James Wilson', img: 'https://images.unsplash.com/photo-1606558458763-7eb922c08272?q=80&w=600&auto=format&fit=crop' },
                { title: 'Local Moving Assistance', price: 120, rating: 4.8, worker: 'Team Movers', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop' },
              ].map((service, i) => (
                <div key={i} className="card-modern rounded-2xl overflow-hidden group cursor-pointer">
                  <div className="h-48 overflow-hidden relative">
                    <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {service.rating}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                    <div className="flex justify-between items-center mb-4 text-sm text-slate-500 dark:text-slate-400">
                      <span>By <strong className="text-slate-700 dark:text-slate-300">{service.worker}</strong></span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">${service.price}<span className="text-sm font-normal text-slate-500">/hr</span></span>
                      <button className="btn-secondary py-1.5 px-4 text-sm">Book</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center md:hidden">
               <Link href="/services" className="btn-secondary inline-flex items-center">
                View All Services <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Loved by our customers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "Found an amazing plumber in under 10 minutes. The service was impeccable and the price was fair.", author: "Jessica M.", role: "Homeowner" },
              { text: "As a busy professional, I use Souq Yemen for everything from house cleaning to assembling IKEA furniture. Never disappointed.", author: "Mark T.", role: "Customer" },
              { text: "The review system gives me total peace of mind. I know exactly who is coming to my home.", author: "Samantha K.", role: "Mom of three" }
            ].map((testimonial, i) => (
              <div key={i} className="card-modern p-8 relative">
                <div className="text-slate-300 dark:text-slate-700 absolute top-4 right-6 text-6xl font-serif">&quot;</div>
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 italic relative z-10">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-inner">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{testimonial.author}</h4>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-amber-700 dark:from-red-950 dark:to-blue-950"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 bg-white/10 backdrop-blur-md border border-white/20 p-12 rounded-3xl shadow-2xl">
            <div className="text-left border-b md:border-b-0 md:border-r border-white/20 pb-10 md:pb-0 md:pr-10">
              <h2 className="text-3xl font-bold text-white mb-4">Looking for a service?</h2>
              <p className="text-red-100 mb-8 text-lg">
                Browse through thousands of verified local professionals ready to help you with your next block out.
              </p>
              <Link href="/services" className="btn-primary bg-white !text-red-900 hover:bg-slate-50 border-none inline-flex">
                Find a Professional
              </Link>
            </div>
            <div className="text-left">
              <h2 className="text-3xl font-bold text-white mb-4">Are you a professional?</h2>
              <p className="text-red-100 mb-8 text-lg">
                Join thousands of workers who use Souq Yemen to grow their business and find new clients.
              </p>
              <Link href="/register?role=worker" className="btn-secondary !border-white text-white hover:bg-white/10 hover:!text-white inline-flex">
                Become a Worker
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

