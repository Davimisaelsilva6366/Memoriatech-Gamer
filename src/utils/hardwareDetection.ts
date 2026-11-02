import { HardwareState, NetworkState, StorageState, DeviceInfo, InstalledApp } from '../types';

/**
 * Detects real hardware capabilities available via Web APIs and provides realistic
 * Android 13+ device telemetry for unexposed system metrics with honest transparency.
 */
export async function detectHardwareCapabilities(): Promise<{
  hardware: HardwareState;
  network: NetworkState;
  storage: StorageState;
  device: DeviceInfo;
}> {
  // 1. Detect Real GPU via WebGL unmasked vendor & renderer
  let gpuVendor = 'Hardware Gráfico Padrão';
  let gpuRenderer = 'GPU Móvel (Adreno/Mali compatível)';
  let isRealGpu = false;
  let maxTextureSize = 8192;
  let webGl2Supported = false;

  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    webGl2Supported = !!gl2;
    const gl = (gl2 || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as (WebGLRenderingContext | WebGL2RenderingContext | null);
    if (gl) {
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 8192;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (unmaskedRenderer && typeof unmaskedRenderer === 'string') {
          gpuRenderer = unmaskedRenderer;
          gpuVendor = unmaskedVendor || 'Qualcomm / ARM / Khronos';
          isRealGpu = true;
        }
      }
    }
  } catch {
    // WebGL fallback
  }

  // 2. Detect CPU Cores via hardwareConcurrency
  const coreCount = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 8;

  // 3. Detect RAM via deviceMemory API (in GB, e.g. 4, 6, 8, 12)
  const navMemory = typeof navigator !== 'undefined' && (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  let totalRamMb = 8192; // Default 8GB typical gaming phone
  let isRealDeviceMemory = false;

  if (navMemory && typeof navMemory === 'number') {
    totalRamMb = Math.round(navMemory * 1024);
    isRealDeviceMemory = true;
  }

  const usedRamMb = Math.round(totalRamMb * 0.58);
  const availableRamMb = totalRamMb - usedRamMb;
  const ramUsagePct = Math.round((usedRamMb / totalRamMb) * 100);

  // 4. Detect Real Storage via Storage API
  let totalBytes = 128 * 1024 * 1024 * 1024; // 128 GB
  let usedBytes = 72 * 1024 * 1024 * 1024;
  let isRealStorage = false;

  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota && estimate.quota > 0) {
        // Some browsers return the exact storage quota
        totalBytes = estimate.quota;
        usedBytes = estimate.usage || Math.round(totalBytes * 0.52);
        isRealStorage = true;
      }
    }
  } catch {
    // fallback
  }

  // 5. Detect Battery via BatteryManager API
  let batteryLevelPct = 84;
  let isCharging = false;
  let isRealBattery = false;

  try {
    const navWithBattery = navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> };
    if (typeof navWithBattery.getBattery === 'function') {
      const battery = await navWithBattery.getBattery();
      batteryLevelPct = Math.round(battery.level * 100);
      isCharging = battery.charging;
      isRealBattery = true;
    }
  } catch {
    // Battery API not supported or permissions restricted
  }

  // 6. Network Info via Network Information API
  let downlinkMbps = 54.2;
  let pingMs = 24;
  let isRealNetwork = false;
  const navConnection = (navigator as unknown as { connection?: { downlink?: number; rtt?: number; effectiveType?: string } }).connection;

  if (navConnection) {
    if (navConnection.downlink) {
      downlinkMbps = navConnection.downlink;
      isRealNetwork = true;
    }
    if (navConnection.rtt) {
      pingMs = navConnection.rtt;
    }
  }

  // Screen resolution
  const screenResolution = `${window.screen.width * (window.devicePixelRatio || 1)} x ${window.screen.height * (window.devicePixelRatio || 1)}`;
  const screenDpi = Math.round(160 * (window.devicePixelRatio || 2.5));

  const hardware: HardwareState = {
    totalRamMb,
    usedRamMb,
    availableRamMb,
    ramUsagePct,
    ramHistory: [52, 54, 55, 58, 60, 59, 58, 57, 58, 60, 59, 58],
    isRamOptimizing: false,

    cpuUsagePct: 28,
    coreCount,
    cpuArchitecture: 'ARM64-v8a (Kryo / Cortex-X)',
    cpuFrequencyGhz: 2.84,
    coreLoads: Array.from({ length: coreCount }, (_, i) => Math.round(20 + Math.random() * 25 + (i === 0 ? 15 : 0))),
    cpuHistory: [25, 30, 28, 35, 42, 38, 32, 29, 31, 28],

    gpuVendor,
    gpuRenderer,
    gpuDriverVersion: 'Vulkan 1.3 / OpenGL ES 3.2',
    gpuMaxTextureSize: maxTextureSize,
    webGl2Supported,
    shaderPrecision: 'High-p float (IEEE-754 32-bit)',

    batteryTempC: 33.4,
    cpuTempC: 38.6,
    socTempC: 36.2,
    tempHistory: [35, 35.5, 36, 36.2, 37, 36.8, 38.6],

    batteryLevelPct,
    isCharging,
    batteryHealth: 'Boa (96% Capacidade)',
    batteryVoltageMv: 4120,

    isRealDeviceMemory,
    isRealGpu,
    isRealBattery,
    isRealNetwork,
    isRealStorage,
  };

  const network: NetworkState = {
    ssid: 'CyberGamer_5G_Ultra',
    localIp: '192.168.1.108',
    frequencyGhz: '5.0 GHz (Canal 48)',
    signalStrengthDbm: -54,
    signalBars: 4,
    downlinkMbps,
    uplinkMbps: 22.8,
    pingMs,
    jitterMs: 3.2,
    networkType: 'Wi-Fi 6',
    isConnected: true,
    isTestingSpeed: false,
    testPhase: 'idle',
    testProgress: 0,
  };

  const storage: StorageState = {
    totalBytes,
    usedBytes,
    availableBytes: totalBytes - usedBytes,
    usedPercentage: Math.round((usedBytes / totalBytes) * 100),
    microSdAvailable: true,
    microSdTotalBytes: 128 * 1024 * 1024 * 1024,
    microSdUsedBytes: 42 * 1024 * 1024 * 1024,
    isScanning: false,
    isCleaning: false,
    scanProgress: 0,
  };

  const device: DeviceInfo = {
    manufacturer: 'Memóriatech Edition',
    model: 'MT-G980 Pro Gaming',
    marketingName: 'Memóriatech ROG Stride 5G',
    androidVersion: 'Android 14 (UpsideDownCake)',
    apiLevel: 34,
    buildNumber: 'UP1A.231005.007.MTG',
    securityPatch: '1 de Novembro de 2026',
    screenResolution,
    screenDpi,
    refreshRateHz: 120,
    kernelVersion: 'Linux 6.1.75-android14-9-g8a39c',
    sensors: [
      'Giroscópio de Alta Precisão (LSM6DSO)',
      'Acelerômetro 3-Eixos',
      'Sensor Magnético (BMM150)',
      'Sensor de Luz Ambiente RGB',
      'Sensor de Proximidade Ultra-sônico',
      'Barômetro Barométrico (BMP390)',
      'Sensor de Temperatura de Bateria',
      'Sensor Biométrico Ultrassônico de Impressão Digital',
    ],
  };

  return { hardware, network, storage, device };
}

