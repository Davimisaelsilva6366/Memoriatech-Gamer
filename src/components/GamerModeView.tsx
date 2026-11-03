import React, { useState } from 'react';
import { HardwareState, ThemeConfig, InstalledApp } from '../types';
import { calculateGameModeStability, formatBytes } from '../utils/metrics';
import { CircularGauge } from './CircularGauge';
import {
  Gamepad2,
  Zap,
  Flame,
  ShieldAlert,
  Crosshair,
  Sparkles,
  BellOff,
  Sliders,
  CheckCircle2,
  Play,
  RotateCcw,
  Activity,
  Layers,
  Thermometer,
  ShieldCheck,
  Power,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface GamerModeViewProps {
  hardware: HardwareState;
  installedApps: InstalledApp[];
  theme: ThemeConfig;
  isGamerModeActive: boolean;
  onToggleGamerMode: () => void;
  onOptimizeRam: () => void;
}

export const GamerModeView: React.FC<GamerModeViewProps> = ({
  hardware,
  installedApps,
  theme,
  isGamerModeActive,
  onToggleGamerMode,
  onOptimizeRam,
}) => {
  const [selectedFpsTarget, setSelectedFpsTarget] = useState<number>(120);
  const [dndEnabled, setDndEnabled] = useState(true);
  const [boostAnimating, setBoostAnimating] = useState(false);
  const [activeGameLaunch, setActiveGameLaunch] = useState<string | null>(null);

  const games = installedApps.filter((app) => app.isGame);
  const backgroundApps = installedApps.filter((app) => !app.isGame && app.isRunningBackground);

  const stability = calculateGameModeStability(
    hardware.cpuUsagePct,
    hardware.ramUsagePct,
    hardware.cpuTempC
  );

  const handleTriggerBoost = () => {
    soundFx.playGamerBoost();
    setBoostAnimating(true);
    setTimeout(() => {
      onToggleGamerMode();
      setBoostAnimating(false);
      if (!isGamerModeActive) {
        onOptimizeRam();
      }
    }, 700);
  };

  const handleLaunchGame = (gameName: string) => {
    soundFx.playGamerBoost();
    setActiveGameLaunch(gameName);
    if (!isGamerModeActive) {
      onToggleGamerMode();
    }
    setTimeout(() => {
      setActiveGameLaunch(null);
    }, 3500);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Gamer Header Banner */}
      <div className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-500 shadow-2xl ${
        isGamerModeActive
          ? 'bg-gradient-to-r from-red-950/80 via-black to-pink-950/80 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.25)]'
          : 'bg-gradient-to-r from-slate-900 via-[#0b1329] to-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl border transition-all ${
              isGamerModeActive
                ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_#ef4444]'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}>
              <Gamepad2 size={28} />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isGamerModeActive ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
                <span className="text-[11px] font-['Orbitron'] font-bold tracking-widest uppercase" style={{
                  color: isGamerModeActive ? '#ff2a85' : '#94a3b8'
                }}>
                  {isGamerModeActive ? 'PREFERÊNCIA GAMER ATIVA NESTE APP' : 'MODO GAMER EM ESPERA'}
                </span>
              </div>
              <h2 className="text-xl font-['Orbitron'] font-black text-white tracking-wider mt-0.5">
                CYBER GAMING ACCELERATOR
              </h2>
              <p className="text-xs text-slate-400">
                Atalhos e preferências visuais; não altera configurações do Android
              </p>
            </div>
          </div>

          {/* MAIN INICIAR MODO GAMER BUTTON */}
          <button
            onClick={handleTriggerBoost}
            disabled={boostAnimating}
            aria-label={isGamerModeActive ? 'Desativar Modo Gamer' : 'Iniciar Modo Gamer'}
            className={`relative px-8 py-3.5 rounded-2xl font-['Orbitron'] font-extrabold text-sm tracking-wider uppercase transition-all duration-300 active:scale-95 flex items-center gap-2.5 shadow-2xl ${
              isGamerModeActive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] border border-red-400'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black shadow-[0_0_25px_rgba(0,240,255,0.4)]'
            }`}
          >
            <Power size={18} className={boostAnimating ? 'animate-spin' : ''} />
            <span>{isGamerModeActive ? 'DESATIVAR MODO GAMER' : 'INICIAR MODO GAMER'}</span>
          </button>
        </div>

        {/* Pulse aura effect when active */}
        {isGamerModeActive && (
          <div className="absolute inset-0 border-2 border-red-500/40 rounded-2xl pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Game Launch Modal Banner */}
      {activeGameLaunch && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-['Orbitron'] flex items-center justify-between shadow-2xl animate-bounce">
          <div className="flex items-center gap-3">
            <Flame size={24} className="animate-pulse" />
            <div>
              <div className="text-xs uppercase tracking-widest font-bold">Atalho visual — abertura nativa não disponível</div>
              <div className="text-base font-black">{activeGameLaunch}</div>
            </div>
          </div>
          <span className="text-xs font-mono bg-black/40 px-3 py-1 rounded-full border border-white/20">
            Preferência de FPS: {selectedFpsTarget}Hz
          </span>
        </div>
      )}

      {/* Real-time Gamer Telemetry HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Stability Index */}
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-['Rajdhani'] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Activity size={14} className="text-cyan-400" />
              ÍNDICE DE ESTABILIDADE
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              stability.status === 'ÓTIMA'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {stability.status}
            </span>
          </div>

          <div className="flex justify-center my-1">
            <CircularGauge
              value={stability.stabilityPct}
              size={110}
              strokeWidth={8}
              color={stability.status === 'ÓTIMA' ? '#00f0ff' : '#fbbf24'}
              glowColor={stability.status === 'ÓTIMA' ? 'rgba(0, 240, 255, 0.5)' : 'rgba(251, 191, 36, 0.5)'}
              title="ESTABILIDADE"
            />
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-1">
            {stability.recommendation}
          </p>
        </div>

        {/* Dynamic RAM Headroom */}
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-['Rajdhani'] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Layers size={14} className="text-purple-400" />
              RESERVA DE MEMÓRIA (HEADROOM)
            </span>
            <span className="text-[10px] font-mono text-purple-400">
              {formatBytes(hardware.availableRamMb * 1024 * 1024)} LIVRES
            </span>
          </div>

          <div className="flex justify-center my-1">
            <CircularGauge
              value={100 - hardware.ramUsagePct}
              size={110}
              strokeWidth={8}
              color="#a855f7"
              glowColor="rgba(168, 85, 247, 0.5)"
              title="FOLGA RAM"
            />
          </div>

          <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>Para jogos pesados:</span>
            <strong className="text-white">&gt; 3.0 GB recomendado</strong>
          </div>
        </div>

        {/* Thermal Throttling Guard */}
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-['Rajdhani'] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Thermometer size={14} className="text-pink-400" />
              PROTEÇÃO TÉRMICA
            </span>
            <span className="text-[10px] font-mono text-pink-400">
              N/D
            </span>
          </div>

          <div className="flex justify-center my-1">
            <CircularGauge
              value={Math.min(100, (hardware.cpuTempC / 65) * 100)}
              size={110}
              strokeWidth={8}
              color="#ff2a85"
              glowColor="rgba(255, 42, 133, 0.5)"
              title="TEMPERATURA"
              unit="°C"
            />
          </div>

          <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>Estrangulamento (Throttling):</span>
            <strong className={hardware.cpuTempC > 45 ? 'text-red-400' : 'text-emerald-400'}>
              {hardware.cpuTempC > 45 ? 'ALERTA DE QUEDA DE FPS' : 'Temperatura não disponível'}
            </strong>
          </div>
        </div>
      </div>

      {/* Target FPS Selector & Gaming Toggles */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-['Orbitron'] text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders size={15} className="text-cyan-400" />
            CONFIGURAÇÕES DE DESEMPENHO EM JOGO
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">TELA: 120Hz AMOLED</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* FPS Target buttons */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-300 block mb-2 font-['Rajdhani'] uppercase">
              Taxa de Quadros Alvo (Taxa de Atualização da Tela)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[60, 90, 120].map((fps) => (
                <button
                  key={fps}
                  onClick={() => {
                    setSelectedFpsTarget(fps);
                    soundFx.playClick();
                  }}
                  className={`py-2 rounded-lg font-['Orbitron'] text-xs font-bold transition-all ${
                    selectedFpsTarget === fps
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {fps} FPS
                </button>
              ))}
            </div>
          </div>

          {/* DND Gaming Mode Switch */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <BellOff size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Modo Não Perturbe (DND)</span>
                <span className="text-[10px] text-slate-400">Bloqueia notificações e chamadas durante o jogo</span>
              </div>
            </div>

            <button
              onClick={() => {
                setDndEnabled(!dndEnabled);
                soundFx.playClick();
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                dndEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  dndEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Game Library: One-Click Launch with Boost */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-red-500" />
            <h3 className="font-['Orbitron'] text-xs font-bold text-white uppercase tracking-wider">
              BIBLIOTECA DE JOGOS INSTALADOS
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{games.length} Jogos Detectados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {games.map((game) => (
            <div
              key={game.id}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                    <Crosshair size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{game.name}</h4>
                    <span className="text-[9px] text-slate-400 font-mono">{game.sizeMb} MB instalado</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">{game.packageName}</p>
              </div>

              <button
                onClick={() => handleLaunchGame(game.name)}
                className="mt-3 w-full py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-['Orbitron'] font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Play size={12} fill="currentColor" />
                <span>LANÇAR COM BOOST</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Background Apps Suppressor */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-['Orbitron'] text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers size={15} className="text-purple-400" />
            PROCESSOS EM SEGUNDO PLANO
          </h3>
          <span className="text-[10px] text-slate-400">Identificação segura sem encerramento forçado não-autorizado</span>
        </div>

        <div className="space-y-2">
          {backgroundApps.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
            >
              <div>
                <span className="font-bold text-white">{app.name}</span>
                <span className="text-[10px] text-slate-400 font-mono ml-2">({app.ramUsageMb} MB RAM)</span>
              </div>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Suspensão em Jogo
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Honest Gamer Guidance */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Modo Gamer local:</strong> O Memóriatech Gamer guarda preferências dentro do aplicativo. Não altera RAM, FPS, processos, notificações ou desempenho do Android. Não realizamos overclock ou promessas irreais que danifiquem o hardware do seu smartphone.
        </p>
      </div>
    </div>
  );
};
