export const HitIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    {/* Outer Star Shape representing the blast radius */}
    <path fill="#ef4444" d="M50 0 L58 38 L100 50 L58 62 L50 100 L42 62 L0 50 L42 38 Z" />
    {/* Inner Core Pulsing representing intense heat */}
    <circle cx="50" cy="50" r="25" fill="#f97316" className="animate-pulse" />
    {/* Bright center of the explosion */}
    <circle cx="50" cy="50" r="10" fill="#fef08a" />
  </svg>
);
