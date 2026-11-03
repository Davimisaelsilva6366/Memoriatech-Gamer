/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  const [uptimeSeconds, setUptimeSeconds] = useState(0); // tempo desta sessão do aplicativo

  // Hardware and system telemetry states
  const [hardware, setHardware] = useState<HardwareState | null>(null);
  const [network, setNetwork] = useState<NetworkState | null>(null);
  const [storage, setStorage] = useState<StorageState | null>(null);
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [junkItems, setJunkItems] = useState<JunkItem[]>(INITIAL_JUNK_ITEMS);
  const [installedApps] = useState<InstalledApp[]>(INITIAL_INSTALLED_APPS);

  const theme = THEMES[selectedThemeKey];

  // 1. Initial Hardware Capabilities Detection
  useEffect(() => {
    detectHardwareCapabilities().then((detected) => {
      setHardware(detected.hardware);
      setNetwork(detected.network);
      setStorage(detected.storage);
      setDevice(detected.device);
    });
  }, []);

  // Session timer only. Browser cannot read Android uptime or CPU load.
  useEffect(() => {
    const timer = setInterval(() => setUptimeSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Audio toggle sync
  useEffect(() => {
    soundFx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Android RAM reclamation is not available to a browser/PWA.
  const handleOptimizeRam = () => {
    // Intentionally no-op: the UI explains this limitation instead of faking a boost.
  };

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
