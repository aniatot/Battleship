export type Coordinate = {
  x: number;
  y: number;
};

export type ShipType = 'Carrier' | 'Battleship' | 'Cruiser' | 'Submarine' | 'Destroyer';

export type Ship = {
  id: string;
  type: ShipType;
  length: number;
  coordinates: Coordinate[]; // The grid cells this ship occupies (empty before placement)
  hits: Coordinate[];        // Which cells have been hit
  isSunk: boolean;
  graphicUrl?: string;       // For modern UI graphics
  isVertical: boolean;       // Rotation state during placement
  isPlaced: boolean;         // True if successfully placed on board
};

export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

export type PlayerState = 'placing' | 'playing' | 'waiting' | 'won' | 'lost';

export type LogEntry = {
  turn: number;
  player: 'Player 1' | 'Computer' | 'Player 2';
  target: Coordinate;
  result: 'hit' | 'miss' | 'sunk';
};

export type GameMode = 'classic' | 'advance';
export type MatchType = 'singleplayer' | 'multiplayer';
