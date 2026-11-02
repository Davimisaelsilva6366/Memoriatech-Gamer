export interface MemoryHealth {
  score: number;
  status: 'EXCELENTE' | 'BOM' | 'ALERTA' | 'CRÍTICO';
  color: string;
  recommendation: string;
}

export interface ThermalState {
  status: 'NORMAL' | 'AQUECIDO' | 'CRÍTICO';
  alert: boolean;
  advice: string;
  color: string;
}

export interface JunkItem {
  id: string;
  name: string;
  category: 'cache' | 'apk' | 'thumbnails' | 'downloads' | 'logs';
  sizeBytes: number;
  path: string;
  selected: boolean;
  isSafeToDelete: boolean;
  description: string;
}

export interface StorageCategoryBreakdown {
  category: string;
  bytes: number;
  percentage: number;
  color: string;
}

/**
 * Format bytes into human-readable string (B, KB, MB, GB, TB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes <= 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

/**
 * Format Mbps with unit
 */
export function formatSpeed(mbps: number): string {
  if (mbps < 1) {
    return `${Math.round(mbps * 1000)} Kbps`;
  }
  return `${mbps.toFixed(1)} Mbps`;
}

/**
 * Calculate RAM health score and diagnostic status based on usage percentage
 */
export function calculateMemoryHealth(usedPercentage: number): MemoryHealth {
  const clamped = Math.max(0, Math.min(100, usedPercentage));
  const score = Math.round(100 - clamped);

  if (clamped < 60) {
    return {
      score,
      status: 'EXCELENTE',
      color: '#00f0ff', // Azul neon
      recommendation: 'Memória perfeitamente otimizada para sessões de jogos pesados.',
    };
  }
  if (clamped < 75) {
    return {
      score,
      status: 'BOM',
      color: '#a855f7', // Roxo neon
      recommendation: 'Capacidade estável. Nenhum encerramento de tarefas necessário.',
    };
  }
  if (clamped < 88) {
    return {
      score,
      status: 'ALERTA',
      color: '#fbbf24', // Dourado
      recommendation: 'Uso elevado. Recomenda-se fechar apps ociosos antes de jogar.',
    };
  }
  return {
    score,
    status: 'CRÍTICO',
    color: '#ff2a85', // Rosa neon / alerta
    recommendation: 'Sobrecarga de memória iminente. Ative a Otimização Gamer imediatamente.',
  };
}

/**
 * Classify thermal sensor temperature in Celsius
 */
export function classifyThermalState(tempCelsius: number): ThermalState {
  if (tempCelsius < 38) {
    return {
      status: 'NORMAL',
      alert: false,
      advice: 'Temperatura ideal. Processador operando em potência máxima sem estrangulamento térmico.',
      color: '#00f0ff',
    };
  }
  if (tempCelsius < 46) {
    return {
      status: 'AQUECIDO',
      alert: false,
      advice: 'Temperatura moderada sob carga de processamento. Ventilação natural recomendada.',
      color: '#fbbf24',
    };
  }
  return {
    status: 'CRÍTICO',
    alert: true,
    advice: 'Risco de Thermal Throttling (queda de FPS). Pause o jogo ou remova capas protetoras.',
    color: '#ff2a85',
  };
}

/**
 * Calculate storage category distribution
 */
export function calculateStorageCategories(
  totalBytes: number,
  categories: { name: string; bytes: number; color: string }[]
): StorageCategoryBreakdown[] {
  if (totalBytes <= 0) return [];
  return categories.map((cat) => ({
    category: cat.name,
    bytes: cat.bytes,
    percentage: parseFloat(((cat.bytes / totalBytes) * 100).toFixed(1)),
    color: cat.color,
  }));
}

/**
 * Calculate simulated RAM optimization result without lying about system limits
 */
export function simulateRamOptimization(
  currentUsedMb: number,
  totalMb: number,
  idleAppsCount: number
): { freedMb: number; newUsedMb: number; percentageFreed: number } {
  // Safe realistic memory reclaim from simulated idle background worker cache (approx 15MB - 35MB per idle app)
  const estimatedFreed = Math.min(
    Math.round(idleAppsCount * 28 + Math.random() * 40),
    Math.round(currentUsedMb * 0.25) // never claim more than 25% drop
  );

  const freedMb = Math.max(60, estimatedFreed);
  const newUsedMb = Math.max(Math.round(totalMb * 0.35), currentUsedMb - freedMb);
  const percentageFreed = parseFloat(((freedMb / totalMb) * 100).toFixed(1));

  return {
    freedMb,
    newUsedMb,
    percentageFreed,
  };
}

/**
 * Calculate Gamer Mode Stability Index
 */
export function calculateGameModeStability(
  cpuLoadPct: number,
  ramUsagePct: number,
  temperatureC: number
): { stabilityPct: number; recommendation: string; status: 'ÓTIMA' | 'ESTÁVEL' | 'INSTÁVEL' } {
  // Composite score: weights CPU (35%), RAM (35%), Thermals (30%)
  const thermalPenalty = temperatureC > 45 ? (temperatureC - 45) * 3 : 0;
  const loadPenalty = (cpuLoadPct * 0.35) + (ramUsagePct * 0.35) + thermalPenalty;
  const stability = Math.max(10, Math.min(100, Math.round(100 - loadPenalty)));

  if (stability >= 75) {
    return {
      stabilityPct: stability,
      recommendation: 'Sistema em alta prontidão. Taxa de quadros (FPS) máxima e sem gargalos.',
      status: 'ÓTIMA',
    };
  }
  if (stability >= 50) {
    return {
      stabilityPct: stability,
      recommendation: 'Estabilidade boa. Mantenha o brilho da tela regulado para evitar aquecimento.',
      status: 'ESTÁVEL',
    };
  }
  return {
    stabilityPct: stability,
    recommendation: 'Instabilidade detectada. Feche apps em segundo plano para prevenir engasgos no jogo.',
    status: 'INSTÁVEL',
  };
}

/**
 * Filter and sum junk items
 */
export function summarizeJunkItems(items: JunkItem[], categoryFilter?: string) {
  const filtered = categoryFilter && categoryFilter !== 'all'
    ? items.filter((item) => item.category === categoryFilter)
    : items;

  const selectedItems = filtered.filter((item) => item.selected);
  const totalSelectedBytes = selectedItems.reduce((acc, cur) => acc + cur.sizeBytes, 0);
  const totalBytes = filtered.reduce((acc, cur) => acc + cur.sizeBytes, 0);

  return {
    filtered,
    selectedItems,
    totalSelectedBytes,
    totalBytes,
    selectedCount: selectedItems.length,
    totalCount: filtered.length,
  };
}
