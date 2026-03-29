import { Ship } from '../../types';

interface DraggableShipProps {
  ship: Ship;
  cellWidth?: number;
  onRotate?: (id: string) => void;
  onDragStart?: (id: string, e: React.DragEvent) => void;
}

export const DraggableShip = ({ ship, cellWidth = 40, onRotate, onDragStart }: DraggableShipProps) => {
  const width = ship.isVertical ? cellWidth - 5 : ship.length * cellWidth;
  const height = ship.isVertical ? ship.length * cellWidth : cellWidth - 5;

  const getShipColor = (type: string) => {
    switch (type) {
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
      onClick={(e) => {
        if (!ship.isPlaced) {
          e.stopPropagation();
          onRotate?.(ship.id);
        }
      }}
      className={`relative group flex flex-col items-center justify-center border-2 rounded shadow-lg transition-all hover:scale-100 scale-90 bg-gradient-to-br ${getShipColor(ship.type)} ${!ship.isPlaced ? 'cursor-pointer' : 'pointer-events-none'}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        opacity: ship.isPlaced ? 0.3 : 1, // Dim when placed if shown in dock
      }}
      title={!ship.isPlaced ? "Drag to deploy, click to rotate" : ""}
    >
      <div className={`text-[9px] text-white/90 uppercase font-black tracking-widest drop-shadow-[0_0_2px_rgba(0,0,0,0.5)] ${ship.isVertical ? 'rotate-90' : ''} pointer-events-none`}>
        {ship.type}
      </div>
    </div>
  );
};
