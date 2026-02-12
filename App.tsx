import React, { createContext, useContext, ReactNode, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LogOut, PlusCircle, Sun, Moon, Menu as MenuIcon, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import { useAuth } from './hooks/useAuth';
import { UserProfile } from './types';
import { ThemeProvider, useTheme } from './components/ThemeContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import MyTickets from './pages/MyTickets';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import TicketScanner from './pages/TicketScanner';

// Context
const AuthContext = createContext<{ user: UserProfile | null; loading: boolean }>({ user: null, loading: true });

const ProtectedRoute = ({ children, role }: { children?: ReactNode, role?: 'attendee' | 'organizer' }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black font-black uppercase text-xs tracking-wider text-emerald-500">Syncing Identity...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
};

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    signOut(auth);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { label: 'Feed', path: '/' },
    ...(user ? [{ label: 'My Passes', path: '/my-tickets' }] : []),
    ...(user?.role === 'organizer' ? [{ label: 'Hub', path: '/admin' }] : []),
  ];

  return (
    <nav className="bg-white dark:bg-black border-b-2 border-slate-100 dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Evenza</span>
            <div className="ml-2 w-2 h-2 bg-emerald-500 rounded-full"></div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                  location.pathname === link.path ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-6">
                {user.role === 'organizer' && (
                  <Link to="/create-event" className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider items-center gap-2 hover:bg-emerald-600 transition-colors">
                    <PlusCircle size={14} /> New Stage
                  </Link>
                )}
                <button onClick={handleLogout} className="text-red-500 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 hover:underline">
                  <LogOut size={14} /> Exit
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center">
                <Link to="/login" className="bg-emerald-500 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors">
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
            >
              {isMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[82px] inset-x-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b-2 border-slate-100 dark:border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="p-6 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsMenuOpen(false)}
                className={`p-4 rounded-xl border-2 font-black uppercase text-xs tracking-widest text-center transition-all ${
                  location.pathname === link.path 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'bg-slate-50 dark:bg-black border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex flex-col space-y-4 pt-4 border-t-2 border-slate-50 dark:border-slate-900">
                {user.role === 'organizer' && (
                  <Link 
                    to="/create-event" 
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-emerald-500 text-white p-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={16} /> New Stage
                  </Link>
                )}
                {!user && (
                   <Link 
                   to="/login" 
                   onClick={() => setIsMenuOpen(false)}
                   className="bg-emerald-500 text-white p-4 rounded-xl text-xs font-black uppercase tracking-widest text-center"
                 >
                   Login
                 </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="bg-red-50 dark:bg-red-900/10 text-red-500 p-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-red-500/20"
                >
                  <LogOut size={16} /> Exit Account
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="bg-emerald-500 text-white p-4 rounded-xl text-xs font-black uppercase tracking-widest text-center"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  const authState = useAuth();

  return (
    <ThemeProvider>
      <AuthContext.Provider value={authState}>
        <Router>
          <div className="min-h-screen bg-[#F9FAFB] dark:bg-black flex flex-col transition-colors">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/event/:id" element={<EventDetails />} />
                
                <Route path="/my-tickets" element={
                  <ProtectedRoute>
                    <MyTickets />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute role="organizer">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/create-event" element={
                  <ProtectedRoute role="organizer">
                    <CreateEvent />
                  </ProtectedRoute>
                } />

                <Route path="/edit-event/:id" element={
                  <ProtectedRoute role="organizer">
                    <CreateEvent />
                  </ProtectedRoute>
                } />

                <Route path="/scan" element={
                  <ProtectedRoute role="organizer">
                    <TicketScanner />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            
            <footer className="bg-[#064E3B] dark:bg-black border-t-4 border-emerald-500 py-20 mt-20 transition-all">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="flex justify-center items-center gap-3 mb-8">
                  <span className="text-3xl font-black text-white tracking-tighter uppercase">Evenza</span>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                
                <p className="text-emerald-200/60 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10 max-w-md mx-auto leading-loose">
                  High-Fidelity Event Infrastructure &copy; {new Date().getFullYear()} Evenza Labs. 
                  Structural Minimalist Architecture.
                </p>
                
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                   <a href="#" className="text-[10px] font-black text-white hover:text-emerald-400 transition-colors uppercase tracking-wider">Safety Protocol</a>
                   <a href="#" className="text-[10px] font-black text-white hover:text-emerald-400 transition-colors uppercase tracking-wider">Operational Terms</a>
                   <a href="#" className="text-[10px] font-black text-white hover:text-emerald-400 transition-colors uppercase tracking-wider">Core Intelligence</a>
                   <a href="#" className="text-[10px] font-black text-white hover:text-emerald-400 transition-colors uppercase tracking-wider">Validation API</a>
                </div>

                <div className="mt-16 pt-10 border-t border-emerald-900/50 dark:border-slate-900">
                  <p className="text-[8px] font-bold text-emerald-600 dark:text-slate-800 uppercase tracking-widest">End of Transmission</p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

export default App;