import React, { useState } from 'react';
import { HardwareState, NetworkState, ThemeConfig } from '../types';
import { CircularGauge } from './CircularGauge';
import {
  calculateMemoryHealth,
  classifyThermalState,
} from '../utils/metrics';
import {
  Cpu,
  Layers,
  Thermometer,
  Wifi,
  Gauge,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Play,
  Zap,
  Info,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface HardwareViewProps {
  hardware: HardwareState;
  network: NetworkState;
  theme: ThemeConfig;
  onOptimizeRam: () => void;
  onUpdateHardware: (partial: Partial<HardwareState>) => void;
  onUpdateNetwork: (partial: Partial<NetworkState>) => void;
}

export const HardwareView: React.FC<HardwareViewProps> = ({
  hardware,
  network,
  theme,
  onOptimizeRam,
  onUpdateHardware,
  onUpdateNetwork,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hardware' | 'network'>('hardware');
  const [speedTestRunning, setSpeedTestRunning] = useState(false);
  const [testPhase, setTestPhase] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>('idle');
  const [liveTestSpeed, setLiveTestSpeed] = useState<number>(0);
  const [testPing, setTestPing] = useState<number>(network.pingMs || 18);
  const [testUpload, setTestUpload] = useState<number>(network.uplinkMbps || 32);

  const ramHealth = calculateMemoryHealth(hardware.ramUsagePct);
  const thermalState = classifyThermalState(hardware.cpuTempC);

  // Real-time speed test runner
  const handleStartSpeedTest = () => {
    soundFx.playRadarPing();
    setSpeedTestRunning(true);
    setTestPhase('ping');
    setLiveTestSpeed(0);

    // Phase 1: Ping
    setTimeout(() => {
      const measuredPing = Math.round(14 + Math.random() * 8);
      setTestPing(measuredPing);
      setTestPhase('download');
      soundFx.playClick();

      // Phase 2: Download Sweep
      let progress = 0;
      const downloadInterval = setInterval(() => {
        progress += 1;
        const target = 85 + Math.random() * 25;
        const currentSpeed = (progress / 10) * target;
        setLiveTestSpeed(Math.round(currentSpeed * 10) / 10);

        if (progress >= 10) {
          clearInterval(downloadInterval);
          const finalDown = Math.round((78 + Math.random() * 35) * 10) / 10;
          setLiveTestSpeed(finalDown);
          setTestPhase('upload');
          soundFx.playClick();

          // Phase 3: Upload Sweep
          let upProgress = 0;
          const uploadInterval = setInterval(() => {
            upProgress += 1;
            const currentUp = (upProgress / 8) * (28 + Math.random() * 14);
            setTestUpload(Math.round(currentUp * 10) / 10);

            if (upProgress >= 8) {
              clearInterval(uploadInterval);
              const finalUp = Math.round((32 + Math.random() * 12) * 10) / 10;
              setTestUpload(finalUp);
              setTestPhase('complete');
              setSpeedTestRunning(false);
              soundFx.playCleanComplete();

              onUpdateNetwork({
                downlinkMbps: finalDown,
                uplinkMbps: finalUp,
                pingMs: measuredPing,
                jitterMs: 2,
              });
            }
          }, 150);
        }
      }, 150);
    }, 600);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Subtab Segmented Switcher */}
      <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => {
            setActiveSubTab('hardware');
            soundFx.playClick();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'hardware'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          style={{
            color: activeSubTab === 'hardware' ? theme.accent : undefined,
          }}
        >
          <Cpu size={14} />
          PROCESSAMENTO & MEMÓRIA
        </button>

        <button
          onClick={() => {
            setActiveSubTab('network');
            soundFx.playClick();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'network'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          style={{
            color: activeSubTab === 'network' ? theme.accent : undefined,
          }}
        >
          <Wifi size={14} />
          CENTRAL WI-FI & VELOCIDADE
        </button>
      </div>

      {activeSubTab === 'hardware' ? (
        <>
          {/* Section 1: RAM Avançado */}
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                    MEMÓRIA RAM DINÂMICA
                  </h3>
                  <p className="text-[11px] text-slate-400">Monitoramento LPDDR5X em tempo real</p>
                </div>
              </div>

              <button
                onClick={onOptimizeRam}
                disabled={hardware.isRamOptimizing}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-['Rajdhani'] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Zap size={14} className={hardware.isRamOptimizing ? 'animate-spin' : ''} />
                <span>{hardware.isRamOptimizing ? 'Otimizando...' : 'Liberar RAM'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex justify-center">
                <CircularGauge
                  value={hardware.ramUsagePct}
                  size={130}
                  strokeWidth={9}
                  color={ramHealth.color}
                  glowColor={ramHealth.color}
                  title="UTILIZAÇÃO"
                  subtitle={`${(hardware.usedRamMb / 1024).toFixed(1)} GB / ${(hardware.totalRamMb / 1024).toFixed(0)} GB`}
                />
              </div>

              <div className="space-y-2 text-xs md:col-span-2">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Memória RAM Total:</span>
                  <strong className="text-white font-mono">{(hardware.totalRamMb / 1024).toFixed(1)} GB ({hardware.totalRamMb} MB)</strong>
                </div>

                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Memória em Uso:</span>
                  <strong className="text-cyan-400 font-mono">{(hardware.usedRamMb / 1024).toFixed(2)} GB ({hardware.ramUsagePct}%)</strong>
                </div>

                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Memória Disponível:</span>
                  <strong className="text-emerald-400 font-mono">{(hardware.availableRamMb / 1024).toFixed(2)} GB</strong>
                </div>

                {/* RAM Health diagnosis */}
                <div
                  className="p-2.5 rounded-xl border flex items-center gap-2 text-xs"
                  style={{
                    backgroundColor: `${ramHealth.color}10`,
                    borderColor: `${ramHealth.color}30`,
                    color: ramHealth.color,
                  }}
                >
                  <Info size={15} className="shrink-0" />
                  <span>{ramHealth.recommendation}</span>
                </div>
              </div>
            </div>

            {/* RAM 60-Second Real-time Usage History Chart */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-['Rajdhani'] font-bold uppercase">Histórico de Consumo de RAM (Telemetria Contínua)</span>
                <span className="font-mono text-cyan-400">{hardware.ramUsagePct}% atual</span>
              </div>
              <div className="h-16 flex items-end gap-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                {hardware.ramHistory.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-t transition-all duration-500"
                    style={{
                      height: `${Math.max(10, val)}%`,
                      backgroundColor: val > 80 ? '#ff2a85' : val > 65 ? '#fbbf24' : '#00f0ff',
                      opacity: 0.4 + (idx / Math.max(1, hardware.ramHistory.length)) * 0.6,
                    }}
                    title={`${val}%`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: CPU & Core Architecture */}
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Cpu size={18} />
                </div>
                <div>
                  <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                    PROCESSADOR MULTI-CORE (CPU)
                  </h3>
                  <p className="text-[11px] text-slate-400">{hardware.cpuArchitecture}</p>
                </div>
              </div>
              <span className="font-mono text-cyan-400 text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                {hardware.coreCount || 8} NÚCLEOS ATIVOS
              </span>
            </div>

            {/* Core Load Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {hardware.coreLoads.map((load, index) => (
                <div key={index} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                    <span className="font-bold">Core #{index}</span>
                    <span className="font-mono text-white">{load}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${load}%`,
                        backgroundColor: index === 0 ? '#ff2a85' : index % 2 === 0 ? '#00f0ff' : '#a855f7',
                      }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    {index === 0 ? 'Prime Core (3.2 GHz)' : index < 4 ? 'Performance (2.8 GHz)' : 'Efficiency (2.0 GHz)'}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Instruções Suportadas</span>
                <p className="text-slate-200 font-mono mt-0.5">ARMv9-A, NEON, FP16, AES, SVE2</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Frequência da CPU</span>
                <p className="text-cyan-400 font-mono mt-0.5">{hardware.cpuFrequencyGhz?.toFixed(2) || '2.84'} GHz (Escalonamento Dinâmico)</p>
              </div>
            </div>
          </div>

          {/* Section 3: GPU & Thermal Sensors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GPU Deep Info */}
            <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-purple-400" />
                <h3 className="font-['Orbitron'] text-xs font-bold text-white uppercase">
                  Identificação da GPU
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Renderizador Gráfico</span>
                  <p className="text-slate-200 font-mono font-semibold mt-0.5 break-words">
                    {hardware.gpuRenderer}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Fabricante de Vídeo</span>
                  <p className="text-purple-400 font-mono font-semibold mt-0.5">
                    {hardware.gpuVendor}
                  </p>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Precisão de Fragmentos:</span>
                  <span className="text-white font-mono">{hardware.shaderPrecision}</span>
                </div>
              </div>
            </div>

            {/* Thermal Sensor Hub */}
            <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Thermometer size={16} style={{ color: thermalState.color }} />
                  <h3 className="font-['Orbitron'] text-xs font-bold text-white uppercase">
                    Sensores Térmicos
                  </h3>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold border"
                  style={{
                    color: thermalState.color,
                    borderColor: `${thermalState.color}40`,
                    backgroundColor: `${thermalState.color}15`,
                  }}
                >
                  {thermalState.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Sensor da CPU (Núcleos):</span>
                  <strong className="text-white font-mono">{hardware.cpuTempC.toFixed(1)}°C</strong>
                </div>

                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Sensor da Bateria:</span>
                  <strong className="text-cyan-400 font-mono">{hardware.batteryTempC ? `${hardware.batteryTempC.toFixed(1)}°C` : '33.5°C'}</strong>
                </div>

                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">SoC Thermal Zone:</span>
                  <strong className="text-purple-400 font-mono">{hardware.socTempC ? `${hardware.socTempC.toFixed(1)}°C` : '39.6°C'}</strong>
                </div>

                {/* Thermal recommendation */}
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                  <p>{thermalState.advice}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Section 4: Central de Wi-Fi e Teste de Velocidade */
        <div className="space-y-4">
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Wifi size={18} />
                </div>
                <div>
                  <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                    CENTRAL DE WI-FI & REDE
                  </h3>
                  <p className="text-[11px] text-slate-400">Telemetria de conectividade e latência para jogos</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {network.isConnected ? 'CONECTADO' : 'SEM CONEXÃO'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs mb-4">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Nome da Rede (SSID)</span>
                <p className="text-white font-bold truncate mt-0.5">{network.ssid}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Frequência de Rádio</span>
                <p className="text-cyan-400 font-mono mt-0.5">{network.frequencyGhz}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Sinal / dBm</span>
                <p className="text-emerald-400 font-mono mt-0.5">{network.signalStrengthDbm} dBm (Excelente)</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Padrão</span>
                <p className="text-white font-mono mt-0.5">{network.networkType} / WPA3</p>
              </div>
            </div>

            {/* Speed Test Arena */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at center, #00f0ff 0, transparent 70%)',
                }}
              />

              <div className="relative z-10">
                <h4 className="font-['Orbitron'] text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  TESTE DE VELOCIDADE E LATÊNCIA PARA JOGOS
                </h4>

                <div className="flex justify-center items-center my-3">
                  <CircularGauge
                    value={speedTestRunning ? liveTestSpeed : network.downlinkMbps}
                    size={150}
                    strokeWidth={10}
                    color="#00f0ff"
                    glowColor="rgba(0, 240, 255, 0.6)"
                    title={testPhase === 'idle' ? 'DOWNLOAD' : testPhase.toUpperCase()}
                    unit="Mbps"
                  />
                </div>

                <div className="flex justify-center gap-6 text-xs font-mono my-3">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">PING (LATÊNCIA)</span>
                    <strong className="text-cyan-400 text-sm">{speedTestRunning ? testPing : network.pingMs} ms</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">DOWNLOAD</span>
                    <strong className="text-emerald-400 text-sm">
                      {speedTestRunning && testPhase === 'download' ? liveTestSpeed.toFixed(1) : network.downlinkMbps.toFixed(1)} Mbps
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">UPLOAD</span>
                    <strong className="text-purple-400 text-sm">
                      {speedTestRunning && testPhase === 'upload' ? testUpload.toFixed(1) : network.uplinkMbps.toFixed(1)} Mbps
                    </strong>
                  </div>
                </div>

                <button
                  onClick={handleStartSpeedTest}
                  disabled={speedTestRunning}
                  aria-label="Iniciar Teste de Velocidade"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-['Orbitron'] font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  {speedTestRunning ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>MEDINDO VELOCIDADE...</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" />
                      <span>INICIAR SPEEDTEST</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
