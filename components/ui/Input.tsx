import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, icon: Icon, error, className = '', ...props }) => {
  return (
    <div className="w-full space-y-3">
      <label className="text-[10px] font-black text-brand-sub dark:text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
        {Icon && <Icon size={14} className="text-primary" />}
        {label}
      </label>
      <div className="relative group">
        <input
          className={`
            w-full px-6 py-4 rounded-[5px] border-2 bg-white dark:bg-black 
            text-brand-text dark:text-white font-bold text-lg
            placeholder:text-brand-sub/30 dark:placeholder:text-slate-700
            transition-all duration-200 outline-none
            ${error 
              ? 'border-red-500 focus:border-red-600' 
              : 'border-primary dark:border-slate-800 focus:border-primary-hover dark:focus:border-primary'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Input;