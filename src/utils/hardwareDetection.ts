import { Capacitor, registerPlugin } from '@capacitor/core';
import { HardwareState, NetworkState, StorageState, DeviceInfo } from '../types';
import type { JunkItem } from './metrics';

type NavigatorWithExtras = Navigator & {
  deviceMemory?: number;
  connection?: {
    downlink?: number;
    rtt?: number;
    effectiveType?: string;
    type?: string;
  };
  getBattery?: () => Promise<{ level: number; charging: boolean }>;
};

interface NativeHardwareInfo {
  totalRamMb?: number;
  availableRamMb?: number;
  usedRamMb?: number;
  ramUsagePct?: number;
  coreCount?: number;
  cpuArchitecture?: string;
  batteryLevelPct?: number;
  isCharging?: boolean;
  batteryHealth?: string;
  batteryVoltageMv?: number;
  batteryTempC?: number;
  manufacturer?: string;
  model?: string;
  marketingName?: string;
  androidVersion?: string;
  apiLevel?: number;
  buildNumber?: string;
  securityPatch?: string;
  screenResolution?: string;
  screenDpi?: number;
  refreshRateHz?: number;
  sensors?: string[];
  storageTotalBytes?: number;
  storageAvailableBytes?: number;
}

interface NativeHardwarePlugin {
  getInfo(): Promise<NativeHardwareInfo>;
}

const NativeHardware = registerPlugin<NativeHardwarePlugin>('Hardware');

export async function detectHardwareCapabilities(): Promise<{
  hardware: HardwareState;
  network: NetworkState;
  storage: StorageState;
  device: DeviceInfo;
}> {
  const nav = navigator as NavigatorWithExtras;
  const coreCount = Number.isFinite(nav.hardwareConcurrency)
    ? nav.hardwareConcurrency
    : 0;

  const deviceMemory =
    typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 0;
  const totalRamMb = deviceMemory > 0 ? Math.round(deviceMemory * 1024) : 0;

  let gpuVendor = 'Não informado pelo navegador';
  let gpuRenderer = 'Renderizador gráfico não exposto';
  let maxTextureSize = 0;
  let webGl2Supported = false;
  let isRealGpu = false;

  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    webGl2Supported = Boolean(gl2);
    const gl = gl2 || canvas.getContext('webgl');

    if (gl) {
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
      const debug = gl.getExtension('WEBGL_debug_renderer_info');

      if (debug) {
        gpuVendor = String(
          gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) || gpuVendor
        );
        gpuRenderer = String(
          gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) || gpuRenderer
        );
        isRealGpu = gpuRenderer !== 'Renderizador gráfico não exposto';
      } else {
        gpuRenderer = 'WebGL disponível; identificação detalhada bloqueada';
      }
    }
  } catch {
    // WebGL indisponível.
  }

  let batteryLevelPct = 0;
  let isCharging = false;
  let isRealBattery = false;

  try {
    if (nav.getBattery) {
      const battery = await nav.getBattery();
      batteryLevelPct = Math.round(battery.level * 100);
      isCharging = battery.charging;
      isRealBattery = true;
    }
  } catch {
    // Battery API indisponível.
  }

  let quota = 0;
  let usage = 0;
  let isRealStorage = false;

  try {
    const estimate = await navigator.storage?.estimate();
    quota = estimate?.quota || 0;
    usage = estimate?.usage || 0;
    isRealStorage = quota > 0;
  } catch {
    // Storage API indisponível.
  }

  const connection = nav.connection;
  const online = navigator.onLine;
  const downlinkMbps =
    typeof connection?.downlink === 'number' ? connection.downlink : 0;
  const pingMs =
    typeof connection?.rtt === 'number' ? connection.rtt : 0;

  const networkType: NetworkState['networkType'] =
    connection?.effectiveType === '4g'
      ? '4G LTE'
      : connection?.effectiveType === '5g'
        ? '5G'
        : 'Wi-Fi 5';

  const resolution =
    `${Math.round(screen.width * devicePixelRatio)} × ` +
    `${Math.round(screen.height * devicePixelRatio)}`;

  const hardware: HardwareState = {
    totalRamMb,
    usedRamMb: 0,
    availableRamMb: 0,
    ramUsagePct: 0,
    ramHistory: [],
    isRamOptimizing: false,
    cpuUsagePct: 0,
    coreCount,
    cpuArchitecture: 'Não exposta pelo navegador',
    cpuFrequencyGhz: 0,
    coreLoads: [],
    cpuHistory: [],
    gpuVendor,
    gpuRenderer,
    gpuDriverVersion: 'Não exposto pelo navegador',
    gpuMaxTextureSize: maxTextureSize,
    webGl2Supported,
    shaderPrecision: 'Não verificada',
    batteryTempC: 0,
    cpuTempC: 0,
    socTempC: 0,
    tempHistory: [],
    batteryLevelPct,
    isCharging,
    batteryHealth: 'Não disponível',
    batteryVoltageMv: 0,
    isRealDeviceMemory: deviceMemory > 0,
    isRealGpu,
    isRealBattery,
    isRealNetwork: Boolean(connection),
    isRealStorage,
  };

  const network: NetworkState = {
    ssid: 'Não acessível pelo navegador',
    localIp: 'Não acessível pelo navegador',
    frequencyGhz: 'Não disponível',
    signalStrengthDbm: 0,
    signalBars: 0,
    downlinkMbps,
    uplinkMbps: 0,
    pingMs,
    jitterMs: 0,
    networkType,
    isConnected: online,
    isTestingSpeed: false,
    testPhase: 'idle',
    testProgress: 0,
  };

  const storage: StorageState = {
    totalBytes: quota,
    usedBytes: usage,
    availableBytes: Math.max(0, quota - usage),
    usedPercentage:
      quota > 0 ? Math.min(100, Math.round((usage / quota) * 100)) : 0,
    microSdAvailable: false,
    microSdTotalBytes: 0,
    microSdUsedBytes: 0,
    isScanning: false,
    isCleaning: false,
    scanProgress: 0,
  };

  const device: DeviceInfo = {
    manufacturer: 'Não identificado pelo navegador',
    model: 'Dispositivo Android (modelo não exposto)',
    marketingName: 'Memóriatech Gamer',
    androidVersion: 'Versão não exposta pelo navegador',
    apiLevel: 0,
    buildNumber: 'Não disponível',
    securityPatch: 'Não disponível',
    screenResolution: resolution,
    screenDpi: Math.round(160 * devicePixelRatio),
    refreshRateHz: 0,
    kernelVersion: 'Não acessível pelo navegador',
    sensors: [],
  };

  // Dados nativos: somente em execução dentro do aplicativo Android.
  if (Capacitor.isNativePlatform()) {
    try {
      const native = await NativeHardware.getInfo();

      if (native.totalRamMb !== undefined) {
        hardware.totalRamMb = Math.round(native.totalRamMb);
        hardware.isRealDeviceMemory = true;
      }
      if (native.availableRamMb !== undefined) {
        hardware.availableRamMb = Math.round(native.availableRamMb);
      }
      if (native.usedRamMb !== undefined) {
        hardware.usedRamMb = Math.round(native.usedRamMb);
      }
      if (native.ramUsagePct !== undefined) {
        hardware.ramUsagePct = Math.round(native.ramUsagePct);
      }
      if (native.coreCount !== undefined) {
        hardware.coreCount = native.coreCount;
      }
      if (native.cpuArchitecture) {
        hardware.cpuArchitecture = native.cpuArchitecture;
      }
      if (native.batteryLevelPct !== undefined) {
        hardware.batteryLevelPct = Math.round(native.batteryLevelPct);
        hardware.isRealBattery = true;
      }
      if (native.isCharging !== undefined) {
        hardware.isCharging = native.isCharging;
      }
      if (native.batteryHealth) {
        hardware.batteryHealth = native.batteryHealth;
      }
      if (native.batteryVoltageMv !== undefined) {
        hardware.batteryVoltageMv = native.batteryVoltageMv;
      }
      if (native.batteryTempC !== undefined) {
        hardware.batteryTempC = native.batteryTempC;
      }

      if (native.manufacturer) device.manufacturer = native.manufacturer;
      if (native.model) device.model = native.model;
      if (native.marketingName) device.marketingName = native.marketingName;
      if (native.androidVersion) device.androidVersion = native.androidVersion;
      if (native.apiLevel !== undefined) device.apiLevel = native.apiLevel;
      if (native.buildNumber) device.buildNumber = native.buildNumber;
      if (native.securityPatch) device.securityPatch = native.securityPatch;
      if (native.screenResolution) device.screenResolution = native.screenResolution;
      if (native.screenDpi !== undefined) device.screenDpi = native.screenDpi;
      if (native.refreshRateHz !== undefined) {
        device.refreshRateHz = native.refreshRateHz;
      }
      if (native.sensors) device.sensors = native.sensors;

      if (native.storageTotalBytes !== undefined) {
        storage.totalBytes = native.storageTotalBytes;
        storage.isScanning = false;
        isRealStorage = true;
      }
      if (native.storageAvailableBytes !== undefined) {
        storage.availableBytes = native.storageAvailableBytes;
      }
      if (isRealStorage) {
        storage.usedBytes = Math.max(
          0,
          storage.totalBytes - storage.availableBytes
        );
        storage.usedPercentage =
          storage.totalBytes > 0
            ? Math.round((storage.usedBytes / storage.totalBytes) * 100)
            : 0;
        hardware.isRealStorage = true;
      }
    } catch (error) {
      console.warn(
        '[Memóriatech Gamer] Plugin nativo indisponível; usando dados do navegador.',
        error
      );
    }
  }

  return { hardware, network, storage, device };
}

export const INITIAL_JUNK_ITEMS: JunkItem[] = [];
export const INITIAL_INSTALLED_APPS = [];