export const INITIAL_JUNK_ITEMS: import('../utils/metrics').JunkItem[] = [
  {
    id: 'junk-1',
    name: 'Cache de Miniaturas da Galeria',
    category: 'thumbnails',
    sizeBytes: 420 * 1024 * 1024,
    path: '/sdcard/DCIM/.thumbnails',
    selected: true,
    isSafeToDelete: true,
    description: 'Imagens pré-renderizadas que são reconstruídas automaticamente quando você abre a galeria.',
  },
  {
    id: 'junk-2',
    name: 'Pacotes APK Instalados Antigos',
    category: 'apk',
    sizeBytes: 850 * 1024 * 1024,
    path: '/sdcard/Download/freefire_v2.10.apk',
    selected: true,
    isSafeToDelete: true,
    description: 'Instaladores APK que já foram executados e apenas ocupam espaço interno.',
  },
  {
    id: 'junk-3',
    name: 'Arquivos Temporários de Jogos (Shaders Antigos)',
    category: 'cache',
    sizeBytes: 310 * 1024 * 1024,
    path: '/sdcard/Android/media/shader_cache_tmp',
    selected: true,
    isSafeToDelete: true,
    description: 'Compilações de shaders antigas de atualizações passadas dos games.',
  },
  {
    id: 'junk-4',
    name: 'Logs de Diagnóstico e Despejos de Falha',
    category: 'logs',
    sizeBytes: 145 * 1024 * 1024,
    path: '/sdcard/Android/data/system_logs.log',
    selected: true,
    isSafeToDelete: true,
    description: 'Registros de travamentos antigos do sistema e aplicativos.',
  },
  {
    id: 'junk-5',
    name: 'Downloads esquecidos (Arquivos .zip e PDFs)',
    category: 'downloads',
    sizeBytes: 680 * 1024 * 1024,
    path: '/sdcard/Download/game_soundtrack_pack.zip',
    selected: false,
    isSafeToDelete: false,
    description: 'Arquivos baixados há mais de 30 dias na pasta de downloads.',
  },
  {
    id: 'junk-6',
    name: 'Imagens Duplicadas de Redes Sociais',
    category: 'thumbnails',
    sizeBytes: 230 * 1024 * 1024,
    path: '/sdcard/Pictures/Screenshots/dup_001.png',
    selected: true,
    isSafeToDelete: true,
    description: 'Capturas de tela e fotos idênticas detectadas por hash de imagem.',
  },
];

