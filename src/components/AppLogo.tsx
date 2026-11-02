import React from 'react';

interface AppLogoProps {
  size?: number;
  glowColor?: string;
  animate?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 44,
  glowColor = '#00f0ff',
  animate = true,
}) => {
  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Background radial glow */}
      {animate && (
        <div
          className="absolute inset-0 rounded-2xl blur-md opacity-75 animate-pulse"
          style={{ backgroundColor: glowColor }}
        />
      )}

      {/* Main SVG Chip Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
      >
        <defs>
          <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b1329" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          <linearGradient id="neonCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <linearGradient id="goldTraces" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hexagon/Octagon Cyber Shield */}
        <path
          d="M20 8 H80 L92 20 V80 L80 92 H20 L8 80 V20 Z"
          fill="url(#chipGrad)"
          stroke={glowColor}
          strokeWidth="2.5"
          filter="url(#glowFilter)"
        />

        {/* External Connector Pins (RAM Golden Contacts / Bus pins) */}
        {/* Top Pins */}
        <line x1="32" y1="3" x2="32" y2="8" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="44" y1="3" x2="44" y2="8" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="56" y1="3" x2="56" y2="8" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="68" y1="3" x2="68" y2="8" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />

        {/* Bottom Pins */}
        <line x1="32" y1="92" x2="32" y2="97" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="44" y1="92" x2="44" y2="97" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="56" y1="92" x2="56" y2="97" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="68" y1="92" x2="68" y2="97" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />

        {/* Left Pins */}
        <line x1="3" y1="35" x2="8" y2="35" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="3" y1="50" x2="8" y2="50" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="3" y1="65" x2="8" y2="65" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />

        {/* Right Pins */}
        <line x1="92" y1="35" x2="97" y2="35" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="92" y1="50" x2="97" y2="50" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="92" y1="65" x2="97" y2="65" stroke="url(#goldTraces)" strokeWidth="2.2" strokeLinecap="round" />

        {/* Circuit Traces */}
        <path
          d="M24 24 L34 24 L42 32 H58 L66 24 H76"
          stroke={glowColor}
          strokeWidth="1.4"
          strokeOpacity="0.75"
        />
        <circle cx="24" cy="24" r="2" fill={glowColor} />
        <circle cx="76" cy="24" r="2" fill={glowColor} />

        <path
          d="M24 76 L36 76 L44 68 H56 L64 76 H76"
          stroke={glowColor}
          strokeWidth="1.4"
          strokeOpacity="0.75"
        />
        <circle cx="24" cy="76" r="2" fill={glowColor} />
        <circle cx="76" cy="76" r="2" fill={glowColor} />

        {/* Central Core Die / RAM Processor */}
        <rect
          x="30"
          y="30"
          width="40"
          height="40"
          rx="6"
          fill="#060b18"
          stroke="url(#neonCyanGrad)"
          strokeWidth="2"
        />

        {/* RAM Modules Grid (4 Memory Blocks inside silicon die) */}
        <rect x="35" y="35" width="13" height="12" rx="2" fill="#00f0ff" fillOpacity="0.25" stroke="#00f0ff" strokeWidth="1" />
        <rect x="52" y="35" width="13" height="12" rx="2" fill="#a855f7" fillOpacity="0.25" stroke="#a855f7" strokeWidth="1" />
        <rect x="35" y="52" width="13" height="12" rx="2" fill="#a855f7" fillOpacity="0.25" stroke="#a855f7" strokeWidth="1" />
        <rect x="52" y="52" width="13" height="12" rx="2" fill="#ff2a85" fillOpacity="0.25" stroke="#ff2a85" strokeWidth="1" />

        {/* Center "M" stylized gamer lightning / memory rune */}
        <path
          d="M44 42 L48 56 L50 49 L52 56 L56 42"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cyber corner brackets */}
        <path d="M12 28 V16 H24" stroke={glowColor} strokeWidth="1.5" />
        <path d="M76 16 H88 V28" stroke={glowColor} strokeWidth="1.5" />
        <path d="M12 72 V84 H24" stroke={glowColor} strokeWidth="1.5" />
        <path d="M76 84 H88 V72" stroke={glowColor} strokeWidth="1.5" />
      </svg>
    </div>
  );
};
