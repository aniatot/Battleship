"use client";

import { motion } from 'framer-motion';
import { SpinnerIcon } from '../img/SpinnerIcon';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {/* Render the clean extracted SVG animation for the spinner */}
      <SpinnerIcon className={`text-cyan-500 ${sizeClasses[size]}`} />
      {/* Optional thin glow effect behind it */}
      <div className={`absolute rounded-full bg-cyan-500/10 blur-xl animate-pulse ${sizeClasses[size]}`} />
    </div>
  );
};

export const FullPageSpinner = ({ message = "INITIALIZING..." }: { message?: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm"
  >
    <Spinner size="xl" />
    <motion.p 
      animate={{ opacity: [0.5, 1, 0.5] }} 
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="mt-6 text-sm font-bold tracking-[0.2em] text-cyan-400 uppercase"
    >
      {message}
    </motion.p>
  </motion.div>
);
