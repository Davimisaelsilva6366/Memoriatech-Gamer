import React from 'react';
import { TabType, ThemeConfig } from '../types';
import {
  LayoutDashboard,
  Cpu,
  Trash2,
  Gamepad2,
  Settings,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  theme: ThemeConfig;
  isGamerModeActive: boolean;
  cleanerBadgeCount?: number;
  isPhoneFrame?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  theme,
  isGamerModeActive,
  cleanerBadgeCount = 5,
  isPhoneFrame = false,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Início', icon: LayoutDashboard },
    { id: 'hardware' as TabType, label: 'Hardware', icon: Cpu },
    { id: 'cleaner' as TabType, label: 'Limpeza', icon: Trash2, badge: cleanerBadgeCount },
    { id: 'gamer' as TabType, label: 'Modo Gamer', icon: Gamepad2, isGamer: true },
    { id: 'settings' as TabType, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav
      className={`z-40 bg-[#05070f]/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 ${
        isPhoneFrame ? 'sticky bottom-0 left-0 right-0' : 'fixed bottom-0 left-0 right-0'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onSelectTab(tab.id);
                soundFx.playClick();
              }}
              aria-label={tab.label}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-300 ${
                isActive ? 'scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Neon Glow Pill Indicator */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-xl blur-sm opacity-25"
                  style={{
                    backgroundColor: tab.isGamer && isGamerModeActive ? '#ff2a85' : theme.accent,
                  }}
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon
                  size={22}
                  style={{
                    color: isActive
                      ? tab.isGamer && isGamerModeActive
                        ? '#ff2a85'
                        : theme.accent
                      : undefined,
                  }}
                  className={`transition-colors duration-200 ${
                    isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]' : ''
                  }`}
                />

                {/* Cleaner / Notification Badge */}
                {tab.badge && tab.badge > 0 && !isActive && (
                  <span className="absolute -top-1 -right-2.5 px-1 py-0.2 text-[9px] font-bold rounded-full bg-cyan-500 text-black leading-tight animate-pulse">
                    {tab.badge}
                  </span>
                )}

                {/* Gamer Mode Active Dot */}
                {tab.isGamer && isGamerModeActive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-ping" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-['Rajdhani'] font-semibold tracking-wider mt-1 transition-colors ${
                  isActive
                    ? 'font-bold'
                    : 'text-slate-400'
                }`}
                style={{
                  color: isActive
                    ? tab.isGamer && isGamerModeActive
                      ? '#ff2a85'
                      : theme.accent
                    : undefined,
                }}
              >
                {tab.label}
              </span>

              {/* Underline LED Bar */}
              {isActive && (
                <div
                  className="w-5 h-0.5 rounded-full mt-0.5 shadow-[0_0_6px_currentColor]"
                  style={{
                    backgroundColor: tab.isGamer && isGamerModeActive ? '#ff2a85' : theme.accent,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