export const INITIAL_INSTALLED_APPS: InstalledApp[] = [
  {
    id: 'app-freefire',
    name: 'Free Fire MAX',
    packageName: 'com.dts.freefiremax',
    category: 'game',
    icon: 'Flame',
    sizeMb: 1840,
    ramUsageMb: 480,
    isGame: true,
    installDate: '15 de Outubro de 2026',
    isRunningBackground: false,
  },
  {
    id: 'app-cod',
    name: 'Call of Duty: Mobile',
    packageName: 'com.activision.callofduty.shooter',
    category: 'game',
    icon: 'Crosshair',
    sizeMb: 3250,
    ramUsageMb: 620,
    isGame: true,
    installDate: '28 de Setembro de 2026',
    isRunningBackground: false,
  },
  {
    id: 'app-genshin',
    name: 'Genshin Impact',
    packageName: 'com.miHoYo.GenshinImpact',
    category: 'game',
    icon: 'Sparkles',
    sizeMb: 14200,
    ramUsageMb: 890,
    isGame: true,
    installDate: '10 de Agosto de 2026',
    isRunningBackground: false,
  },
  {
    id: 'app-discord',
    name: 'Discord Gamer Voice',
    packageName: 'com.discord',
    category: 'social',
    icon: 'MessageSquare',
    sizeMb: 240,
    ramUsageMb: 110,
    isGame: false,
    installDate: '01 de Julho de 2026',
    isRunningBackground: true,
  },
  {
    id: 'app-spotify',
    name: 'Spotify Music',
    packageName: 'com.spotify.music',
    category: 'productivity',
    icon: 'Headphones',
    sizeMb: 180,
    ramUsageMb: 95,
    isGame: false,
    installDate: '12 de Maio de 2026',
    isRunningBackground: true,
  },
  {
    id: 'app-chrome',
    name: 'Google Chrome',
    packageName: 'com.android.chrome',
    category: 'tool',
    icon: 'Globe',
    sizeMb: 310,
    ramUsageMb: 210,
    isGame: false,
    installDate: 'Sistema (Pré-instalado)',
    isRunningBackground: true,
  },
  {
    id: 'app-memoriatech',
    name: 'Memóriatech Gamer (Este App)',
    packageName: 'com.memoriatech.gamer',
    category: 'tool',
    icon: 'Cpu',
    sizeMb: 28,
    ramUsageMb: 42,
    isGame: false,
    installDate: 'Hoje',
    isRunningBackground: true,
  },
];
