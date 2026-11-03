/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  TabType,
  ThemeType,
  HardwareState,
  NetworkState,
  StorageState,
  DeviceInfo,
  InstalledApp,
} from './types';
import { THEMES } from './utils/themes';
import {
  detectHardwareCapabilities,
  executeRamOptimization,
  INITIAL_JUNK_ITEMS,
  INITIAL_INSTALLED_APPS,
} from './utils/hardwareDetection';
import { JunkItem } from './utils/metrics';
import { soundFx } from './utils/audio';
import { CyberHeader } from './components/CyberHeader';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { HardwareView } from './components/HardwareView';
import { CleanerView } from './components/CleanerView';
import { GamerModeView } from './components/GamerModeView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [selectedThemeKey, setSelectedThemeKey] = useState<ThemeType>('blue');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [isGamerModeActive, setIsGamerModeActive] = useState(false);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  // Hardware and system telemetry states
  const [hardware, setHardware] = useState<HardwareState | null>(null);
  const [network, setNetwork] = useState<NetworkState | null>(null);
  const [storage, setStorage] = useState<StorageState | null>(null);
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [junkItems, setJunkItems] = useState<JunkItem[]>(INITIAL_JUNK_ITEMS);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>(INITIAL_INSTALLED_APPS);

  const theme = THEMES[selectedThemeKey];

  // 1. Initial Hardware Capabilities Detection
  useEffect(() => {
    detectHardwareCapabilities().then((detected) => {
      setHardware(detected.hardware);
      setNetwork(detected.network);
      setStorage(detected.storage);
      setDevice(detected.device);
      if (detected.installedApps && detected.installedApps.length > 0) {
        setInstalledApps(detected.installedApps);
      }
    });
  }, []);

  // 2. Session timer
  useEffect(() => {
    const timer = setInterval(() => setUptimeSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Audio toggle sync
  useEffect(() => {
    soundFx.enabled = soundEnabled;
  }, [soundEnabled]);

  // 4. Live Telemetry Engine (Updates CPU load, core loads, RAM, temperatures dynamically)
  useEffect(() => {
    const interval = setInterval(() => {
      setHardware((prev) => {
        if (!prev || prev.isRamOptimizing) return prev;

        // Dynamic CPU fluctuation around base load
        const baseCpu = isGamerModeActive ? 46 : 28;
        const delta = (Math.random() - 0.48) * 8;
        const newCpu = Math.max(12, Math.min(94, Math.round(baseCpu + delta)));

        // Core loads fluctuation
        const newCores = prev.coreLoads.map((load, idx) => {
          const shift = (Math.random() - 0.5) * 12;
          const target = idx === 0 && isGamerModeActive ? 85 : 30 + (idx * 5);
          return Math.max(8, Math.min(98, Math.round(target + shift)));
        });

        // Slight temperature drift
        const tempBase = isGamerModeActive ? 42.5 : 37.8;
        const tempDelta = (Math.random() - 0.5) * 0.4;
        const newTemp = Math.round((tempBase + tempDelta) * 10) / 10;

        // RAM history (sliding window of 16 points)
        const updatedRamHistory = [...prev.ramHistory.slice(-15), prev.ramUsagePct];
        const updatedCpuHistory = [...prev.cpuHistory.slice(-15), newCpu];
        const updatedTempHistory = [...prev.tempHistory.slice(-9), newTemp];

        return {
          ...prev,
          cpuUsagePct: newCpu,
          coreLoads: newCores,
          cpuTempC: newTemp,
          socTempC: Math.round((newTemp + 1.4) * 10) / 10,
          ramHistory: updatedRamHistory,
          cpuHistory: updatedCpuHistory,
          tempHistory: updatedTempHistory,
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isGamerModeActive]);

  // 5. Intelligent RAM Optimization Execution
  const handleOptimizeRam = useCallback(async () => {
    if (!hardware) return;

    soundFx.playGamerBoost();
    setHardware((prev) => prev ? { ...prev, isRamOptimizing: true } : prev);

    try {
      const result = await executeRamOptimization(hardware);
      setTimeout(() => {
        setHardware((prev) => {
          if (!prev) return prev;
          const updatedRamHistory = [...prev.ramHistory.slice(-15), result.newUsagePct];
          return {
            ...prev,
            isRamOptimizing: false,
            usedRamMb: result.newUsedMb,
            availableRamMb: result.newAvailableMb,
            ramUsagePct: result.newUsagePct,
            ramHistory: updatedRamHistory,
          };
        });
      }, 700);
    } catch {
      setHardware((prev) => prev ? { ...prev, isRamOptimizing: false } : prev);
    }
  }, [hardware]);

  // Quick theme cycler
  const handleQuickThemeCycle = () => {
    const themeKeys: ThemeType[] = ['blue', 'purple', 'pink', 'gold', 'white', 'black'];
    const currentIndex = themeKeys.indexOf(selectedThemeKey);
    const nextKey = themeKeys[(currentIndex + 1) % themeKeys.length];
    setSelectedThemeKey(nextKey);
  };

  if (!hardware || !network || !storage || !device) {
    return (
      <div className="min-h-screen bg-[#05070f] flex flex-col items-center justify-center text-cyan-400 font-['Orbitron'] p-4">
        <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base tracking-widest uppercase">INICIALIZANDO MEMÓRIATECH GAMER</h2>
        <p className="text-xs text-slate-400 font-['Rajdhani'] mt-1">Carregando telemetria de hardware e sensores...</p>
      </div>
    );
  }

  // Application content inside phone frame or full window
  const content = (
    <div className="min-h-screen flex flex-col bg-[#05070f] text-slate-100 font-['Space_Grotesk'] selection:bg-cyan-500 selection:text-black">
      {/* Cyber Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `radial-gradient(${theme.accent} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Cyber Header */}
      <CyberHeader
        theme={theme}
        batteryLevel={hardware.batteryLevelPct}
        isCharging={hardware.isCharging}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isPhoneFrame={isPhoneFrame}
        onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
        onQuickThemeClick={handleQuickThemeCycle}
        isGamerModeActive={isGamerModeActive}
      />

      {/* Main Tab Screen Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-4 relative z-10">
        {currentTab === 'dashboard' && (
          <DashboardView
            hardware={hardware}
            network={network}
            storage={storage}
            theme={theme}
            uptimeSeconds={uptimeSeconds}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOptimizeRam={handleOptimizeRam}
            isGamerModeActive={isGamerModeActive}
            isPhoneFrame={isPhoneFrame}
          />
        )}

        {currentTab === 'hardware' && (
          <HardwareView
            hardware={hardware}
            network={network}
            theme={theme}
            onOptimizeRam={handleOptimizeRam}
            onUpdateHardware={(partial) => setHardware((prev) => (prev ? { ...prev, ...partial } : prev))}
            onUpdateNetwork={(partial) => setNetwork((prev) => (prev ? { ...prev, ...partial } : prev))}
          />
        )}

        {currentTab === 'cleaner' && (
          <CleanerView
            storage={storage}
            junkItems={junkItems}
            theme={theme}
            onUpdateStorage={(newStorage) => setStorage(newStorage)}
            onUpdateJunkItems={(items) => setJunkItems(items)}
          />
        )}

        {currentTab === 'gamer' && (
          <GamerModeView
            hardware={hardware}
            installedApps={installedApps}
            theme={theme}
            isGamerModeActive={isGamerModeActive}
            onToggleGamerMode={() => setIsGamerModeActive(!isGamerModeActive)}
            onOptimizeRam={handleOptimizeRam}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            device={device}
            hardware={hardware}
            storage={storage}
            installedApps={installedApps}
            currentTheme={theme}
            onSelectTheme={(t) => setSelectedThemeKey(t)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
          />
        )}
      </main>

      {/* 5-Tab Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        theme={theme}
        isGamerModeActive={isGamerModeActive}
        cleanerBadgeCount={junkItems.filter((i) => i.selected).length}
        isPhoneFrame={isPhoneFrame}
      />
    </div>
  );

  // If Phone Frame Mockup is active, render inside smartphone shell
  if (isPhoneFrame) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6 select-none">
        <div className="w-full max-w-[420px] h-[860px] bg-black rounded-[48px] border-[10px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col relative ring-2 ring-slate-700">
          {/* Top Speaker & Punch-hole Camera */}
          <div className="h-6 bg-black flex items-center justify-center shrink-0 relative z-50">
            <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700 mx-auto" />
            <div className="absolute top-2 w-16 h-1 rounded-full bg-slate-800" />
          </div>

          {/* Inner Screen Scroll Viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {content}
          </div>

          {/* Android Bottom Navigation Pill Bar */}
          <div className="h-5 bg-black flex items-center justify-center shrink-0 relative z-50">
            <div className="w-28 h-1 rounded-full bg-slate-700" />
          </div>
        </div>

        {/* Toggle back to full screen caption */}
        <button
          onClick={() => setIsPhoneFrame(false)}
          className="mt-3 text-xs text-slate-400 hover:text-white underline font-['Rajdhani']"
        >
          Sair do modo moldura de celular
        </button>
      </div>
    );
  }

  return content;
}
