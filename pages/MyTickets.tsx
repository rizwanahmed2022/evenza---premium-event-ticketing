import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Booking } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, Download, Share2, Ticket, Trash2, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTheme } from '../components/ThemeContext';

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  
  // Revocation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetTicket, setTargetTicket] = useState<Booking | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const ticketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      
      const sortedTickets = ticketsData.sort((a, b) => {
        const timeA = a.bookedAt?.seconds || 0;
        const timeB = b.bookedAt?.seconds || 0;
        return timeB - timeA;
      });

      setTickets(sortedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [auth.currentUser]);

  const handleDownload = async (ticket: Booking) => {
    const element = document.getElementById(`ticket-${ticket.id}`);
    if (!element) return;

    setDownloadingId(ticket.id);
    try {
      // Dynamic imports for PDF libraries
      // @ts-ignore
      const { default: html2canvas } = await import('html2canvas');
      // @ts-ignore
      const { jsPDF } = await import('jspdf');

      // Temporarily hide elements with 'no-print' class manually to ensure they don't appear in canvas
      const noPrintElements = element.querySelectorAll('.no-print');
      const originalDisplays: string[] = [];
      noPrintElements.forEach((el) => {
        originalDisplays.push((el as HTMLElement).style.display);
        (el as HTMLElement).style.display = 'none';
      });

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for professional output
        useCORS: true, // Crucial for external Cloudinary/Unsplash images
        backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF',
        logging: false,
      });

      // Restore hidden elements
      noPrintElements.forEach((el, i) => {
        (el as HTMLElement).style.display = originalDisplays[i];
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2] // Scale down canvas back to actual size in PDF
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Evenza-Pass-${ticket.qrCode}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Operational failure during PDF generation sequence.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShare = async (ticket: Booking) => {
    const shareData = {
      title: `Pass for ${ticket.eventTitle}`,
      text: `I'm attending ${ticket.eventTitle}! My Pass ID: ${ticket.qrCode}. See you there!`,
      url: window.location.origin + '/#/event/' + ticket.eventId
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Pass details copied to clipboard!');
      } catch (err) {
        alert('Sharing is not supported on this browser.');
      }
    }
  };

  const openRevokeModal = (ticket: Booking) => {
    setTargetTicket(ticket);
    setIsModalOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!targetTicket) return;
    
    setIsRevoking(true);
    try {
      await updateDoc(doc(db, 'events', targetTicket.eventId), {
        ticketsSold: increment(-1)
      });
      await deleteDoc(doc(db, 'bookings', targetTicket.id));
      await fetchTickets();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Cancellation error:", error);
      alert("Failed to revoke pass. System synchronization error.");
    } finally {
      setIsRevoking(false);
      setTargetTicket(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Retrieving Digital Passes...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <Modal 
        isOpen={isModalOpen}
        onClose={() => !isRevoking && setIsModalOpen(false)}
        onConfirm={handleConfirmRevoke}
        title="Revoke Pass?"
        message="This will release your reservation and invalidate the unique QR identifier. This action cannot be reversed."
        confirmText="Confirm Revocation"
        variant="danger"
        isLoading={isRevoking}
      />

      <div className="mb-16">
        <h1 className="text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">My Passes</h1>
        <div className="mt-4 flex items-center gap-4">
           <div className="h-1 w-20 bg-emerald-500 rounded-[5px]"></div>
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Verified Access Portfolio</p>
        </div>
      </div>

      {tickets.length > 0 ? (
        <div className="grid gap-12">
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              id={`ticket-${ticket.id}`}
              className="bg-white dark:bg-black rounded-[5px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row transition-all"
            >
              <div className="p-8 md:p-12 md:w-2/3 border-b-2 md:border-b-0 md:border-r-2 border-slate-100 dark:border-slate-800 border-dashed">
                <div className="flex items-center justify-between mb-10 no-print">
                  <span className={`px-5 py-2 rounded-[5px] text-[10px] font-black uppercase tracking-wider border-2 ${
                    ticket.status === 'valid' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'
                  }`}>
                    {ticket.status}
                  </span>
                  
                  <Button 
                    variant="danger" 
                    className="py-2.5 px-4 text-[8px]"
                    onClick={() => openRevokeModal(ticket)}
                  >
                    <Trash2 size={12} /> Revoke Pass
                  </Button>
                </div>
                
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-10 uppercase leading-none tracking-tight">{ticket.eventTitle}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div>
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-wider mb-3 flex items-center gap-2">
                      <Calendar size={12} className="text-emerald-500" /> Event Date
                    </p>
                    <p className="text-slate-900 dark:text-white font-black text-xl">
                      {new Date(ticket.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-wider mb-3 flex items-center gap-2">
                      <Clock size={12} className="text-emerald-500" /> Reference ID
                    </p>
                    <p className="text-slate-900 dark:text-white font-black text-xl uppercase tracking-tighter">{ticket.qrCode}</p>
                  </div>
                </div>

                <div className="mt-12 flex flex-wrap gap-4 no-print">
                  <Button 
                    variant="secondary" 
                    className="text-[10px] px-6 py-3 border-2 uppercase tracking-wider"
                    onClick={() => handleDownload(ticket)}
                    isLoading={downloadingId === ticket.id}
                  >
                    {downloadingId === ticket.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                    PDF Pass
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="text-[10px] px-6 py-3 border-2 uppercase tracking-wider"
                    onClick={() => handleShare(ticket)}
                  >
                    <Share2 size={14} /> Share
                  </Button>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-black p-8 md:p-12 md:w-1/3 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-6 rounded-[5px] border-2 border-slate-100 dark:border-slate-800 mb-6">
                  <QRCodeSVG value={ticket.qrCode} size={160} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan for entry</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[5px] bg-white dark:bg-transparent">
          <Ticket size={80} className="mx-auto text-slate-100 dark:text-slate-800/50 mb-8" />
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase">Empty Portfolio</h3>
          <p className="text-slate-500 font-medium mb-12">You have no active event passes at this time.</p>
          <Button variant="primary" className="px-10 mx-auto" onClick={() => window.location.href = '#/'}>
            Browse Feed
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyTickets;