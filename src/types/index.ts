export type ThemeType = 'blue' | 'pink' | 'purple' | 'gold' | 'white' | 'black';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  accent: string; // primary neon color
  secondary: string;
  gradient: string;
  glow: string;
  borderGlow: string;
  badgeBg: string;
  textColor: string;
  description: string;
}

export type TabType = 'dashboard' | 'hardware' | 'cleaner' | 'gamer' | 'settings';

export interface HardwareState {
  // RAM
  totalRamMb: number;
  usedRamMb: number;
  availableRamMb: number;
  ramUsagePct: number;
  ramHistory: number[]; // 60s history
  isRamOptimizing: boolean;

  // CPU
  cpuUsagePct: number;
  coreCount: number;
  cpuArchitecture: string;
  cpuFrequencyGhz: number;
  coreLoads: number[];
  cpuHistory: number[];

  // GPU
  gpuVendor: string;
  gpuRenderer: string;
  gpuDriverVersion: string;
  gpuMaxTextureSize: number;
  webGl2Supported: boolean;
  shaderPrecision: string;

  // Thermal
  batteryTempC: number;
  cpuTempC: number;
  socTempC: number;
  tempHistory: number[];

  // Battery
  batteryLevelPct: number;
  isCharging: boolean;
  batteryHealth: string;
  batteryVoltageMv: number;

  // Real vs Estimated
  isRealDeviceMemory: boolean;
  isRealGpu: boolean;
  isRealBattery: boolean;
  isRealNetwork: boolean;
  isRealStorage: boolean;
}

export interface NetworkState {
  ssid: string;
  localIp: string;
  frequencyGhz: string;
  signalStrengthDbm: number;
  signalBars: number;
  downlinkMbps: number;
  uplinkMbps: number;
  pingMs: number;
  jitterMs: number;
  networkType: 'Wi-Fi 6' | 'Wi-Fi 5' | '5G' | '4G LTE' | 'Ethernet';
  isConnected: boolean;
  isTestingSpeed: boolean;
  testPhase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  testProgress: number;
}

export interface StorageState {
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  usedPercentage: number;
  microSdAvailable: boolean;
  microSdTotalBytes: number;
  microSdUsedBytes: number;
  isScanning: boolean;
  isCleaning: boolean;
  scanProgress: number;
}

export interface InstalledApp {
  id: string;
  name: string;
  packageName: string;
  category: 'game' | 'social' | 'system' | 'productivity' | 'tool';
  icon: string;
  sizeMb: number;
  ramUsageMb: number;
  isGame: boolean;
  installDate: string;
  isRunningBackground: boolean;
}

export interface DeviceInfo {
  manufacturer: string;
  model: string;
  marketingName: string;
  androidVersion: string;
  apiLevel: number;
  buildNumber: string;
  securityPatch: string;
  screenResolution: string;
  screenDpi: number;
  refreshRateHz: number;
  kernelVersion: string;
  sensors: string[];
}
