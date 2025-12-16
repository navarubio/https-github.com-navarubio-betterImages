
import React, { useEffect } from 'react';
import { InfoIcon, CheckCircleIcon, XCircleIcon } from './icons';

export interface ToastProps {
  title: string;
  description: string;
  variant: 'default' | 'success' | 'destructive';
  onClose: () => void;
}

const variantStyles = {
  default: {
    bg: 'bg-slate-800 dark:bg-slate-200',
    text: 'text-white dark:text-slate-900',
    icon: <InfoIcon className="h-5 w-5 text-sky-400" />,
  },
  success: {
    bg: 'bg-green-600',
    text: 'text-white',
    icon: <CheckCircleIcon className="h-5 w-5 text-white" />,
  },
  destructive: {
    bg: 'bg-red-600',
    text: 'text-white',
    icon: <XCircleIcon className="h-5 w-5 text-white" />,
  },
};

export const Toast: React.FC<ToastProps> = ({ title, description, variant, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const styles = variantStyles[variant];

  return (
    <div
      className={`fixed top-5 right-5 z-50 w-full max-w-sm p-4 rounded-lg shadow-lg flex items-start space-x-4 ${styles.bg} ${styles.text} animate-in slide-in-from-top`}
    >
      <div className="flex-shrink-0">{styles.icon}</div>
      <div className="flex-1">
        <p className="font-bold">{title}</p>
        <p className="text-sm opacity-90">{description}</p>
      </div>
      <button onClick={onClose} className="p-1 -m-1 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
