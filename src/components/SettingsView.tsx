import React, { useState } from 'react';
import { DeviceInfo, HardwareState, InstalledApp, StorageState, ThemeConfig, ThemeType } from '../types';
import { THEMES } from '../utils/themes';
import {
  Smartphone,
  Palette,
  Package,
  Layers,
  FileCode,
  ExternalLink,
  Settings as SettingsIcon,
  Trash2,
  CheckCircle2,
  Cpu,
  Info,
  Sliders,
  Battery,
  ShieldCheck,
  Compass,
  Copy,
  Check,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { formatBytes } from '../utils/metrics';

interface SettingsViewProps {
  device: DeviceInfo;
  hardware: HardwareState;
  storage: StorageState;
  installedApps: InstalledApp[];
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  device,
  hardware,
  storage,
  installedApps,
  currentTheme,
  onSelectTheme,
  soundEnabled,
  onToggleSound,
}) => {
  const [activeSection, setActiveSection] = useState<'device' | 'apps' | 'personalization' | 'kotlin'>('device');
  const [appActionNotice, setAppActionNotice] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleAppAction = (action: string, appName: string) => {
    soundFx.playClick();
    setAppActionNotice(`${action}: Ação nativa indisponível nesta versão web para "${appName}"...`);
    setTimeout(() => setAppActionNotice(null), 4000);
  };

  const sampleKotlinCode = `// Memóriatech Gamer - Arquitetura Android Jetpack Compose (exemplo ilustrativo)
package com.memoriatech.gamer

import android.app.ActivityManager
import android.content.Context
import android.os.BatteryManager
import androidx.compose.material3.*
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*

// MVVM ViewModel com StateFlow para telemetria em tempo real
class HardwareTelemetryViewModel(
    private val context: Context
) : ViewModel() {

    private val _hardwareState = MutableStateFlow(HardwareUiState())
    val hardwareState: StateFlow<HardwareUiState> = _hardwareState.asStateFlow()

    fun updateTelemetry() {
        val actManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actManager.getMemoryInfo(memInfo)

        val totalMb = memInfo.totalMem / (1024 * 1024)
        val availMb = memInfo.availMem / (1024 * 1024)
        val usedMb = totalMb - availMb
        val usedPct = ((usedMb.toFloat() / totalMb) * 100).toInt()

        _hardwareState.update { current ->
            current.copy(
                totalRamMb = totalMb,
                usedRamMb = usedMb,
                availableRamMb = availMb,
                ramUsagePct = usedPct
            )
        }
    }
}

// Material 3 Compose UI Screen
@Composable
fun GamerDashboardScreen(viewModel: HardwareTelemetryViewModel) {
    val state by viewModel.hardwareState.collectAsState()
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = { GamerBottomNavigation() }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            NeonCircularGauge(
                value = state.ramUsagePct,
                title = "MEMÓRIA RAM",
                accentColor = NeonCyan
            )
            GamerBoostButton(onClick = { viewModel.optimizeRamSafely() })
        }
    }
}`;

  const handleCopyKotlin = () => {
    navigator.clipboard.writeText(sampleKotlinCode);
    setCopiedCode(true);
    soundFx.playClick();
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Subtab Segmented Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => {
            setActiveSection('device');
            soundFx.playClick();
          }}
          className={`py-2 px-1 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'device' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
          style={{ color: activeSection === 'device' ? currentTheme.accent : undefined }}
        >
          <Smartphone size={14} />
          DISPOSITIVO
        </button>

        <button
          onClick={() => {
            setActiveSection('apps');
            soundFx.playClick();
          }}
          className={`py-2 px-1 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'apps' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
          style={{ color: activeSection === 'apps' ? currentTheme.accent : undefined }}
        >
          <Package size={14} />
          APLICATIVOS
        </button>

        <button
          onClick={() => {
            setActiveSection('personalization');
            soundFx.playClick();
          }}
          className={`py-2 px-1 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'personalization' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
          style={{ color: activeSection === 'personalization' ? currentTheme.accent : undefined }}
        >
          <Palette size={14} />
          TEMAS NEON
        </button>

        <button
          onClick={() => {
            setActiveSection('kotlin');
            soundFx.playClick();
          }}
          className={`py-2 px-1 rounded-lg text-xs font-['Rajdhani'] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'kotlin' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
          style={{ color: activeSection === 'kotlin' ? currentTheme.accent : undefined }}
        >
          <FileCode size={14} />
          CÓDIGO KOTLIN
        </button>
      </div>

      {appActionNotice && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
          <Info size={15} />
          <span>{appActionNotice}</span>
        </div>
      )}

      {/* 1. DISPOSITIVO: Informações Completas de Hardware e Sistema */}
      {activeSection === 'device' && (
        <div className="space-y-3">
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Smartphone size={18} />
              </div>
              <div>
                <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                  ESPECIFICAÇÕES DO DISPOSITIVO
                </h3>
                <p className="text-[11px] text-slate-400">{device.marketingName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Fabricante & Modelo:</span>
                <strong className="text-white font-mono">{device.manufacturer} ({device.model})</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Versão do Android:</span>
                <strong className="text-emerald-400 font-mono">{device.androidVersion} (API {device.apiLevel})</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Build Number:</span>
                <strong className="text-slate-300 font-mono text-[11px] truncate max-w-[150px]">{device.buildNumber}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Patch de Segurança:</span>
                <strong className="text-cyan-400 font-mono">{device.securityPatch}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Processador (CPU):</span>
                <strong className="text-white font-mono">{hardware.cpuArchitecture}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Núcleos de Processamento:</span>
                <strong className="text-cyan-400 font-mono">{hardware.coreCount} Cores (Octa-Core)</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Placa Gráfica (GPU):</span>
                <strong className="text-purple-400 font-mono truncate max-w-[150px]">{hardware.gpuRenderer}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Memória RAM Instalada:</span>
                <strong className="text-white font-mono">{(hardware.totalRamMb / 1024).toFixed(0)} GB estimada pelo navegador</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Resolução da Tela:</span>
                <strong className="text-white font-mono">{device.screenResolution} ({device.screenDpi} DPI)</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Taxa de Atualização:</span>
                <strong className="text-cyan-400 font-mono">{device.refreshRateHz} Hz Fluido</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Armazenamento Total:</span>
                <strong className="text-white font-mono">{formatBytes(storage.totalBytes, 0)} (quota do site)</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Bateria & Tensão:</span>
                <strong className="text-emerald-400 font-mono">{hardware.batteryLevelPct}% ({hardware.batteryVoltageMv} mV)</strong>
              </div>
            </div>
          </div>

          {/* Sensores de Hardware Disponíveis */}
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Compass size={16} className="text-cyan-400" />
              <h4 className="font-['Orbitron'] text-xs font-bold text-white uppercase">
                Sensores Físicos Integrados ({device.sensors.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {device.sensors.map((sensor, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-mono text-[11px]">{sensor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. APLICATIVOS: Gerenciador de Apps Instalados */}
      {activeSection === 'apps' && (
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                GERENCIADOR DE APLICATIVOS
              </h3>
              <p className="text-[11px] text-slate-400">
                Atalhos oficiais para o sistema Android (sem desinstalação oculta)
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/30">
              {installedApps.length} APPS
            </span>
          </div>

          <div className="space-y-2.5">
            {installedApps.map((app) => (
              <div
                key={app.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{app.name}</span>
                    {app.isGame && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-bold">
                        GAME
                      </span>
                    )}
                    {app.isRunningBackground && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        2º PLANO
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{app.packageName}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                    <span>Espaço: <strong>{app.sizeMb} MB</strong></span>
                    <span>Instalado: <strong>{app.installDate}</strong></span>
                  </div>
                </div>

                {/* System actions shortcuts */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAppAction('Abrir Aplicativo', app.name)}
                    aria-label={`Abrir ${app.name}`}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <ExternalLink size={12} className="text-cyan-400" />
                    <span>Abrir</span>
                  </button>

                  <button
                    onClick={() => handleAppAction('Configurações do App', app.name)}
                    aria-label={`Configurações de ${app.name}`}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white"
                    title="Detalhes do Aplicativo"
                  >
                    <SettingsIcon size={14} />
                  </button>

                  <button
                    onClick={() => handleAppAction('Desinstalar via Sistema', app.name)}
                    aria-label={`Solicitar desinstalação de ${app.name}`}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-red-500 text-slate-400 hover:text-red-400"
                    title="Desinstalar pelo Sistema"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PERSONALIZAÇÃO: Temas Neon & Efeitos */}
      {activeSection === 'personalization' && (
        <div className="space-y-3">
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Palette size={18} style={{ color: currentTheme.accent }} />
              <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                PALETAS DE CORES & TEMAS NEON
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Selecione o esquema de iluminação LED e acentuação tecnológica do aplicativo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(THEMES) as ThemeType[]).map((themeKey) => {
                const t = THEMES[themeKey];
                const isSelected = currentTheme.id === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTheme(t.id);
                      soundFx.playClick();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-slate-900 border-2 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                    style={{
                      borderColor: isSelected ? t.accent : undefined,
                      boxShadow: isSelected ? `0 0 15px ${t.glow}` : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-md"
                          style={{ backgroundColor: t.accent }}
                        />
                        <span className="font-bold text-xs text-white">{t.name.split(' (')[0]}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={16} style={{ color: t.accent }} />}
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-2">{t.description}</p>

                    <div
                      className="w-full h-1 rounded-full mt-2"
                      style={{
                        background: `linear-gradient(to right, ${t.accent}, ${t.secondary})`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Efeitos de Iluminação & Sons */}
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
            <h4 className="font-['Orbitron'] text-xs font-bold text-white uppercase tracking-wider mb-3">
              EFEITOS & AMBIÊNCIA CIBERNÉTICA
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">Efeitos Sonoros Web Audio</span>
                  <span className="text-[10px] text-slate-400">Clicks cibernéticos e som de boost sem arquivos externos</span>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">Modo Automático de Desempenho</span>
                  <span className="text-[10px] text-slate-400">Alterna paleta para alerta vermelho quando a temperatura &gt; 46°C</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ATIVO
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CÓDIGO KOTLIN: Arquitetura Jetpack Compose Pronta para Android Studio */}
      {activeSection === 'kotlin' && (
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCode size={18} className="text-purple-400" />
                <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                  ARQUITETURA ANDROID JETPACK COMPOSE (KOTLIN)
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Estrutura pronta para compilação no Android Studio e publicação no Google Play
              </p>
            </div>

            <button
              onClick={handleCopyKotlin}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedCode ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed max-h-96">
            <code>{sampleKotlinCode}</code>
          </pre>

          <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
            ✓ Exemplo de arquitetura nativa. Ainda exige projeto Android, permissões e testes no dispositivo antes de ser considerado compatível.
          </div>
        </div>
      )}
    </div>
  );
};
