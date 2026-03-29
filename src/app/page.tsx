"use client";

import Link from "next/link";
import { Button } from "../components/ui/Button";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-12 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          TACTICAL COMMAND
        </h1>
        <p className="text-xl md:text-2xl text-cyan-200/70 tracking-widest uppercase">
          Advanced Naval Warfare Simulator
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        <Link href="/play/singleplayer" className="w-full">
          <Button variant="primary" size="lg" className="w-full text-xl uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-500/50">
            vs Computer
          </Button>
        </Link>
        
        <Link href="/play/multiplayer" className="w-full">
          <Button variant="secondary" size="lg" className="w-full text-xl uppercase tracking-widest border border-blue-500/50 hover:bg-slate-800 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            Multiplayer
          </Button>
        </Link>
      </div>
    </div>
  );
}
