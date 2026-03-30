"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGameStore } from "../../../store/useGameStore";
import { DraggableShip } from "../../../components/board/ShipComponent";
import { Button } from "../../../components/ui/Button";
import { MissileAnim } from "../../../components/ui/MissileAnim";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner, FullPageSpinner } from "../../../components/ui/Spinner";
import dynamic from 'next/dynamic';

const Grid = dynamic(() => import('../../../components/board/Grid').then(mod => mod.Grid), {
  ssr: false,
  loading: () => <div className="w-full max-w-md aspect-square flex items-center justify-center bg-cyan-950/20 rounded-lg border border-cyan-900/40 backdrop-blur-sm shadow-inner"><Spinner size="xl" /></div>
});

const TacticalLog = dynamic(() => import('../../../components/ui/TacticalLog').then(mod => mod.TacticalLog), {
  ssr: false,
  loading: () => <div className="w-full max-w-sm h-64 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg shadow-inner"><Spinner size="lg" /></div>
});

export default function SingleplayerGame() {
  const {
    gridSize, playerState, playerShips, computerShips, playerHits, playerMisses,
    computerHits, computerMisses, logs, startGame, resetGame,
    rotateShip, placeShip, randomizePlayerShips, initiatePlayerAttack
  } = useGameStore();

  const [isClient, setIsClient] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetGame = () => {
    setIsResetting(true);
    setTimeout(() => {
      resetGame();
      setIsResetting(false);
    }, 500);
  };

  useEffect(() => {
    setIsClient(true);
    useGameStore.setState({ matchType: 'singleplayer' });
  }, []);

  if (!isClient) return <FullPageSpinner message="INITIALIZING CLASSIC MODE..." />;
  if (isResetting) return <FullPageSpinner message="RESETTING BATTLEFIELD..." />;

  const handleDragStart = (id: string, e: React.DragEvent) => {
    e.dataTransfer.setData("shipId", id);
  };

  const handleCellDrop = (x: number, y: number, e: React.DragEvent) => {
    const shipId = e.dataTransfer.getData("shipId");
    if (shipId) placeShip(shipId, x, y);
  };

  const playerSunkCoords = playerShips.filter(s => s.isSunk).flatMap(s => s.coordinates);
  const computerSunkCoords = computerShips.filter(s => s.isSunk).flatMap(s => s.coordinates);

  const computerShipsVisible = playerState === 'lost' || playerState === 'won'
    ? computerShips
    : computerShips.filter(s => s.isSunk);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full relative">
      <MissileAnim />

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setShowExtraInfo(!showExtraInfo)}
        className="lg:hidden fixed top-4 right-4 z-[110] w-12 h-12 rounded-full bg-cyan-600/90 text-white flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.5)] border border-cyan-400/50 backdrop-blur-sm"
      >
        {showExtraInfo ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </button>

      {/* Header */}
      <motion.div
        initial={false}
        animate={showExtraInfo ? "open" : "closed"}
        variants={{
          open: { height: 'auto', opacity: 1, paddingTop: '1rem', paddingBottom: '1rem', display: 'flex' },
          closed: { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, transitionEnd: { display: 'none' } }
        }}
        className={`lg:!h-auto lg:!opacity-100 lg:!pt-4 lg:!pb-4 lg:!flex overflow-hidden flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/80 px-4 rounded-xl border border-cyan-800 shadow-[0_0_20px_rgba(8,145,178,0.3)] z-[105]`}
      >
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="border border-slate-700">&larr; Main Menu</Button>
          </Link>
          <h2 className="text-xl md:text-2xl font-black text-cyan-400 tracking-widest uppercase">Classic Mode</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-lg font-bold uppercase tracking-widest text-slate-300">
            Status: <span className="text-cyan-300">{playerState}</span>
          </div>
          <Link href="/">
            <Button variant="danger" size="sm" onClick={handleResetGame} disabled={isResetting}>
              {isResetting ? <Spinner size="sm" className="text-white w-4 h-4" /> : "Reset Game"}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Main Content: Desktop Row, Mobile Col */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center w-full">

        {/* 1. Commander Grid (Player One) */}
        <div className="flex flex-col items-center gap-4 w-full lg:w-1/3">
          <h3 className="w-full max-w-md text-center px-6 py-3 bg-slate-900/80 border border-cyan-500/30 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.15)] text-xl font-black text-cyan-400 uppercase tracking-widest">Commander Fleet</h3>
          <Grid
            id="grid-player"
            size={gridSize}
            playerType="player"
            hits={playerHits}
            misses={playerMisses}
            sunkCoords={playerSunkCoords}
            fleet={playerShips}
            onCellDrop={playerState === 'placing' ? handleCellDrop : undefined}
            interactive={playerState === 'placing'}
            isPlacingPhase={playerState === 'placing'}
            onShipDragStart={handleDragStart}
            onShipRotate={rotateShip}
          />
        </div>

        {/* 2. Utility Column (Log/Dockyard) */}
        <div className={`flex flex-col items-center gap-6 w-full lg:w-1/3 lg:pt-10`}>
          {playerState === 'placing' ? (
            <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col gap-6 shadow-lg max-w-md">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wider">Naval Dockyard</h3>
                <p className="text-sm text-slate-400">Drag ships to deploy. Click ship to rotate.</p>
              </div>

              <div className="relative flex flex-wrap gap-4 justify-center items-center p-4 bg-slate-950 rounded-lg min-h-[160px]">
                {playerShips.map(ship => (
                  <DraggableShip
                    key={ship.id}
                    ship={ship}
                    onDragStart={handleDragStart}
                    onRotate={rotateShip}
                    cellWidth={30}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={randomizePlayerShips} className="flex-1">Randomize</Button>
                  <Button variant="ghost" onClick={handleResetGame} disabled={isResetting} className="flex-1 border border-slate-700 hover:bg-slate-800 text-slate-300 gap-2">
                    {isResetting ? <Spinner size="sm" className="w-4 h-4 text-cyan-500" /> : <><RotateCcw className="w-4 h-4" /> Reset</>}
                  </Button>
                </div>
                <Button
                  variant="primary"
                  disabled={!playerShips.every(s => s.isPlaced)}
                  onClick={startGame}
                  className="w-full font-bold btn-glow"
                >
                  START MISSION
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full">
              <TacticalLog logs={logs} />
              {playerState === 'won' && (
                <div className="text-center p-4 bg-green-900/40 border border-green-500 rounded-lg animate-pulse w-full max-w-sm">
                  <h2 className="text-2xl font-black text-green-400">VICTORY ACHIEVED</h2>
                </div>
              )}
              {playerState === 'lost' && (
                <div className="text-center p-4 bg-red-900/40 border border-red-500 rounded-lg animate-pulse w-full max-w-sm">
                  <h2 className="text-2xl font-black text-red-500">FLEET DESTROYED</h2>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Hostile Grid (Player Two / Computer) */}
        <div className="flex flex-col items-center gap-4 w-full lg:w-1/3 relative">
          <h3 className="w-full max-w-md text-center px-6 py-3 bg-slate-900/80 border border-red-500/30 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.15)] text-xl font-black text-red-400 uppercase tracking-widest">Hostile Waters</h3>
          <Grid
            id="grid-opponent"
            size={gridSize}
            playerType="opponent"
            hits={computerHits}
            misses={computerMisses}
            sunkCoords={computerSunkCoords}
            fleet={computerShipsVisible}
            onCellClick={(x, y) => playerState === 'playing' && initiatePlayerAttack(x, y)}
            interactive={playerState === 'playing'}
          />
          {playerState === 'placing' && (
            <div className="absolute inset-0 top-[3rem] mt-[22px] z-20 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center rounded-lg border border-slate-800 max-w-md w-full mx-auto aspect-square">
              <span className="text-slate-500 font-bold tracking-widest text-center px-4">DEFEAT ENEMIES<br />AWAITING DEPLOYMENT</span>
            </div>
          )}

          {/* Victory/Defeat messages for mobile inline */}
          <div className="lg:hidden w-full flex flex-col gap-4 mt-4 max-w-md">
            {playerState === 'won' && !showExtraInfo && (
              <div className="text-center p-4 bg-green-900/40 border border-green-500 rounded-lg animate-pulse">
                <h2 className="text-xl font-black text-green-400">VICTORY ACHIEVED</h2>
              </div>
            )}
            {playerState === 'lost' && !showExtraInfo && (
              <div className="text-center p-4 bg-red-900/40 border border-red-500 rounded-lg animate-pulse">
                <h2 className="text-xl font-black text-red-500">FLEET DESTROYED</h2>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
