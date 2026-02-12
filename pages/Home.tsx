import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Event } from '../types';
import EventCard from '../components/EventCard';
import { Search, Sparkles, Music, Code, Palette, Zap } from 'lucide-react';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { name: 'Music', icon: Music },
    { name: 'Tech', icon: Code },
    { name: 'Art', icon: Palette },
    { name: 'Networking', icon: Zap },
  ];

  return (
    <div className="pb-24">
      {/* Refined Hero Section */}
      <section className="bg-white dark:bg-black py-20 md:py-32 px-6 overflow-hidden relative border-b border-slate-50 dark:border-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#10B981_1.5px,transparent_1.5px)] [background-size:48px_48px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 border-2 border-primary/20 rounded-full mb-10 bg-emerald-50/30 dark:bg-emerald-950/5">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Structural Integrity // Access Granted</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-brand-text dark:text-white mb-8 tracking-tighter leading-none uppercase">
            Book the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-emerald-600">Stage.</span>
          </h1>
          
          <p className="text-slate-400 dark:text-slate-500 text-lg md:text-xl font-medium mb-16 max-w-2xl leading-relaxed uppercase tracking-tighter italic">
            High-fidelity event infrastructure for the modern collective.
          </p>
          
          {/* Cute Pill Search Bar */}
          <div className="w-full max-w-xl relative group px-4">
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform duration-300">
              <Search size={20} />
            </div>
            <input 
              type="text"
              placeholder="Query events, categories, locations..."
              className="w-full pl-16 pr-8 py-5 md:py-6 rounded-full text-base font-black placeholder:text-slate-300 dark:placeholder:text-slate-800 bg-white dark:bg-black border-2 border-slate-100 dark:border-slate-800 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none uppercase tracking-tight"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSearchQuery(cat.name)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-black hover:border-primary hover:text-primary transition-all text-[9px] font-black uppercase tracking-widest text-slate-400"
              >
                <cat.icon size={12} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Content - Modern Spacious Horizontal Feed */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.5em] mb-2">Live Transmission</h2>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black text-brand-text dark:text-white uppercase tracking-tighter">Current Feed</span>
              <div className="h-1 flex-grow bg-slate-100 dark:bg-slate-900 hidden md:block rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-4 px-8 py-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-900 rounded-2xl">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {filteredEvents.length} Active Stages
             </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-48">
            <div className="w-20 h-20 border-4 border-slate-100 dark:border-slate-900 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-12 font-black text-[10px] uppercase tracking-[0.5em] text-primary animate-pulse">Synchronizing Grid</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 md:gap-20">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="py-48 text-center border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-[40px] bg-white dark:bg-transparent">
            <div className="w-24 h-24 bg-slate-50 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-slate-100 dark:border-slate-800">
              <Search size={40} className="text-slate-200 dark:text-slate-700" />
            </div>
            <h3 className="text-3xl font-black text-brand-text dark:text-white mb-4 uppercase tracking-tighter">No Active Signals</h3>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">Query parameters returned zero matching modules</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-12 text-primary font-black uppercase text-[10px] tracking-widest border-b-2 border-primary pb-1 hover:text-emerald-400 hover:border-emerald-400 transition-all"
            >
              Reset Frequency
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;