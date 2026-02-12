import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Event } from '../types';
import { Users, Ticket, TrendingUp, PlusCircle, Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTickets: 0, totalRevenue: 0 });
  
  // Deletion State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetEventId, setTargetEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAdminData = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, 'events'), where('organizerId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventsData);

      let tickets = 0;
      let revenue = 0;
      eventsData.forEach(e => {
        tickets += e.ticketsSold;
        revenue += e.ticketsSold * e.price;
      });
      setStats({ totalTickets: tickets, totalRevenue: revenue });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const openDeleteModal = (id: string) => {
    setTargetEventId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetEventId) return;
    
    setIsDeleting(true);
    try {
      const q = query(collection(db, 'bookings'), where('eventId', '==', targetEventId));
      const bookingSnaps = await getDocs(q);
      
      const batch = writeBatch(db);
      bookingSnaps.docs.forEach(bDoc => batch.delete(bDoc.ref));
      batch.delete(doc(db, 'events', targetEventId));
      
      await batch.commit();
      await fetchAdminData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Deletion failure:", error);
      alert("Operational failure during deletion sequence.");
    } finally {
      setIsDeleting(false);
      setTargetEventId(null);
    }
  };

  if (loading) return <div className="p-40 text-center font-black uppercase tracking-widest text-[#10B981]">SYNCING...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <Modal 
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Purge Stage?"
        message="Critical Action: This will permanently delete the stage and all associated digital passes. This cannot be undone."
        confirmText="Confirm Purge"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-10">
        <div>
          <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase">Hub</h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em]">Operational Metrics</p>
        </div>
        <div className="flex gap-4">
          <Link to="/scan">
            <Button variant="secondary" className="px-8 border-2">Validator</Button>
          </Link>
          <Link to="/create-event">
            <Button variant="primary" className="px-8">New Stage</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {[
          { icon: Ticket, label: 'Tickets', val: stats.totalTickets },
          { icon: TrendingUp, label: 'Revenue', val: `PKR ${stats.totalRevenue.toLocaleString()}` },
          { icon: Users, label: 'Stages', val: events.length }
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-black p-10 rounded-[5px] border-2 border-slate-200 dark:border-[#1F2937] flex flex-col items-center text-center">
            <div className="p-5 border-2 border-[#10B981] dark:border-[#22C55E] rounded-[5px] mb-8 text-[#10B981] dark:text-[#22C55E]">
              <item.icon size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3">{item.label}</p>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{item.val}</h2>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-black border-2 border-slate-200 dark:border-[#1F2937] rounded-[5px] overflow-hidden">
        <div className="p-10 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-widest">Active Listings</h3>
          <span className="text-[10px] font-black uppercase bg-[#10B981] text-white px-4 py-1.5 rounded-[5px]">{events.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-black text-[10px] font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-10 py-6 text-left">Label</th>
                <th className="px-10 py-6 text-left">Performance</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-10 py-8">
                    <p className="font-black text-slate-900 dark:text-white text-lg">{event.title}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-[#10B981]">{event.category}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-48 h-3 bg-slate-100 dark:bg-slate-800 rounded-[5px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div 
                          className="bg-[#10B981] dark:bg-[#22C55E] h-full transition-all duration-700"
                          style={{ width: `${(event.ticketsSold/event.capacity)*100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-tighter text-slate-500">{event.ticketsSold}/{event.capacity}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3">
                      <Link to={`/edit-event/${event.id}`}>
                        <Button variant="secondary" className="px-6 py-2 border-2 text-[10px] uppercase tracking-widest">Edit</Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        className="px-6 py-2 border-2 text-[10px] uppercase tracking-widest"
                        onClick={() => openDeleteModal(event.id)}
                      >
                        <Trash2 size={14} /> Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="p-32 text-center">
              <PlusCircle size={64} className="mx-auto text-slate-100 mb-8" />
              <p className="font-bold text-slate-400 text-lg uppercase tracking-widest">No stages created</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;