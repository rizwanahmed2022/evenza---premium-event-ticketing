import React, { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { QrCode, Search, CheckCircle, AlertCircle, RefreshCcw, Hash } from 'lucide-react';
import { Booking } from '../types';

const TicketScanner: React.FC = () => {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: 'success' | 'error' | 'already_used', ticket?: Booking } | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;
    setLoading(true);
    setResult(null);
    try {
      const q = query(collection(db, 'bookings'), where('qrCode', '==', ticketId.toUpperCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setResult({ status: 'error' });
      } else {
        const ticketDoc = querySnapshot.docs[0];
        const ticketData = { id: ticketDoc.id, ...ticketDoc.data() } as Booking;
        if (ticketData.status === 'used') {
          setResult({ status: 'already_used', ticket: ticketData });
        } else {
          await updateDoc(doc(db, 'bookings', ticketDoc.id), { status: 'used' });
          setResult({ status: 'success', ticket: { ...ticketData, status: 'used' } });
        }
      }
    } catch (error) {
      console.error("Scanner error:", error);
      setResult({ status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTicketId('');
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Validator</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">Access Point Control</p>
      </div>

      <div className="bg-white dark:bg-black rounded-[5px] p-12 border-2 border-slate-100 dark:border-slate-800">
        {result ? (
          <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
            {result.status === 'success' && (
              <>
                <div className="w-32 h-32 border-4 border-emerald-500 text-emerald-500 rounded-[5px] flex items-center justify-center mx-auto mb-10">
                  <CheckCircle size={64} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase">Verified</h2>
                <p className="text-slate-500 font-medium text-lg mb-10">Entry granted for <span className="text-slate-900 dark:text-white font-black">{result.ticket?.userName}</span>.</p>
                <div className="bg-slate-50 dark:bg-black p-8 rounded-[5px] text-left mb-10 border-2 border-slate-100 dark:border-slate-800 space-y-6">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Identity</p>
                     <p className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{result.ticket?.qrCode}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Stage</p>
                     <p className="text-xl font-black text-slate-800 dark:text-white leading-tight">{result.ticket?.eventTitle}</p>
                   </div>
                </div>
              </>
            )}

            {result.status === 'already_used' && (
              <>
                <div className="w-32 h-32 border-4 border-orange-500 text-orange-500 rounded-[5px] flex items-center justify-center mx-auto mb-10">
                  <AlertCircle size={64} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase">Duplicate</h2>
                <p className="text-slate-500 font-medium text-lg mb-12">This digital pass has already been validated.</p>
              </>
            )}

            {result.status === 'error' && (
              <>
                <div className="w-32 h-32 border-4 border-red-500 text-red-500 rounded-[5px] flex items-center justify-center mx-auto mb-10">
                  <AlertCircle size={64} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase">Invalid</h2>
                <p className="text-slate-500 font-medium text-lg mb-12">No matching pass found for ID <span className="font-black text-red-500 uppercase">{ticketId}</span>.</p>
              </>
            )}

            <Button variant="primary" className="w-full py-6 rounded-[5px] uppercase tracking-widest" onClick={reset}>
              <RefreshCcw size={20} /> New Scan
            </Button>
          </div>
        ) : (
          <form onSubmit={handleScan} className="space-y-12">
            <div className="aspect-square bg-slate-950 rounded-[5px] border-4 border-slate-900 flex flex-col items-center justify-center text-slate-700 relative overflow-hidden group">
               <div className="absolute inset-x-0 h-1 bg-emerald-500/50 blur-sm animate-[scan_2s_ease-in-out_infinite]"></div>
               <QrCode size={100} className="mb-6 text-slate-800 group-hover:text-emerald-500 transition-colors" />
               <p className="font-black text-[10px] tracking-[0.4em] text-slate-600">LENS ACTIVE</p>
               <style>{`
                 @keyframes scan {
                   0%, 100% { top: 0%; opacity: 0; }
                   50% { top: 100%; opacity: 1; }
                 }
               `}</style>
            </div>

            <div className="flex gap-4 items-end">
               <div className="flex-grow">
                 <Input 
                   label="Manual Identifier Override"
                   icon={Hash}
                   placeholder="TKT-REF-ID"
                   value={ticketId}
                   onChange={(e) => setTicketId(e.target.value)}
                   className="font-mono uppercase"
                 />
               </div>
               <Button type="submit" variant="primary" className="h-[62px] px-8" isLoading={loading}>
                 <Search size={24} />
               </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TicketScanner;