import React from 'react';
import { AppLogo } from './AppLogo';
import { ThemeConfig } from '../types';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Maximize2,
  BatteryCharging,
  Battery,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface CyberHeaderProps {
  theme: ThemeConfig;
  batteryLevel: number;
  isCharging: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onQuickThemeClick: () => void;
  isGamerModeActive: boolean;
}

export const CyberHeader: React.FC<CyberHeaderProps> = ({
  theme,
  batteryLevel,
  isCharging,
  soundEnabled,
  onToggleSound,
  isPhoneFrame,
  onTogglePhoneFrame,
  onQuickThemeClick,
  isGamerModeActive,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05070f]/90 border-b border-slate-800/80 px-4 py-2.5 transition-all">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {/* Left: Brand & Logo */}
        <div className="flex items-center gap-3">
          <AppLogo size={42} glowColor={isGamerModeActive ? '#ff2a85' : theme.accent} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Orbitron'] font-bold text-base sm:text-lg tracking-wider text-white flex items-center gap-1.5">
                <span>MEMÓRIA</span>
                <span style={{ color: isGamerModeActive ? '#ff2a85' : theme.accent }}>TECH</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/40 tracking-widest">
                  GAMER
                </span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] font-['Rajdhani'] font-medium text-slate-400 tracking-wide line-clamp-1">
              Sua memória, seu desempenho, seu controle
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Gamer Mode Active Pulse Indicator */}
          {isGamerModeActive && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-['Orbitron'] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <span>BOOST ATIVO</span>
            </div>
          )}

          {/* Real-time Battery Status */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
            {isCharging ? (
              <BatteryCharging size={14} className="text-emerald-400 animate-pulse" />
            ) : (
              <Battery size={14} className={batteryLevel < 20 ? 'text-red-400' : 'text-cyan-400'} />
            )}
            <span>{batteryLevel}%</span>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundFx.playClick();
            }}
            title={soundEnabled ? 'Desativar Sons Cibernéticos' : 'Ativar Sons Cibernéticos'}
            aria-label={soundEnabled ? 'Silenciar som' : 'Ativar som'}
            className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-slate-500" />}
          </button>

          {/* Quick Theme Switcher Button */}
          <button
            onClick={() => {
              onQuickThemeClick();
              soundFx.playClick();
            }}
            title="Trocar Cor Neon"
            aria-label="Trocar Cor Neon"
            className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors group relative"
          >
            <Sparkles size={16} style={{ color: theme.accent }} className="group-hover:rotate-45 transition-transform" />
          </button>

          {/* Phone Frame Mockup Toggle */}
          <button
            onClick={() => {
              onTogglePhoneFrame();
              soundFx.playClick();
            }}
            title={isPhoneFrame ? 'Expandir para Tela Cheia' : 'Visualizar no Mockup Android'}
            aria-label="Alternar modo moldura de celular"
            className="hidden sm:flex p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            {isPhoneFrame ? <Maximize2 size={16} /> : <Smartphone size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
