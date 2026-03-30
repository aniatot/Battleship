"use client";

import { LogEntry } from '../../types';
import { cn } from './Button';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TacticalLog = ({ logs }: { logs: LogEntry[] }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-inner transition-shadow hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-slate-800/80 px-4 py-3 font-bold text-xs uppercase tracking-widest text-slate-300 border-b border-slate-700/50 flex justify-between items-center hover:bg-slate-700/80 hover:text-cyan-400 transition-colors"
      >
        <span>Tactical Log ({logs.length})</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-y-auto max-h-[250px] p-4 space-y-2 flex flex-col-reverse custom-scrollbar"
          >
            {/* Render in reverse so latest is at bottom/top depending on flex direction */}
            {[...logs].reverse().map((log, i) => (
              <div key={i} className="text-sm flex items-baseline gap-1 animate-in slide-in-from-left duration-200">
                <span
                  className="font-bold min-w-[80px]"
                  style={{ color: log.color || '#94a3b8' }}
                >
                  {log.player}
                </span>
                <span className="text-slate-500 lowercase text-[8px] tracking-tight">attacked</span>
                <span className="font-mono text-cyan-500 font-bold px-1 bg-cyan-900/20 rounded">
                  {String.fromCharCode(65 + log.target.x)}{log.target.y + 1}
                </span>
                <span className="text-slate-600">&rarr;</span>
                <span className={cn("font-black tracking-tighter italic", {
                  'text-slate-400': log.result === 'miss',
                  'text-orange-400': log.result === 'hit',
                  'text-red-500': log.result === 'sunk',
                })}>
                  {log.result.toUpperCase()}
                </span>
              </div>
            ))}
            
            {logs.length === 0 && (
              <div className="flex h-full items-center justify-center text-slate-600 text-xs italic uppercase tracking-widest">
                No recent activity
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
