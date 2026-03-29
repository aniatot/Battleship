import { Coordinate } from '../types';

interface AIParams {
  gridSize: number;
  hits: Coordinate[];
  misses: Coordinate[];
  sunkShipsCoords: Coordinate[];
}

export const getComputerNextMove = ({ gridSize, hits, misses, sunkShipsCoords }: AIParams): Coordinate => {
  // 1. Identify active hits (hits that are not part of sunk ships)
  const activeHits = hits.filter(
    h => !sunkShipsCoords.some(s => s.x === h.x && s.y === h.y)
  );

  const isAttacked = (x: number, y: number) => {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return true; // Out of bounds counts as "attacked"
    if (hits.some(h => h.x === x && h.y === y)) return true;
    if (misses.some(m => m.x === x && m.y === y)) return true;
    return false;
  };

  // TARGET MODE (When we have hits but the ship isn't sunk)
  if (activeHits.length > 0) {
    if (activeHits.length === 1) {
      // One hit -> test adjacent (North, South, East, West)
      const head = activeHits[0];
      const directions = [
        { dx: 0, dy: -1 }, // N
        { dx: 0, dy: 1 },  // S
        { dx: 1, dy: 0 },  // E
        { dx: -1, dy: 0 }  // W
      ];

      // Shuffle directions so it explores randomly around the hit
      directions.sort(() => Math.random() - 0.5);

      for (const dir of directions) {
        const nx = head.x + dir.dx;
        const ny = head.y + dir.dy;
        if (!isAttacked(nx, ny)) {
          return { x: nx, y: ny };
        }
      }
    } else {
      // Multiple hits -> find the axis (Horizontal or Vertical) and target the ends
      const isHorizontal = activeHits.every(h => h.y === activeHits[0].y);
      const isVertical = activeHits.every(h => h.x === activeHits[0].x);

      if (isHorizontal) {
        const minX = Math.min(...activeHits.map(h => h.x));
        const maxX = Math.max(...activeHits.map(h => h.x));
        const y = activeHits[0].y;
        
        // Try ends (Boundary awareness handled by isAttacked)
        if (!isAttacked(minX - 1, y)) return { x: minX - 1, y };
        if (!isAttacked(maxX + 1, y)) return { x: maxX + 1, y };
      } else if (isVertical) {
        const minY = Math.min(...activeHits.map(h => h.y));
        const maxY = Math.max(...activeHits.map(h => h.y));
        const x = activeHits[0].x;
        
        if (!isAttacked(x, minY - 1)) return { x, y: minY - 1 };
        if (!isAttacked(x, maxY + 1)) return { x, y: maxY + 1 };
      }

      // Fallback if active hits form a weird shape (e.g., two ships adjacent to each other)
      for (const hit of activeHits) {
         const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:1,dy:0},{dx:-1,dy:0}];
         for (const d of dirs) {
           if (!isAttacked(hit.x + d.dx, hit.y + d.dy)) return { x: hit.x + d.dx, y: hit.y + d.dy };
         }
      }
    }
  }

  // HUNT MODE (Parity / Checkerboard Method)
  // Skip 50% of the board by firing only at cells where (x + y) % 2 == 0
  const validHuntTargets: Coordinate[] = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if ((x + y) % 2 === 0 && !isAttacked(x, y)) {
        validHuntTargets.push({ x, y });
      }
    }
  }

  if (validHuntTargets.length > 0) {
    return validHuntTargets[Math.floor(Math.random() * validHuntTargets.length)];
  }

  // FINAL RECOURSE (if all even cells are hit but a 1x1 ship exists, though smallest here is 2)
  const fallbackTargets: Coordinate[] = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!isAttacked(x, y)) fallbackTargets.push({ x, y });
    }
  }

  return fallbackTargets[Math.floor(Math.random() * fallbackTargets.length)];
};
