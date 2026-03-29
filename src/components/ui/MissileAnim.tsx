"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';

export const MissileAnim = () => {
  const { pendingAction, resolveAttack } = useGameStore();
  const [coords, setCoords] = useState<{ start: {x:number,y:number}, end: {x:number,y:number} } | null>(null);

  useEffect(() => {
    if (pendingAction) {
      requestAnimationFrame(() => {
        const isPlayer = pendingAction.actor === 'player';
        
        const originType = isPlayer ? 'player' : 'opponent';
        const targetType = isPlayer ? 'opponent' : 'player';

        const e5El = document.getElementById(`cell-${originType}-4-4`);
        const f6El = document.getElementById(`cell-${originType}-5-5`);
        const targetEl = document.getElementById(`cell-${targetType}-${pendingAction.target.x}-${pendingAction.target.y}`);
        
        if (e5El && f6El && targetEl) {
          const e5Rect = e5El.getBoundingClientRect();
          const f6Rect = f6El.getBoundingClientRect();
          const tRect = targetEl.getBoundingClientRect();
          
          const startX = (e5Rect.right + f6Rect.left) / 2;
          const startY = (e5Rect.bottom + f6Rect.top) / 2;
          
          setCoords({
            start: { x: startX, y: Math.max(0, startY) },
            end: { x: tRect.left + tRect.width / 2, y: tRect.top + tRect.height / 2 }
          });
        } else {
          const gridEl = document.getElementById(`grid-${originType}`);
          if (gridEl && targetEl) {
            const gRect = gridEl.getBoundingClientRect();
            const tRect = targetEl.getBoundingClientRect();
            setCoords({
              start: { x: gRect.left + gRect.width / 2, y: gRect.top + gRect.height / 2 },
              end: { x: tRect.left + tRect.width / 2, y: tRect.top + tRect.height / 2 }
            });
          } else {
            resolveAttack();
          }
        }
      });
    } else {
      setCoords(null);
    }
  }, [pendingAction, resolveAttack]);

  if (!pendingAction || !coords) return null;

  const dx = coords.end.x - coords.start.x;
  const dy = coords.end.y - coords.start.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

  return (
    <motion.div
      initial={{ x: coords.start.x, y: coords.start.y, scale: 0.4, opacity: 0 }}
      animate={{ x: coords.end.x, y: coords.end.y, scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeIn" }}
      onAnimationComplete={() => {
        setCoords(null);
        setTimeout(resolveAttack, 50);
      }}
      className="fixed top-0 left-0 z-[100] pointer-events-none"
      style={{
        width: '30px',
        height: '60px',
        marginLeft: '-15px',
        marginTop: '-30px',
        rotate: `${angle}deg`,
        transformOrigin: "center center"
      }}
    >
      <svg width="30" height="60" viewBox="0 0 30 60" className="drop-shadow-[0_0_15px_#f97316]">
        <motion.path 
          animate={{ scaleY: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }} 
          transition={{ repeat: Infinity, duration: 0.15 }}
          fill="#f97316" d="M10 50 Q15 70 20 50 Z" 
          style={{ transformOrigin: "top" }}
        />
        <rect x="10" y="20" width="10" height="30" fill="#cbd5e1" />
        <path fill="#ef4444" d="M10 20 L15 0 L20 20 Z" />
        <path fill="#94a3b8" d="M5 40 L10 30 L10 50 Z" />
        <path fill="#94a3b8" d="M25 40 L20 30 L20 50 Z" />
      </svg>
    </motion.div>
  );
};
