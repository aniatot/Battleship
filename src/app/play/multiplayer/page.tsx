"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useGameStore } from "../../../store/useGameStore";
import { Grid } from "../../../components/board/Grid";
import { DraggableShip } from "../../../components/board/ShipComponent";
import { TacticalLog } from "../../../components/ui/TacticalLog";
import { Button } from "../../../components/ui/Button";
import { MissileAnim } from "../../../components/ui/MissileAnim";
import { Coordinate } from "../../../types";
import { isFleetSunk } from "../../../utils/gameLogic";
import { QRCodeSVG } from "qrcode.react";
import { useSocket } from '@/hooks/useSocket';
import { Info, X, RotateCcw } from "lucide-react";

export default function MultiplayerGame() {
  const { gridSize, playerShips, rotateShip, placeShip, randomizePlayerShips, resetGame, logs } = useGameStore();
  
  const socket = useSocket();

  // Multi-player State
  const [roomId, setRoomId] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [mpState, setMpState] = useState<'lobby' | 'placing' | 'waiting_opponent_ready' | 'playing' | 'won' | 'lost'>('lobby');
  const [isPlayer2, setIsPlayer2] = useState(false);
  const [myTurn, setMyTurn] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  
  const [opponentHits, setOpponentHits] = useState<Coordinate[]>([]);
  const [opponentMisses, setOpponentMisses] = useState<Coordinate[]>([]);
  const [opponentSunkCoords, setOpponentSunkCoords] = useState<Coordinate[]>([]);
  const [qrUrl, setQrUrl] = useState("");
  const [showExtraInfo, setShowExtraInfo] = useState(false);

  const roomIdRef = useRef("");
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

  const [isClient, setIsClient] = useState(false);
  
  // Initialization & Auto-Join from URL
  useEffect(() => {
    setIsClient(true);
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomInput(roomParam);
    }

    // Determine current URL for QR code 
    const currentHostname = window.location.hostname;
    const currentPort = window.location.port;

    if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
      // Local development - Fetch the LAN IP for QR (so mobile devices can join)
      fetch('/api/ip')
        .then(res => res.json())
        .then(data => {
          const portStr = currentPort ? `:${currentPort}` : '';
          setQrUrl(`http://${data.ip}${portStr}/play/multiplayer`);
        })
        .catch(() => {
          setQrUrl(`${window.location.origin}/play/multiplayer`);
        });
    } else {
      // Cloud/Production - Use current domain
      setQrUrl(`${window.location.origin}/play/multiplayer`);
    }

    resetGame();
    useGameStore.setState({ matchType: 'multiplayer', playerState: 'placing', logs: [] });
  }, [resetGame]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    // Automatic Join if URL parameter is present
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      console.log('Detecting room param from URL, auto-joining...', roomParam);
      socket.emit('join_room', roomParam);
    }

    socket.on('room_created', (id) => {
      setRoomId(id);
      setIsPlayer2(false);
    });

    socket.on('room_joined', ({ roomId: jId, isPlayer2 }) => {
      setRoomId(jId);
      setIsPlayer2(isPlayer2);
      alert(`Successfully joined Room ${jId}!`);
    });

    socket.on('error_message', (msg) => alert(msg));

    socket.on('game_start', () => {
      setMpState('placing');
    });

    socket.on('opponent_ready', () => {
      setOpponentReady(true);
    });

    socket.on('receive_attack', (target: Coordinate) => {
      useGameStore.setState({ pendingAction: { actor: 'opponent', target } });

      const ships = useGameStore.getState().playerShips;
      let hit = false;
      let isSunk = false;
      let sunkTarget: any = null;

      const newShips = ships.map(ship => {
        const isShipHit = ship.coordinates.some(c => c.x === target.x && c.y === target.y);
        if (isShipHit) {
          hit = true;
          const newHits = [...ship.hits, target];
          isSunk = newHits.length === ship.length;
          if (isSunk) sunkTarget = { ...ship, hits: newHits, isSunk };
          return { ...ship, hits: newHits, isSunk };
        }
        return ship;
      });

      setTimeout(() => {
        useGameStore.setState({
          playerShips: newShips,
          playerHits: hit ? [...useGameStore.getState().playerHits, target] : useGameStore.getState().playerHits,
          playerMisses: !hit ? [...useGameStore.getState().playerMisses, target] : useGameStore.getState().playerMisses,
          pendingAction: null
        });

        const attackerName = isPlayer2 ? 'Player 1' : 'Player 2';
        const attackerColor = isPlayer2 ? '#60a5fa' : '#ef4444'; 

        const newLog = {
          turn: Date.now(),
          player: attackerName,
          color: attackerColor,
          target,
          result: isSunk ? 'sunk' : (hit ? 'hit' : 'miss')
        };
        useGameStore.setState({ logs: [...useGameStore.getState().logs, newLog as any] });

        if (isFleetSunk(newShips)) {
          setMpState('lost');
          socket.emit('attack_result', { roomId: roomIdRef.current, target, result: 'game_over' });
        } else {
          socket.emit('attack_result', { roomId: roomIdRef.current, target, result: isSunk ? 'sunk' : (hit ? 'hit' : 'miss'), shipCoords: isSunk ? sunkTarget!.coordinates : null });
          socket.emit('change_turn', { roomId: roomIdRef.current, nextPlayerId: socket.id });
        }
      }, 600);
    });

    socket.on('attack_result_received', ({ target, result, shipCoords }) => {
      setTimeout(() => {
        useGameStore.setState({ pendingAction: null });

        const logRes = result === 'game_over' ? 'sunk' : result;
        const playerName = isPlayer2 ? 'Player 2' : 'Player 1';
        const playerColor = isPlayer2 ? '#ef4444' : '#60a5fa';

        const newLog = {
          turn: Date.now(),
          player: playerName,
          color: playerColor,
          target,
          result: logRes
        };
        useGameStore.setState({ logs: [...useGameStore.getState().logs, newLog as any] });

        if (result === 'game_over') {
          setOpponentHits(prev => [...prev, target]);
          if (shipCoords) setOpponentSunkCoords(prev => [...prev, ...shipCoords]);
          setMpState('won');
        } else if (result === 'hit') {
          setOpponentHits(prev => [...prev, target]);
        } else if (result === 'sunk') {
          setOpponentHits(prev => [...prev, target]);
          if (shipCoords) setOpponentSunkCoords(prev => [...prev, ...shipCoords]);
        } else {
          setOpponentMisses(prev => [...prev, target]);
        }
      }, 600);
    });

    socket.on('turn_changed', (nextPlayerId) => {
      setMyTurn(socket.id === nextPlayerId);
    });

    socket.on('opponent_disconnected', () => {
      alert("Opponent disconnected!");
      window.location.href = '/';
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('error_message');
      socket.off('game_start');
      socket.off('opponent_ready');
      socket.off('receive_attack');
      socket.off('attack_result_received');
      socket.off('turn_changed');
      socket.off('opponent_disconnected');
    };
  }, [socket, resetGame, isPlayer2]);

  useEffect(() => {
    if (mpState === 'waiting_opponent_ready' && opponentReady) {
      setMpState('playing');
    }
  }, [mpState, opponentReady]);

  const handleCreateRoom = () => socket?.emit('create_room');
  const handleJoinRoom = () => roomInput.trim() && socket?.emit('join_room', roomInput.trim());

  const handleReady = () => {
    setMpState('waiting_opponent_ready');
    socket?.emit('ships_ready', roomId);
    if (!isPlayer2) setMyTurn(true);
  };

  const handleAttack = (x: number, y: number) => {
    if (!myTurn || mpState !== 'playing') return;
    const hasAttacked = opponentHits.some(c => c.x === x && c.y === y) || opponentMisses.some(c => c.x === x && c.y === y);
    if (hasAttacked) return;

    useGameStore.setState({ pendingAction: { actor: 'player', target: { x, y } } });
    socket?.emit('attack', { roomId, target: { x, y } });
    setMyTurn(false);
  };

  if (!isClient) return null;

  // LOBBY RENDERING
  if (mpState === 'lobby') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-12 p-4 max-w-[1600px] mx-auto w-full">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-cyan-400 uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Multiplayer Lobby</h1>

        <div className="w-full max-w-md bg-slate-900/80 p-8 rounded-xl border border-cyan-800 shadow-[0_0_30px_rgba(8,145,178,0.2)] flex flex-col gap-6">
          {roomId ? (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-slate-200">Room Created!</h2>
              <div className="space-y-2">
                <p className="text-slate-400">Share this Room ID with your opponent:</p>
                <div className="text-4xl font-mono text-cyan-400 tracking-[0.5em] bg-slate-950 py-4 rounded border border-cyan-800/50">{roomId}</div>
              </div>
              
              {qrUrl && (
                <div className="flex flex-col items-center justify-center pt-6 mt-4 border-t border-slate-700/50">
                  <span className="text-slate-400 mb-4 uppercase tracking-widest text-sm text-center font-bold">
                    Scan to Join This Room
                  </span>
                  <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <QRCodeSVG 
                      value={`${qrUrl}?room=${roomId}`} 
                      size={180} 
                      level={"H"}
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center max-w-[240px]">
                    Ensure your mobile is on the same Wi-Fi. Scanning joins Room {roomId} automatically.
                  </p>
                </div>
              )}

              <p className="text-sm text-yellow-500 animate-pulse uppercase tracking-widest mt-4">Waiting for opponent to join...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <Button variant="primary" size="lg" className="w-full" onClick={handleCreateRoom}>
                CREATE NEW ROOM
              </Button>
              <div className="h-px bg-slate-700 w-full relative">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 text-slate-500 uppercase font-bold text-sm">OR</span>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => {
                    const numericVal = e.target.value.replace(/\D/g, '');
                    setRoomInput(numericVal);
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="ENTER ROOM ID"
                  className="w-full bg-slate-950 border border-slate-700 rounded-md h-12 px-4 text-center font-mono text-2xl text-cyan-300 focus:outline-none focus:border-cyan-500"
                  maxLength={6}
                />
                <Button variant="secondary" size="lg" disabled={!roomInput} onClick={handleJoinRoom}>
                  JOIN ROOM
                </Button>
              </div>
            </div>
          )}

          <Link href="/" className="w-full mt-4">
            <Button variant="ghost" className="w-full border border-slate-700">Return to Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { playerHits, playerMisses } = useGameStore.getState();
  const playerSunkCoords = playerShips.filter(s => s.isSunk).flatMap(s => s.coordinates);

  const handleDragStart = (id: string, e: React.DragEvent) => e.dataTransfer.setData("shipId", id);
  const handleCellDrop = (x: number, y: number, e: React.DragEvent) => {
    const shipId = e.dataTransfer.getData("shipId");
    if (shipId) placeShip(shipId, x, y);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full relative">
      <MissileAnim />
      
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setShowExtraInfo(!showExtraInfo)}
        className="lg:hidden fixed top-4 right-4 z-[110] w-12 h-12 rounded-full bg-cyan-600/90 text-white flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.5)] border border-cyan-400/50 backdrop-blur-sm"
      >
        {showExtraInfo ? <X className="w-6 h-6" /> : <Info className="w-6 h-6" />}
      </button>

      <div className={`${showExtraInfo ? 'flex' : 'hidden'} lg:flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-cyan-800 shadow-[0_0_20px_rgba(8,145,178,0.3)] z-[105]`}>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="danger" size="sm" onClick={resetGame}>Abandon Game</Button>
          </Link>
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-black text-cyan-400 tracking-widest uppercase">Multiplayer Match</h2>
            <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">Room: {roomId}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-lg font-bold uppercase tracking-widest text-slate-300">
            {mpState === 'placing' && <span className="text-yellow-500 animate-pulse text-sm">DEPLOY YOUR FLEET</span>}
            {mpState === 'waiting_opponent_ready' && <span className="text-slate-400 text-sm">WAITING ON OPPONENT...</span>}
            {mpState === 'playing' && (myTurn ? <span className="text-cyan-300 animate-pulse text-sm">YOUR TURN</span> : <span className="text-red-500 text-sm">ENEMY TURN</span>)}
            {mpState === 'won' && <span className="text-green-500 text-sm">VICTORY</span>}
            {mpState === 'lost' && <span className="text-red-500 text-sm">DEFEAT</span>}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center w-full">

        <div className="flex flex-col items-center gap-4 w-full lg:w-1/3">
          <h3 className="text-xl font-bold text-cyan-500 uppercase tracking-widest">Commander Fleet</h3>
          <Grid
            id="grid-player"
            size={gridSize}
            playerType="player"
            hits={playerHits}
            misses={playerMisses}
            sunkCoords={playerSunkCoords}
            fleet={playerShips}
            onCellDrop={mpState === 'placing' ? handleCellDrop : undefined}
            interactive={mpState === 'placing'}
            isPlacingPhase={mpState === 'placing'}
            onShipDragStart={handleDragStart}
            onShipRotate={rotateShip}
          />
        </div>

        <div className={`${mpState === 'placing' || showExtraInfo ? 'flex' : 'hidden'} lg:flex flex-col items-center gap-6 w-full lg:w-1/3 lg:pt-10`}>
          {mpState === 'placing' ? (
            <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col gap-6 shadow-lg max-w-md">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wider">Naval Dockyard</h3>
              </div>
              <div className="relative flex flex-wrap gap-4 justify-center items-center p-4 bg-slate-950 rounded-lg min-h-[160px]">
                {playerShips.map(ship => (
                  <DraggableShip key={ship.id} ship={ship} onDragStart={handleDragStart} onRotate={rotateShip} cellWidth={30} />
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={randomizePlayerShips} className="flex-1">Randomize</Button>
                  <Button variant="ghost" onClick={resetGame} className="flex-1 border border-slate-700 hover:bg-slate-800 text-slate-300 gap-2">
                    <RotateCcw className="text-slate-400 group-hover:text-cyan-400 w-4 h-4 transition-colors" /> Reset
                  </Button>
                </div>
                <Button variant="primary" disabled={!playerShips.every(s => s.isPlaced)} onClick={handleReady} className="w-full font-bold btn-glow">READY FOR COMBAT</Button>
              </div>
            </div>
          ) : (
            <TacticalLog logs={logs} />
          )}
        </div>

        <div className="flex flex-col items-center gap-4 w-full lg:w-1/3 relative">
          <h3 className="text-xl font-bold text-red-500/80 uppercase tracking-widest">Hostile Waters</h3>
          <Grid
            id="grid-opponent"
            size={gridSize}
            playerType="opponent"
            hits={opponentHits}
            misses={opponentMisses}
            sunkCoords={opponentSunkCoords}
            fleet={undefined}
            onCellClick={handleAttack}
            interactive={mpState === 'playing' && myTurn}
          />
        </div>
      </div>
    </div>
  );
}
