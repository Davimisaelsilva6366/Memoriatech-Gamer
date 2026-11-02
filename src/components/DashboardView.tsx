import React, { useState } from 'react';
import { HardwareState, NetworkState, StorageState, ThemeConfig, TabType } from '../types';
import { CircularGauge } from './CircularGauge';
import {
  formatBytes,
  calculateMemoryHealth,
  classifyThermalState,
} from '../utils/metrics';
import {
  Zap,
  Cpu,
  Trash2,
  Gamepad2,
  Wifi,
  Clock,
  Thermometer,
  HardDrive,
  Activity,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface DashboardViewProps {
  hardware: HardwareState;
  network: NetworkState;
  storage: StorageState;
  theme: ThemeConfig;
  uptimeSeconds: number;
  onNavigate: (tab: TabType) => void;
  onOptimizeRam: () => void;
  isGamerModeActive: boolean;
  isPhoneFrame?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  hardware,
  network,
  storage,
  theme,
  uptimeSeconds,
  onNavigate,
  onOptimizeRam,
  isGamerModeActive,
  isPhoneFrame = false,
}) => {
  const [ramOptimizedSuccess, setRamOptimizedSuccess] = useState(false);

  const ramHealth = calculateMemoryHealth(hardware.ramUsagePct);
  const thermalState = classifyThermalState(hardware.cpuTempC);

  // Format uptime HH:MM:SS
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleQuickOptimize = () => {
    soundFx.playGamerBoost();
    onOptimizeRam();
    setRamOptimizedSuccess(true);
    setTimeout(() => setRamOptimizedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Top Banner: Slogan & Quick Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#0b1329] to-slate-900 border border-slate-800 p-4 shadow-xl">
        <div
          className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: theme.accent }}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="text-xs uppercase font-['Rajdhani'] font-bold tracking-widest text-emerald-400">
                SISTEMA OPERACIONAL ESTÁVEL
              </span>
            </div>
            <h2 className="text-lg font-['Orbitron'] font-bold text-white mt-0.5">
              PAINEL DE TELEMETRIA
            </h2>
            <p className="text-xs text-slate-400">
              Sua memória, seu desempenho, seu controle.
            </p>
          </div>

          {/* Device Uptime Chip */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400">
            <Clock size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>UPTIME: {uptimeString}</span>
          </div>
        </div>
      </div>

      {/* Main Performance Gauges Grid (RAM, CPU, Armazenamento, Temperatura) */}
      <div className={`grid gap-3 ${isPhoneFrame ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {/* RAM Gauge Card */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-3 flex flex-col items-center justify-between hover:border-slate-700 transition-all shadow-lg relative overflow-hidden group">
          <div className="w-full flex items-center justify-between text-[11px] font-['Rajdhani'] font-semibold text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Layers size={13} style={{ color: theme.accent }} />
              RAM
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold border"
              style={{
                borderColor: `${ramHealth.color}40`,
                backgroundColor: `${ramHealth.color}15`,
                color: ramHealth.color,
              }}
            >
              {ramHealth.status}
            </span>
          </div>

          <CircularGauge
            value={hardware.ramUsagePct}
            size={110}
            strokeWidth={8}
            color={ramHealth.color}
            glowColor={ramHealth.color}
            title="EM USO"
          />

          <div className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Usada: {(hardware.usedRamMb / 1024).toFixed(1)}GB</span>
            <span>Total: {(hardware.totalRamMb / 1024).toFixed(0)}GB</span>
          </div>
        </div>

        {/* CPU Gauge Card */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-3 flex flex-col items-center justify-between hover:border-slate-700 transition-all shadow-lg relative overflow-hidden group">
          <div className="w-full flex items-center justify-between text-[11px] font-['Rajdhani'] font-semibold text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Cpu size={13} className="text-cyan-400" />
              PROCESSADOR
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{hardware.coreCount} NÚCLEOS</span>
          </div>

          <CircularGauge
            value={hardware.cpuUsagePct}
            size={110}
            strokeWidth={8}
            color={theme.accent}
            glowColor={theme.glow}
            title="CPU LOAD"
          />

          <div className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Freq: {hardware.cpuFrequencyGhz} GHz</span>
            <span className="text-emerald-400">Normal</span>
          </div>
        </div>

        {/* Armazenamento Card */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-3 flex flex-col items-center justify-between hover:border-slate-700 transition-all shadow-lg relative overflow-hidden group">
          <div className="w-full flex items-center justify-between text-[11px] font-['Rajdhani'] font-semibold text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <HardDrive size={13} className="text-purple-400" />
              ARMAZENAMENTO
            </span>
            <span className="text-[9px] text-purple-400 font-mono">INTERNO</span>
          </div>

          <CircularGauge
            value={storage.usedPercentage}
            size={110}
            strokeWidth={8}
            color="#a855f7"
            glowColor="rgba(168, 85, 247, 0.4)"
            title="OCUPADO"
          />

          <div className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Livre: {formatBytes(storage.availableBytes, 0)}</span>
            <span>{formatBytes(storage.totalBytes, 0)}</span>
          </div>
        </div>

        {/* Temperatura Card */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-3 flex flex-col items-center justify-between hover:border-slate-700 transition-all shadow-lg relative overflow-hidden group">
          <div className="w-full flex items-center justify-between text-[11px] font-['Rajdhani'] font-semibold text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Thermometer size={13} style={{ color: thermalState.color }} />
              TÉRMICO
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold border"
              style={{
                borderColor: `${thermalState.color}40`,
                backgroundColor: `${thermalState.color}15`,
                color: thermalState.color,
              }}
            >
              {thermalState.status}
            </span>
          </div>

          <CircularGauge
            value={Math.min(100, (hardware.cpuTempC / 75) * 100)}
            displayValue={hardware.cpuTempC.toFixed(1)}
            size={110}
            strokeWidth={8}
            color={thermalState.color}
            glowColor={thermalState.color}
            title="TEMPERATURA"
            unit="°C"
            warning={thermalState.alert}
          />

          <div className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Bateria: {hardware.batteryTempC.toFixed(1)}°C</span>
            <span className="text-slate-500">SoC: {hardware.socTempC}°C</span>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={handleQuickOptimize}
          disabled={hardware.isRamOptimizing}
          aria-label="Otimizar Memória RAM agora"
          className="relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all active:scale-95 group shadow-md"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Zap size={18} />
            </div>
            {ramOptimizedSuccess && <CheckCircle2 size={16} className="text-emerald-400 animate-bounce" />}
          </div>
          <div className="font-['Orbitron'] font-bold text-xs text-white">
            {hardware.isRamOptimizing ? 'OTIMIZANDO...' : 'OTIMIZAR RAM'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {ramOptimizedSuccess ? 'Memória liberada com sucesso!' : 'Libera cache inativo'}
          </p>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('cleaner');
          }}
          aria-label="Ir para Central de Limpeza"
          className="p-3 rounded-xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 hover:border-purple-400 text-left transition-all active:scale-95 group shadow-md"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Trash2 size={18} />
            </div>
            <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="font-['Orbitron'] font-bold text-xs text-white">LIMPEZA INTELIGENTE</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Excluir temporários e APKs</p>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('gamer');
          }}
          aria-label="Abrir Painel Modo Gamer"
          className="p-3 rounded-xl bg-gradient-to-br from-pink-950/40 via-slate-900 to-slate-950 border border-pink-500/30 hover:border-pink-400 text-left transition-all active:scale-95 group shadow-md"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">
              <Gamepad2 size={18} />
            </div>
            {isGamerModeActive ? (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            ) : (
              <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
            )}
          </div>
          <div className="font-['Orbitron'] font-bold text-xs text-white">MODO GAMER</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Priorizar FPS & Estabilidade</p>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('hardware');
          }}
          aria-label="Ver Diagnóstico Completo de Hardware"
          className="p-3 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400 text-left transition-all active:scale-95 group shadow-md"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Activity size={18} />
            </div>
            <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="font-['Orbitron'] font-bold text-xs text-white">DIAGNÓSTICO</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Sensores, GPU & SpeedTest</p>
        </button>
      </div>

      {/* GPU & Hardware Identification Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <h3 className="font-['Orbitron'] text-xs font-bold text-white tracking-wide">
              HARDWARE GRÁFICO (GPU)
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {hardware.isRealGpu ? 'DETECTADO REAL' : 'SIMULADO'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-['Rajdhani'] font-bold text-slate-400">
              Processador Gráfico
            </span>
            <p className="text-sm font-bold text-white font-mono mt-0.5 truncate" title={hardware.gpuRenderer}>
              {hardware.gpuRenderer}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Fabricante: <span className="text-slate-300 font-semibold">{hardware.gpuVendor}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-['Rajdhani'] font-bold text-slate-400">
              Pipeline Gráfico & Drivers
            </span>
            <p className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
              {hardware.gpuDriverVersion}
            </p>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
              <span>Textura Máx: <strong className="text-slate-200">{hardware.gpuMaxTextureSize}px</strong></span>
              <span>WebGL 2.0: <strong className="text-emerald-400">{hardware.webGl2Supported ? 'SIM' : 'NÃO'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Wi-Fi & Conexão Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wifi size={16} className="text-emerald-400" />
            <h3 className="font-['Orbitron'] text-xs font-bold text-white tracking-wide">
              CONEXÃO & REDE ATIVA
            </h3>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            CONECTADO
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-['Rajdhani'] uppercase font-bold">REDE (SSID)</span>
            <div className="font-semibold text-white truncate mt-0.5">{network.ssid}</div>
            <span className="text-[10px] text-cyan-400">{network.frequencyGhz}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-['Rajdhani'] uppercase font-bold">VELOCIDADE ESTIMADA</span>
            <div className="font-semibold text-emerald-400 font-mono mt-0.5">{network.downlinkMbps.toFixed(1)} Mbps</div>
            <span className="text-[10px] text-slate-400">{network.networkType}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-['Rajdhani'] uppercase font-bold">IP LOCAL</span>
            <div className="font-semibold text-slate-300 font-mono mt-0.5">{network.localIp}</div>
            <span className="text-[10px] text-slate-500">DHCP Ativo</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-['Rajdhani'] uppercase font-bold">LATÊNCIA (PING)</span>
            <div className="font-semibold text-cyan-400 font-mono mt-0.5">{network.pingMs} ms</div>
            <span className="text-[10px] text-slate-400">Jitter: {network.jitterMs}ms</span>
          </div>
        </div>
      </div>

      {/* Android Security & Transparency Notice */}
      <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
        <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Privacidade & Conformidade Android 13+:</strong> Este app realiza diagnósticos diretos usando APIs de hardware seguras e o Storage Access Framework oficial. Sem root, sem acesso indevido a dados de terceiros e sem falsas promessas de overclock.
        </p>
      </div>
    </div>
  );
};
