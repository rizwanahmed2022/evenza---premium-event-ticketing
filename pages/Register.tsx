
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Mail, Lock, UserPlus, Sparkles } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'attendee' | 'organizer'>('attendee');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCred.user, { displayName: formData.name });
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        email: formData.email,
        displayName: formData.name,
        role: role,
        createdAt: serverTimestamp()
      });
      navigate('/');
    } catch (err) {
      setError("Registration sequence failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      <div className="bg-white dark:bg-black p-10 md:p-16 rounded-[5px] border-2 border-primary dark:border-[#1F2937]">
        <div className="text-center mb-16">
          <div className="inline-flex p-4 border-2 border-primary text-primary rounded-[5px] mb-8">
            <UserPlus size={32} />
          </div>
          <h1 className="text-5xl font-black text-brand-text dark:text-white tracking-tighter mb-4 uppercase leading-none">Enroll</h1>
          <p className="text-brand-sub dark:text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Initialize Your Profile</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-brand-sub dark:text-slate-400 uppercase tracking-[0.3em]">Sector Role</label>
            <div className="grid grid-cols-2 gap-4">
               <button 
                 type="button" 
                 onClick={() => setRole('attendee')}
                 className={`py-5 rounded-[5px] border-2 font-black uppercase text-[10px] tracking-widest transition-all ${
                   role === 'attendee' 
                   ? 'border-primary bg-primary text-white' 
                   : 'border-brand-bg dark:border-slate-800 text-brand-sub dark:text-slate-500'
                 }`}
               >
                 Attendee
               </button>
               <button 
                 type="button" 
                 onClick={() => setRole('organizer')}
                 className={`py-5 rounded-[5px] border-2 font-black uppercase text-[10px] tracking-widest transition-all ${
                   role === 'organizer' 
                   ? 'border-primary bg-primary text-white' 
                   : 'border-brand-bg dark:border-slate-800 text-brand-sub dark:text-slate-500'
                 }`}
               >
                 Organizer
               </button>
            </div>
          </div>

          <div className="space-y-10">
            <Input 
              label="Official Display Name"
              icon={User}
              placeholder="Your Full Name"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              required
            />

            <Input 
              label="Credentials Email"
              icon={Mail}
              type="email"
              placeholder="name@provider.com"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              required
            />

            <Input 
              label="Secure Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
              required
              minLength={6}
              error={error || undefined}
            />
          </div>

          <Button variant="primary" className="w-full py-8 text-xl" isLoading={loading}>
            Create Identity
          </Button>
        </form>

        <div className="mt-16 pt-10 border-t-2 border-brand-bg dark:border-slate-800 text-center">
          <p className="text-brand-sub dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">
            Existing Profile? <Link to="/login" className="text-primary hover:underline font-black ml-2">Login Hub</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Add missing default export
export default Register;
