import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Event } from '../types';
import Button from '../components/ui/Button';
import { Calendar, MapPin, Users, ChevronLeft, ShieldCheck } from 'lucide-react';

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop';

const EventDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const docRef = doc(db, 'events', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() } as Event);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    if (!event) return;
    setBooking(true);
    try {
      const bookingData = {
        eventId: event.id,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Guest',
        userEmail: auth.currentUser.email || '',
        eventTitle: event.title,
        eventDate: event.date,
        status: 'valid',
        bookedAt: serverTimestamp(),
        qrCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      };
      await addDoc(collection(db, 'bookings'), bookingData);
      await updateDoc(doc(db, 'events', event.id), { ticketsSold: increment(1) });
      navigate('/my-tickets');
    } catch (error) {
      console.error("Booking error:", error);
      alert('Failed to book ticket.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="p-48 text-center text-xs font-black uppercase tracking-widest text-primary">Refreshing Records</div>;
  if (!event) return <div className="p-48 text-center text-brand-text font-black uppercase tracking-widest">Stage Not Found</div>;

  const isSoldOut = event.ticketsSold >= event.capacity;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary hover:text-primary-hover mb-12 font-black text-[10px] uppercase tracking-wider transition-all group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Browse Stages
      </button>

      <div className="bg-brand-card dark:bg-black rounded-[5px] overflow-hidden border-2 border-primary dark:border-[#1F2937]">
        <div className="aspect-[21/8] border-b-2 border-primary dark:border-[#1F2937] relative overflow-hidden">
          <img 
            src={event.imageUrl || DEFAULT_EVENT_IMAGE} 
            alt={event.title}
            className="w-full h-full object-cover transition-all duration-1000"
          />
          <div className="absolute top-10 left-10">
            <span className="bg-brand-card dark:bg-black border-2 border-primary text-brand-text dark:text-emerald-400 px-8 py-3 rounded-[5px] text-[10px] font-black uppercase tracking-wider">
              {event.category}
            </span>
          </div>
        </div>
        
        <div className="p-12 md:p-20">
          <div className="flex flex-col lg:flex-row justify-between gap-16 mb-24">
            <div className="flex-grow">
              <h1 className="text-6xl md:text-8xl font-black text-brand-text dark:text-white mb-10 tracking-tighter leading-[0.9] uppercase">{event.title}</h1>
              
              <div className="flex flex-wrap gap-12">
                <div className="flex items-center gap-4 text-brand-sub dark:text-slate-400 font-black">
                  <Calendar className="text-primary" size={28} />
                  <span className="text-xl uppercase tracking-tight">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                </div>
                <div className="flex items-center gap-4 text-brand-sub dark:text-slate-400 font-black">
                  <MapPin className="text-primary" size={28} />
                  <span className="text-xl uppercase tracking-tight truncate max-w-md">{event.location}</span>
                </div>
              </div>
            </div>

            <div className="lg:w-96 bg-brand-bg dark:bg-black p-12 rounded-[5px] border-2 border-primary dark:border-[#1F2937] text-center">
              <p className="text-[10px] font-black text-brand-sub uppercase tracking-wider mb-4">Admissions Fee</p>
              <div className="text-5xl md:text-6xl font-black text-brand-text dark:text-white mb-12 tracking-tighter">
                {event.price === 0 ? 'FREE' : `PKR ${event.price}`}
              </div>
              <Button 
                variant="primary" 
                className="w-full py-8 text-2xl rounded-[5px]"
                onClick={handleBooking}
                disabled={isSoldOut || isPast}
                isLoading={booking}
              >
                {isSoldOut ? 'Sold Out' : isPast ? 'Stage Ended' : 'Secure Pass'}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-24">
            <div className="lg:col-span-2 space-y-20">
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-4">
                  <div className="w-12 h-1 bg-primary rounded-[5px]"></div> Structural Briefing
                </h3>
                <p className="text-brand-text dark:text-slate-400 leading-relaxed text-2xl font-bold whitespace-pre-wrap uppercase tracking-tighter">
                  {event.description}
                </p>
              </div>

              <div className="border-2 border-primary bg-brand-bg/30 dark:bg-emerald-500/5 p-10 rounded-[5px] flex items-start gap-8">
                <ShieldCheck className="text-primary shrink-0" size={48} />
                <div>
                  <h4 className="font-black text-brand-text dark:text-white uppercase tracking-wider text-sm mb-4">Verified Admissions Protocol</h4>
                  <p className="text-brand-sub dark:text-slate-400 text-lg font-bold leading-relaxed tracking-tight">Secure biometric QR validation for all verified attendees. Structural integrity maintained through unique session identifiers.</p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="bg-brand-card dark:bg-black p-12 rounded-[5px] border-2 border-primary dark:border-[#1F2937]">
                <h4 className="font-black text-brand-text dark:text-white mb-10 text-[10px] uppercase tracking-widest flex items-center gap-4">
                  <Users size={20} className="text-primary" /> Sector Capacity
                </h4>
                <div className="w-full h-5 bg-brand-bg dark:bg-slate-900 rounded-[5px] overflow-hidden mb-8 border-2 border-primary">
                  <div 
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center font-black">
                  <span className="text-[10px] text-brand-sub uppercase tracking-wider">Reserved Units</span>
                  <span className="text-2xl text-brand-text dark:text-white tracking-tighter">{event.ticketsSold} <span className="text-primary mx-2">/</span> {event.capacity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;