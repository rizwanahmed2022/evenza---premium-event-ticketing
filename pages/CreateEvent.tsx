import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import CloudinaryUpload from '../components/CloudinaryUpload';
import { Sparkles, Calendar, MapPin, DollarSign, Users, Type, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { generateEventDescription } from '../services/geminiService';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [aiLoading, setAiLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Technology',
    price: 0,
    capacity: 100,
    imageUrl: '' 
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!isEditMode) return;
      try {
        const docRef = doc(db, 'events', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.organizerId !== auth.currentUser?.uid) {
            navigate('/admin');
            return;
          }
          setFormData({
            title: data.title || '',
            description: data.description || '',
            date: data.date || '',
            location: data.location || '',
            category: data.category || 'Technology',
            price: data.price || 0,
            capacity: data.capacity || 100,
            imageUrl: data.imageUrl || ''
          });
        } else {
          setFormError("Event record not found.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setFormError("Failed to retrieve event configuration.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEvent();
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!auth.currentUser) { setFormError("Authorization required."); return; }
    
    setLoading(true);
    try {
      const eventDoc: any = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        category: formData.category,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        imageUrl: formData.imageUrl || '', 
        updatedAt: serverTimestamp()
      };

      if (isEditMode) {
        await updateDoc(doc(db, 'events', id), eventDoc);
      } else {
        eventDoc.ticketsSold = 0;
        eventDoc.organizerId = auth.currentUser.uid;
        eventDoc.createdAt = serverTimestamp();
        await addDoc(collection(db, 'events'), eventDoc);
      }
      navigate('/admin');
    } catch (error) {
      console.error("Persistence error:", error);
      setFormError("Persistence failure. Please verify structural integrity.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiDescription = async () => {
    if (!formData.title) { alert("Title required for AI assist."); return; }
    setAiLoading(true);
    const desc = await generateEventDescription(formData.title, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setAiLoading(false);
  };

  if (initialLoading) return <div className="p-48 text-center text-xs font-black uppercase tracking-widest text-primary">Synchronizing Configuration...</div>;

  const CATEGORY_OPTIONS = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Music', label: 'Music' },
    { value: 'Art', label: 'Art' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Networking', label: 'Networking' },
    { value: 'Conference', label: 'Conference' },
    { value: 'Festival', label: 'Festival' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary hover:text-primary-hover mb-16 font-black text-[10px] uppercase tracking-[0.4em] transition-all"
      >
        <ArrowLeft size={16} /> Dashboard
      </button>

      <div className="mb-20">
        <h1 className="text-6xl font-black text-brand-text dark:text-white uppercase tracking-tighter mb-4">
          {isEditMode ? 'Edit Stage' : 'New Stage'}
        </h1>
        <p className="text-brand-sub dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">
          {isEditMode ? 'Modify event parameters' : 'Initialize event configuration'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {formError && (
          <div className="border-2 border-red-500 bg-red-50 text-red-600 px-10 py-6 rounded-[5px] flex items-center gap-4">
            <AlertCircle size={24} />
            <span className="font-black uppercase text-sm tracking-widest">{formError}</span>
          </div>
        )}

        <div className="bg-brand-card dark:bg-black p-12 md:p-16 rounded-[5px] border-2 border-primary dark:border-[#1F2937] space-y-16">
          <CloudinaryUpload 
            onSuccess={(url) => setFormData(p => ({ ...p, imageUrl: url }))}
            initialValue={formData.imageUrl}
          />

          <div className="grid md:grid-cols-2 gap-12">
            <Input 
              label="Identifier Title"
              icon={Type}
              placeholder="Official Event Name"
              value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              required
            />
            <Select 
              label="Sector Category"
              options={CATEGORY_OPTIONS}
              value={formData.category}
              onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
            />
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-brand-text dark:text-slate-400 uppercase tracking-[0.3em]">Storytelling Narrative</label>
              <button 
                type="button"
                onClick={handleAiDescription}
                disabled={aiLoading}
                className="text-[10px] font-black text-primary flex items-center gap-2 border-2 border-primary px-6 py-2.5 rounded-[5px] hover:bg-primary hover:text-white transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                AI Synthesis
              </button>
            </div>
            <TextArea 
              label=""
              rows={5}
              placeholder="Provide event briefings..."
              value={formData.description}
              onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Input 
              label="Temporal Schedule"
              icon={Calendar}
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
              required
            />
            <Input 
              label="Physical/Virtual Venue"
              icon={MapPin}
              placeholder="Coordinates or URL"
              value={formData.location}
              onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Input 
              label="Admissions Fee (PKR)"
              icon={DollarSign}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData(p => ({ ...p, price: Number(e.target.value) }))}
              required
            />
            <Input 
              label="Attendee Threshold"
              icon={Users}
              type="number"
              min="1"
              placeholder="100"
              value={formData.capacity}
              onChange={(e) => setFormData(p => ({ ...p, capacity: Number(e.target.value) }))}
              required
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-10 text-2xl mt-12"
            isLoading={loading}
          >
            {isEditMode ? 'Update Stage' : 'Deploy Stage'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;