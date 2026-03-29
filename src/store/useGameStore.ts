import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Coordinate, GameMode, LogEntry, MatchType, PlayerState, Ship } from '../types';
import { GRID_SIZE_ADVANCE, GRID_SIZE_CLASSIC, createInitialShips } from '../utils/constants';
import { getOccupiedCells, isFleetSunk, isValidPlacement } from '../utils/gameLogic';
import { getComputerNextMove } from '../utils/aiLogic';

interface GameState {
  mode: GameMode;
  matchType: MatchType;
  gridSize: number;
  
  playerState: PlayerState;
  
  playerShips: Ship[];
  computerShips: Ship[];
  
  playerHits: Coordinate[];
  playerMisses: Coordinate[];
  
  computerHits: Coordinate[];
  computerMisses: Coordinate[];
  
  logs: LogEntry[];
  turnActionCount: number;
  pendingAction: { actor: 'player' | 'computer' | 'opponent', target: Coordinate } | null;

  setMode: (mode: GameMode) => void;
  startGame: () => void;
  resetGame: () => void;
  
  rotateShip: (shipId: string) => void;
  placeShip: (shipId: string, x: number, y: number) => boolean;
  randomizePlayerShips: () => void;
  
  initiatePlayerAttack: (x: number, y: number) => void;
  initiateComputerAttack: () => void;
  resolveAttack: () => void;
}

