import { Coordinate } from '../../types';
import { cn } from '../ui/Button';
import { motion } from 'framer-motion';

interface CellProps {
  id?: string;
  x: number;
  y: number;
  state: 'empty' | 'hit' | 'miss' | 'ship-sunk';
  isShipPresent: boolean;
  onClick?: (x: number, y: number) => void;
  onDrop?: (x: number, y: number, e: React.DragEvent) => void;
  interactive?: boolean;
}

export const Cell = ({ id, x, y, state, isShipPresent, onClick, onDrop, interactive }: CellProps) => {
  return (
    <div
      id={id}
      className={cn(
        "relative w-full h-full border border-cyan-900/40 transition-colors flex items-center justify-center overflow-hidden",
        {
          "bg-slate-900/40 hover:bg-cyan-900/60": interactive && state === 'empty',
          "bg-slate-950/80": !interactive || state !== 'empty',
          "cursor-crosshair": interactive && state === 'empty',
        }
      )}
      onClick={() => interactive && state === 'empty' && onClick?.(x, y)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (onDrop) onDrop(x, y, e);
      }}
    >
      {/* Hit Marker - SVG Blast */}
      {state === 'hit' && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2, rotate: [0, 45, 90, 180, 360] }} transition={{ duration: 0.6 }} className="absolute z-10 w-[80%] h-[80%] flex items-center justify-center drop-shadow-[0_0_10px_#ef4444]">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-90">
            <path fill="#ef4444" d="M50 0 L58 38 L100 50 L58 62 L50 100 L42 62 L0 50 L42 38 Z" />
            <circle cx="50" cy="50" r="25" fill="#f97316" />
            <circle cx="50" cy="50" r="10" fill="#fef08a" />
          </svg>
        </motion.div>
      )}
      {/* Miss Marker - SVG Water Splash */}
      {state === 'miss' && (
        <motion.div initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.4, type: 'spring' }} className="absolute z-10 w-[60%] h-[60%] drop-shadow-[0_0_8px_#38bdf8] flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path fill="#ffffff" opacity="0.7" d="M50 10 Q65 50 80 70 Q90 90 50 95 Q10 90 20 70 Q35 50 50 10 Z" />
            <circle cx="30" cy="45" r="8" fill="#e0f2fe" opacity="0.8" />
            <circle cx="70" cy="55" r="6" fill="#e0f2fe" opacity="0.8" />
          </svg>
        </motion.div>
      )}
      {/* Sunk Marker Overlay */}
      {state === 'ship-sunk' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="absolute inset-0 bg-red-950/70 z-20 pointer-events-none flex items-center justify-center">
           <div className="w-1/2 h-1/2 bg-red-600 rounded-sm rotate-45 border-2 border-red-400 opacity-60" />
        </motion.div>
      )}
    </div>
  );
};
