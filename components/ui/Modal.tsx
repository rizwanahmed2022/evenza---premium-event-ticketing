import React from 'react';
import Button from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Proceed",
  cancelText = "Abort",
  variant = 'primary',
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-black border-2 border-primary dark:border-slate-800 rounded-[5px] p-10 animate-in zoom-in-95 fade-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-primary transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className={`inline-flex p-4 rounded-[5px] border-2 mb-8 ${
            variant === 'danger' ? 'border-red-500 text-red-500' : 'border-primary text-primary'
          }`}>
            <AlertTriangle size={32} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
            {title}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed mb-10 uppercase tracking-tight">
            {message}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="secondary" 
              onClick={onClose}
              className="py-4 text-[10px] tracking-widest border-2"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button 
              variant={variant === 'danger' ? 'danger' : 'primary'} 
              onClick={onConfirm}
              className="py-4 text-[10px] tracking-widest border-2"
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;