const generateRandomShips = (gridSize: number): Ship[] => {
  const ships = createInitialShips();
  const occupied = new Set<string>();

  ships.forEach((ship) => {
    let placed = false;
    while (!placed) {
      const isVertical = Math.random() > 0.5;
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      
      if (isValidPlacement(ship.length, isVertical, x, y, gridSize, occupied)) {
        ship.isVertical = isVertical;
        ship.coordinates = [];
        for (let i = 0; i < ship.length; i++) {
          const cx = isVertical ? x : x + i;
          const cy = isVertical ? y + i : y;
          ship.coordinates.push({ x: cx, y: cy });
          occupied.add(`${cx},${cy}`);
        }
        ship.isPlaced = true;
        placed = true;
      }
    }
  });
  return ships;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      mode: 'classic',
      matchType: 'singleplayer',
      gridSize: GRID_SIZE_CLASSIC,
      
      playerState: 'placing',
      
      playerShips: createInitialShips(),
      computerShips: generateRandomShips(GRID_SIZE_CLASSIC),
      
      playerHits: [],
      playerMisses: [],
      
      computerHits: [],
      computerMisses: [],
      
      logs: [],
      turnActionCount: 0,
      pendingAction: null,

      setMode: (mode) => set({ 
        mode, 
        gridSize: mode === 'advance' ? GRID_SIZE_ADVANCE : GRID_SIZE_CLASSIC 
      }),

      startGame: () => {
        const { playerShips } = get();
        if (playerShips.every(s => s.isPlaced)) {
          set({ playerState: 'playing' });
        }
      },

      resetGame: () => {
        const { gridSize, matchType } = get();
        set({
          playerState: 'placing',
          playerShips: createInitialShips(),
          computerShips: generateRandomShips(gridSize),
          playerHits: [],
          playerMisses: [],
          computerHits: [],
          computerMisses: [],
          logs: [],
          turnActionCount: 0,
          pendingAction: null,
          matchType: 'singleplayer' 
        });
      },

      rotateShip: (shipId) => {
        const { playerShips, gridSize } = get();
        const ship = playerShips.find(s => s.id === shipId);
        if (!ship) return;

        if (!ship.isPlaced) {
          set((state) => ({
            playerShips: state.playerShips.map(s => 
              s.id === shipId ? { ...s, isVertical: !s.isVertical } : s
            )
          }));
          return;
        }

        const head = ship.coordinates.reduce((min, c) => (c.x <= min.x && c.y <= min.y ? c : min), ship.coordinates[0]);
        const otherShips = playerShips.filter(s => s.id !== shipId && s.isPlaced);
        const occupied = getOccupiedCells(otherShips);
        const newIsVertical = !ship.isVertical;

        if (isValidPlacement(ship.length, newIsVertical, head.x, head.y, gridSize, occupied)) {
          const coordinates: Coordinate[] = [];
          for (let i = 0; i < ship.length; i++) {
            coordinates.push({
              x: newIsVertical ? head.x : head.x + i,
              y: newIsVertical ? head.y + i : head.y,
            });
          }

          set((state) => ({
            playerShips: state.playerShips.map(s => 
              s.id === shipId ? { ...s, isVertical: newIsVertical, coordinates } : s
            )
          }));
        }
      },

      placeShip: (shipId, x, y) => {
        const { playerShips, gridSize } = get();
        const ship = playerShips.find(s => s.id === shipId);
        if (!ship) return false;

        const otherShips = playerShips.filter(s => s.id !== shipId && s.isPlaced);
        const occupied = getOccupiedCells(otherShips);

        if (isValidPlacement(ship.length, ship.isVertical, x, y, gridSize, occupied)) {
          const coordinates: Coordinate[] = [];
          for (let i = 0; i < ship.length; i++) {
            coordinates.push({
              x: ship.isVertical ? x : x + i,
              y: ship.isVertical ? y + i : y,
            });
          }

          set((state) => ({
            playerShips: state.playerShips.map(s => 
              s.id === shipId ? { ...s, coordinates, isPlaced: true } : s
            )
          }));
          return true;
        }
        return false;
      },

      randomizePlayerShips: () => {
        const { gridSize } = get();
        set({ playerShips: generateRandomShips(gridSize) });
      },

      initiatePlayerAttack: (x, y) => {
        const { playerState, computerHits, computerMisses } = get();
        if (playerState !== 'playing') return;

        const hasAttacked = 
          computerHits.some(c => c.x === x && c.y === y) || 
          computerMisses.some(c => c.x === x && c.y === y);
        if (hasAttacked) return;

        set({ pendingAction: { actor: 'player', target: { x, y } } });
      },

      initiateComputerAttack: () => {
        const { playerState, playerHits, playerMisses, playerShips, gridSize } = get();
        if (playerState !== 'waiting') return;

        const sunkShipsCoords = playerShips.filter(s => s.isSunk).flatMap(s => s.coordinates);
        const { x, y } = getComputerNextMove({
          gridSize,
          hits: playerHits,
          misses: playerMisses,
          sunkShipsCoords
        });

        set({ pendingAction: { actor: 'computer', target: { x, y } } });
      },

      resolveAttack: () => {
        const { pendingAction, playerShips, computerShips, playerHits, playerMisses, computerHits, computerMisses, turnActionCount, logs } = get();
        if (!pendingAction) return;

        const { actor, target: { x, y } } = pendingAction;
        let hit = false;
        let sunkShip: Ship | null = null;
        
        if (actor === 'player') {
          let newComputerShips = [...computerShips];
          newComputerShips = newComputerShips.map(ship => {
            const isHit = ship.coordinates.some(c => c.x === x && c.y === y);
            if (isHit) {
              hit = true;
              const newHits = [...ship.hits, { x, y }];
              const isSunk = newHits.length === ship.length;
              if (isSunk) sunkShip = { ...ship, hits: newHits, isSunk: true };
              return { ...ship, hits: newHits, isSunk };
            }
            return ship;
          });

          const newLogs = [...logs, {
            turn: turnActionCount + 1,
            player: 'Player 1' as const,
            target: { x, y },
            result: sunkShip ? 'sunk' as const : hit ? 'hit' as const : 'miss' as const
          }];

          const gameOver = isFleetSunk(newComputerShips);

          set((state) => {
            const updates: Partial<GameState> = {
              pendingAction: null,
              computerShips: newComputerShips,
              computerHits: hit ? [...state.computerHits, { x, y }] : state.computerHits,
              computerMisses: !hit ? [...state.computerMisses, { x, y }] : state.computerMisses,
              turnActionCount: state.turnActionCount + 1,
              playerState: gameOver ? 'won' : 'waiting'
            };
            
            if (state.matchType === 'singleplayer') {
              updates.logs = newLogs;
            }
            
            return updates;
          });

          if (!gameOver && get().matchType === 'singleplayer') {
            setTimeout(() => get().initiateComputerAttack(), 800);
          }
        } else if (actor === 'computer') {
          let newPlayerShips = [...playerShips];
          newPlayerShips = newPlayerShips.map(ship => {
            const isHit = ship.coordinates.some(c => c.x === x && c.y === y);
            if (isHit) {
              hit = true;
              const newHits = [...ship.hits, { x, y }];
              const isSunk = newHits.length === ship.length;
              if (isSunk) sunkShip = { ...ship, hits: newHits, isSunk: true };
              return { ...ship, hits: newHits, isSunk };
            }
            return ship;
          });

          const newLogs = [...logs, {
            turn: turnActionCount + 1,
            player: 'Computer' as const,
            target: { x, y },
            result: sunkShip ? 'sunk' as const : hit ? 'hit' as const : 'miss' as const
          }];

          const gameOver = isFleetSunk(newPlayerShips);

          set((state) => ({
            pendingAction: null,
            playerShips: newPlayerShips,
            playerHits: hit ? [...state.playerHits, { x, y }] : state.playerHits,
            playerMisses: !hit ? [...state.playerMisses, { x, y }] : state.playerMisses,
            logs: newLogs,
            turnActionCount: state.turnActionCount + 1,
            playerState: gameOver ? 'lost' : 'playing'
          }));
        } else {
          set({ pendingAction: null });
        }
      }
    }),
    { name: 'battleship-storage' }
  )
);
