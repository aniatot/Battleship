import { Coordinate } from '../../types';
import { cn } from '../ui/Button';
import { motion } from 'framer-motion';
import { HitIcon } from '../img/HitIcon';
import { MissIcon } from '../img/MissIcon';

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
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            // Pulse scale between 1 and 1.3
            scale: [1, 1.3, 1.1, 1.4, 1.2],
            // Flicker opacity for a fire/explosion effect
            opacity: [0.7, 1, 0.8, 1, 0.9],
            rotate: [0, 20, 45, 25, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity, // Makes it pulse forever
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1] // Defines the timing of the keyframes
          }}
          className="absolute z-10 w-[80%] h-[80%] flex items-center justify-center drop-shadow-[0_0_15px_#ef4444]"
        >
          {/* Standardize the blast graphics using the extracted HitIcon component */}
          <HitIcon className="w-full h-full" />
        </motion.div>
      )}
      {/* Miss Marker - SVG Water Splash */}
      {state === 'miss' && (
        <motion.div initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring' }} className="absolute z-10 w-[60%] h-[60%] drop-shadow-[0_0_8px_#38bdf8] flex items-center justify-center">
          {/* Standardize the splash graphics using the extracted MissIcon component */}
          <MissIcon className="w-full h-full" />
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
