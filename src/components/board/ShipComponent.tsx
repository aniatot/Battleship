import { Ship } from '../../types';
import { RotateCw } from 'lucide-react';

interface DraggableShipProps {
  ship: Ship;
  cellWidth?: number;
  onRotate?: (id: string) => void;
  onDragStart?: (id: string, e: React.DragEvent) => void;
}

export const DraggableShip = ({ ship, cellWidth = 40, onRotate, onDragStart }: DraggableShipProps) => {
  const width = ship.isVertical ? cellWidth : ship.length * cellWidth;
  const height = ship.isVertical ? ship.length * cellWidth : cellWidth;

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
      draggable={!ship.isPlaced}
      onDragStart={(e) => {
        if (!ship.isPlaced) {
          e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
          onDragStart?.(ship.id, e);
        }
      }}
      className={`relative group flex flex-col items-center justify-center border-2 rounded shadow-lg transition-transform hover:scale-100 scale-90 bg-gradient-to-br ${getShipColor(ship.type)} ${!ship.isPlaced ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none'}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        opacity: ship.isPlaced ? 0.3 : 1, // Dim when placed if shown in dock
      }}
    >
      <div className={`text-[10px] text-white uppercase font-black mix-blend-overlay tracking-widest whitespace-nowrap pointer-events-none ${ship.isVertical ? 'rotate-90' : ''}`}>
        {ship.type}
      </div>
      {!ship.isPlaced && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRotate?.(ship.id); }}
          className="absolute top-1 right-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-slate-950/80 p-1 rounded hover:bg-slate-800 cursor-pointer shadow-xl border border-cyan-800/50"
          title="Rotate Ship"
        >
          <RotateCw className="w-3 h-3 text-cyan-300" strokeWidth={3} />
        </button>
      )}
    </div>
  );
};
