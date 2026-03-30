"use client";

import { motion } from 'framer-motion';

export const MissileIcon = ({ className = "" }: { className?: string }) => (
  <svg width="30" height="60" viewBox="0 0 30 60" className={className}>
    {/* Animated thruster flame giving a realistic trailing fire effect */}
    <motion.path 
      animate={{ scaleY: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }} 
      transition={{ repeat: Infinity, duration: 0.15 }}
      fill="#f97316" d="M10 50 Q15 70 20 50 Z" 
      style={{ transformOrigin: "top" }}
    />
    {/* Main metallic missile fuselage body */}
    <rect x="10" y="20" width="10" height="30" fill="#cbd5e1" />
    {/* Red high-explosive warhead tip for visual impact */}
    <path fill="#ef4444" d="M10 20 L15 0 L20 20 Z" />
    {/* Left stabilizing fin */}
    <path fill="#94a3b8" d="M5 40 L10 30 L10 50 Z" />
    {/* Right stabilizing fin */}
    <path fill="#94a3b8" d="M25 40 L20 30 L20 50 Z" />
  </svg>
);
