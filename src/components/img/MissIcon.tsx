export const MissIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    {/* Base water splash wave shape */}
    <path fill="#ffffff" opacity="0.7" d="M50 10 Q65 50 80 70 Q90 90 50 95 Q10 90 20 70 Q35 50 50 10 Z" />
    {/* Additional splash droplets flying outward */}
    <circle cx="30" cy="45" r="8" fill="#e0f2fe" opacity="0.8" />
    <circle cx="70" cy="55" r="6" fill="#e0f2fe" opacity="0.8" />
  </svg>
);
