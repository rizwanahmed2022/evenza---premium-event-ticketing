import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-[5px] font-black text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 border-2";
  
  const variants = {
    primary: "bg-primary text-white border-primary hover:bg-primary-hover hover:border-primary-hover active:scale-[0.98]",
    secondary: "bg-brand-card dark:bg-black text-brand-text dark:text-[#E5E7EB] border-primary dark:border-[#1F2937] hover:bg-brand-bg dark:hover:bg-slate-900 active:scale-[0.98]",
    danger: "bg-brand-card dark:bg-black text-red-600 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.98]",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-[0.98]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};

export default Button;