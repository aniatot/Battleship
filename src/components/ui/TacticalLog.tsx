import { LogEntry } from '../../types';
import { cn } from './Button';

export const TacticalLog = ({ logs }: { logs: LogEntry[] }) => {
  return (
    <div className="w-full max-w-sm h-64 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-inner">
      <div className="bg-slate-800 px-4 py-2 font-bold text-xs uppercase tracking-widest text-slate-400 border-b border-slate-700">
        Tactical Log
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col-reverse scrollbar-thin scrollbar-thumb-slate-700">
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
      </div>
    </div>
  );
};
