import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, Shield } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError("Invalid structural credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      <div className="bg-white dark:bg-black p-10 md:p-16 rounded-[5px] border-2 border-primary dark:border-[#1F2937]">
        <div className="text-center mb-16">
          <div className="inline-flex p-4 border-2 border-primary text-primary rounded-[5px] mb-8">
            <Shield size={32} />
          </div>
          <h1 className="text-5xl font-black text-brand-text dark:text-white tracking-tighter mb-4 uppercase leading-none">Access</h1>
          <p className="text-brand-sub dark:text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Evenza Intelligence Hub</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-10">
          <Input 
            label="Credentials Email"
            icon={Mail}
            type="email"
            placeholder="name@provider.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input 
            label="Access Password"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={error || undefined}
          />

          <Button variant="primary" className="w-full py-8 text-xl" isLoading={loading}>
            Authorize Session
          </Button>
        </form>

        <div className="relative my-14">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-brand-bg dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-black px-6 text-[10px] font-black uppercase text-brand-sub tracking-[0.4em]">
              Gateway
            </span>
          </div>
        </div>

        <button 
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-4 py-5 border-2 border-primary dark:border-slate-800 rounded-[5px] hover:bg-brand-bg dark:hover:bg-slate-900 transition-all active:scale-[0.98] font-black uppercase text-[10px] tracking-widest"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
          Google Sync
        </button>

        <p className="mt-16 text-center text-brand-sub dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">
          No Access Token? <Link to="/register" className="text-primary hover:underline font-black ml-2">Register Identity</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;