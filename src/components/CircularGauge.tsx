import React from 'react';

interface CircularGaugeProps {
  value: number; // 0 to 100
  displayValue?: string | number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  glowColor?: string;
  title: string;
  subtitle?: string;
  unit?: string;
  icon?: React.ReactNode;
  warning?: boolean;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  displayValue,
  size = 140,
  strokeWidth = 10,
  color = '#00f0ff',
  glowColor = 'rgba(0, 240, 255, 0.5)',
  title,
  subtitle,
  unit = '%',
  icon,
  warning = false,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  // 270 degree arc gauge for authentic tech HUD look
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center select-none group">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Subtle background glow */}
        <div
          className="absolute inset-2 rounded-full blur-xl opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40"
          style={{ backgroundColor: warning ? '#ff2a85' : color }}
        />

        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <filter id={`gaugeGlow-${title.replace(/\s+/g, '')}`}>
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={glowColor} floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Track background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            className="opacity-40"
          />

          {/* Progress fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={warning ? '#ff2a85' : color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease',
              filter: `url(#gaugeGlow-${title.replace(/\s+/g, '')})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          {icon && <div className="text-slate-400 mb-0.5 transform scale-90">{icon}</div>}
          <div className="flex items-baseline justify-center">
            <span className="font-['Orbitron'] font-bold text-xl md:text-2xl tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              {displayValue !== undefined ? displayValue : Math.round(value)}
            </span>
            {unit && <span className="text-xs font-semibold ml-0.5 text-slate-400">{unit}</span>}
          </div>
          <span className="text-[10px] uppercase font-['Rajdhani'] font-semibold tracking-wider text-slate-400 mt-0.5">
            {title}
          </span>
        </div>
      </div>

      {subtitle && (
        <span className="text-xs font-medium text-slate-300 mt-1.5 text-center px-1">
          {subtitle}
        </span>
      )}
    </div>
  );
};
