import { Coordinate, Ship } from '../types';

/**
 * Validates if a ship can be placed at the given coordinates.
 */
export const isValidPlacement = (
  shipLength: number,
  isVertical: boolean,
  x: number,
  y: number,
  gridSize: number,
  occupiedCells: Set<string>
): boolean => {
  // Check bounds
  if (isVertical) {
    if (y + shipLength > gridSize) return false;
  } else {
    if (x + shipLength > gridSize) return false;
  }

  // Check overlap
  for (let i = 0; i < shipLength; i++) {
    const checkX = isVertical ? x : x + i;
    const checkY = isVertical ? y + i : y;
    if (occupiedCells.has(`${checkX},${checkY}`)) {
      return false;
    }
  }

  return true;
};

/**
 * Returns a set of stringified coordinates ("x,y") that are currently occupied by ships.
 */
export const getOccupiedCells = (ships: Ship[]): Set<string> => {
  const occupied = new Set<string>();
  ships.forEach((ship) => {
    ship.coordinates.forEach((coord) => {
      occupied.add(`${coord.x},${coord.y}`);
    });
  });
  return occupied;
};

/**
 * Checks if all ships in a fleet are sunk.
 */
export const isFleetSunk = (ships: Ship[]): boolean => {
  return ships.every((ship) => ship.isSunk);
};
