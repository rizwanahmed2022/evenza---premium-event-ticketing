import React, { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full space-y-3">
      <label className="text-[10px] font-black text-brand-sub dark:text-slate-400 uppercase tracking-[0.3em]">
        {label}
      </label>
      <textarea
        className={`
          w-full px-6 py-4 rounded-[5px] border-2 bg-white dark:bg-black 
          text-brand-text dark:text-white font-bold text-lg
          placeholder:text-brand-sub/30 dark:placeholder:text-slate-700
          transition-all duration-200 outline-none resize-none
          ${error 
            ? 'border-red-500 focus:border-red-600' 
            : 'border-primary dark:border-slate-800 focus:border-primary-hover dark:focus:border-primary'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;