import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="w-full space-y-3">
      <label className="text-[10px] font-black text-brand-sub dark:text-slate-400 uppercase tracking-[0.3em]">
        {label}
      </label>
      <div className="relative group">
        <select
          className={`
            w-full px-6 py-4 rounded-[5px] border-2 bg-white dark:bg-black 
            text-brand-text dark:text-white font-bold text-lg
            transition-all duration-200 outline-none cursor-pointer appearance-none
            border-primary dark:border-slate-800 focus:border-primary-hover dark:focus:border-primary
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;