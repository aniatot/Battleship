import { LogEntry } from '../../types';
import { cn } from './Button';

export const TacticalLog = ({ logs }: { logs: LogEntry[] }) => {
  return (
    <div className="w-full max-w-sm h-64 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-slate-800 px-4 py-2 font-semibold text-slate-200">
        Tactical Log
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col-reverse">
        {/* Render in reverse so latest is at bottom/top depending on flex direction */}
        {[...logs].reverse().map((log, i) => (
          <div key={i} className="text-sm">
            <span className={cn("font-medium", {
              'text-blue-400': log.player === 'Player 1',
              'text-red-400': log.player === 'Computer' || log.player === 'Player 2',
            })}>
              {log.player}
            </span>
            <span className="text-slate-400 mx-2">attacked</span>
            <span className="font-mono text-slate-300">
              {String.fromCharCode(65 + log.target.x)}{log.target.y + 1}
            </span>
            <span className="text-slate-500 mx-2">&rarr;</span>
            <span className={cn("font-bold", {
              'text-slate-300': log.result === 'miss',
              'text-orange-500': log.result === 'hit',
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
