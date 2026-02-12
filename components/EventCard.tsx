import React from 'react';
import { Calendar, MapPin, ArrowRight, Zap, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
}

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop';

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isSoldOut = event.ticketsSold >= event.capacity;

  return (
    <div className="group relative flex flex-col md:flex-row bg-white dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-[5px] overflow-hidden transition-all duration-500 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900/40">
      {/* Left Side: Asset Container */}
      <div className="relative w-full md:w-[45%] aspect-[16/10] md:aspect-auto overflow-hidden">
        <img 
          src={event.imageUrl || DEFAULT_EVENT_IMAGE} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
        />
        
        {/* Floating Badges on Image */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-white/95 dark:bg-black/95 backdrop-blur-md text-brand-text dark:text-emerald-400 text-[8px] font-black px-3 py-1.5 rounded-[5px] uppercase tracking-widest border border-slate-200 dark:border-slate-800 shadow-sm self-start">
            {event.category}
          </span>
          <div className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-[5px] shadow-lg border border-white/20 uppercase tracking-tighter self-start">
            {event.price === 0 ? 'FREE ENTRY' : `PKR ${event.price}`}
          </div>
        </div>

        {/* Status Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[4px] flex flex-col items-center justify-center">
             <div className="p-3 border-2 border-red-500 rounded-[5px] text-red-500 mb-2 animate-pulse">
                <Zap size={20} />
             </div>
             <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Sold Out</span>
          </div>
        )}
      </div>
      
      {/* Right Side: Information Metadata */}
      <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-2">Module Ref // {event.id.slice(0, 8).toUpperCase()}</p>
              <h3 className="text-3xl md:text-4xl font-black text-brand-text dark:text-white uppercase tracking-tighter group-hover:text-primary transition-colors leading-tight">
                {event.title}
              </h3>
            </div>
            <Link 
              to={`/event/${event.id}`}
              className="hidden lg:flex w-14 h-14 items-center justify-center rounded-[5px] border-2 border-slate-100 dark:border-slate-800 text-slate-400 group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all duration-300"
            >
              <ArrowRight size={24} />
            </Link>
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 uppercase tracking-tight mb-8 leading-relaxed italic">
            {event.description}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2.5 text-slate-400 font-black text-[10px] uppercase tracking-widest">
            <Calendar size={14} className="text-primary/70" />
            <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 font-black text-[10px] uppercase tracking-widest">
            <MapPin size={14} className="text-primary/70" />
            <span className="max-w-[200px] truncate">{event.location}</span>
          </div>
          
          <Link 
            to={`/event/${event.id}`}
            className="md:hidden flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest ml-auto"
          >
            Details <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;