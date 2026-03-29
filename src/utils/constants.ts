import { Ship, ShipType } from '../types';

export const GRID_SIZE_CLASSIC = 10;
export const GRID_SIZE_ADVANCE = 12;

export const INITIAL_SHIPS_CONFIG: { id: string; type: ShipType; length: number }[] = [
  { id: 'carrier-1', type: 'Carrier', length: 5 },
  { id: 'battleship-1', type: 'Battleship', length: 4 },
  { id: 'cruiser-1', type: 'Cruiser', length: 3 },
  { id: 'submarine-1', type: 'Submarine', length: 3 },
  { id: 'destroyer-1', type: 'Destroyer', length: 2 },
];

export const createInitialShips = (): Ship[] => {
  return INITIAL_SHIPS_CONFIG.map((config) => ({
    ...config,
    coordinates: [],
    hits: [],
    isSunk: false,
    isVertical: false,
    isPlaced: false,
  }));
};
