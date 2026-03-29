import { Cell } from './Cell';
import { Coordinate, Ship } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw } from 'lucide-react';

interface GridProps {
  id?: string;
  size: number;
  playerType: 'player' | 'opponent';
  hits: Coordinate[];
  misses: Coordinate[];
  sunkCoords: Coordinate[];
  fleet?: Ship[];
  onCellClick?: (x: number, y: number) => void;
  onCellDrop?: (x: number, y: number, e: React.DragEvent) => void;
  interactive?: boolean;
  isPlacingPhase?: boolean;
  onShipDragStart?: (id: string, e: React.DragEvent) => void;
  onShipRotate?: (id: string) => void;
}

export const Grid = ({ id, size, playerType, hits, misses, sunkCoords, fleet, onCellClick, onCellDrop, interactive, isPlacingPhase, onShipDragStart, onShipRotate }: GridProps) => {
  const getCellState = (x: number, y: number) => {
    if (sunkCoords.some(c => c.x === x && c.y === y)) return 'ship-sunk';
    if (hits.some(c => c.x === x && c.y === y)) return 'hit';
    if (misses.some(c => c.x === x && c.y === y)) return 'miss';
    return 'empty';
  };

  const getShipColor = (type: string) => {
    switch(type) {
      case 'Carrier': return 'from-purple-600 to-indigo-600 border-indigo-400';
      case 'Battleship': return 'from-blue-600 to-cyan-600 border-cyan-300';
      case 'Cruiser': return 'from-teal-600 to-emerald-600 border-emerald-400';
      case 'Submarine': return 'from-yellow-600 to-amber-600 border-amber-400';
      case 'Destroyer': return 'from-orange-600 to-red-600 border-red-500';
      default: return 'from-slate-600 to-slate-500 border-slate-400';
    }
  };

  return (
    <div 
      id={id}
      className="relative grid gap-[1px] bg-cyan-950/80 p-1 rounded-lg border-2 border-cyan-800 shadow-[0_0_30px_rgba(8,145,178,0.2)] w-full max-w-md aspect-square"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {/* Grid Cells */}
      {Array.from({ length: size * size }).map((_, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        return (
          <Cell
            key={`${x}-${y}`}
            id={`cell-${playerType}-${x}-${y}`}
            x={x}
            y={y}
            state={getCellState(x, y)}
            isShipPresent={false}
            interactive={interactive}
            onClick={onCellClick}
            onDrop={onCellDrop}
          />
        );
      })}

      {/* Render Placed Ships As Absolutely Positioned Overlays with Colors */}
      <AnimatePresence>
        {fleet?.filter(s => s.isPlaced).map(ship => {
          // Find top-leftmost cell
          const head = ship.coordinates.reduce((min, c) => (c.x <= min.x && c.y <= min.y ? c : min), ship.coordinates[0]);
          
          const left = `${(head.x / size) * 100}%`;
          const top = `${(head.y / size) * 100}%`;
          const width = `${(ship.isVertical ? 1 : ship.length) * (100 / size)}%`;
          const height = `${(ship.isVertical ? ship.length : 1) * (100 / size)}%`;

          return (
            <motion.div 
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ 
                scale: isPlacingPhase ? 0.9 : (ship.isSunk ? 0.9 : 1), 
                opacity: ship.isSunk ? 0.4 : 0.95,
                y: ship.isSunk ? 20 : 0,
                rotateZ: ship.isSunk ? -5 : 0
              }}
              transition={{ duration: ship.isSunk ? 1.5 : 0.3, type: 'spring' }}
              exit={{ scale: 0, opacity: 0 }}
              key={ship.id}
              draggable={isPlacingPhase}
              onDragStart={(e) => {
                if (isPlacingPhase) {
                  const target = e.currentTarget as HTMLElement;
                  // Set drag image to 0,0 so cursor aligns with top-left cell
                  (e as any).dataTransfer.setDragImage(target, 0, 0);
                  onShipDragStart?.(ship.id, e as unknown as React.DragEvent);
                }
              }}
              className={`absolute z-20 p-[2px] md:p-[4px] transition-all duration-300 ${isPlacingPhase ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none'}`}
              style={{ left, top, width, height }}
            >
              <div className={`group w-full h-full rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-gradient-to-br ${getShipColor(ship.type)} border-2 opacity-95 flex items-center justify-center overflow-hidden relative`}>
                <span className={`text-[9px] md:text-sm text-white font-black mix-blend-overlay ${ship.isVertical ? 'rotate-90' : ''} tracking-widest pointer-events-none`}>
                  {ship.type.toUpperCase()}
                </span>
                {isPlacingPhase && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onShipRotate?.(ship.id); }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 p-1 rounded hover:bg-slate-800 cursor-pointer shadow-xl border border-cyan-800/50"
                    title="Rotate Ship"
                  >
                    <RotateCw className="w-3 h-3 md:w-4 md:h-4 text-cyan-300" strokeWidth={3} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
