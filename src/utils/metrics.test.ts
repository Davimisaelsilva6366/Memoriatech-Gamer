import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytes,
  formatSpeed,
  calculateMemoryHealth,
  classifyThermalState,
  calculateStorageCategories,
  simulateRamOptimization,
  calculateGameModeStability,
  summarizeJunkItems,
  JunkItem,
} from './metrics';

test('formatBytes formats various sizes accurately', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1048576), '1 MB');
  assert.equal(formatBytes(1073741824), '1 GB');
  assert.equal(formatBytes(2684354560, 2), '2.5 GB');
});

test('formatSpeed formats mbps and kbps properly', () => {
  assert.equal(formatSpeed(0.5), '500 Kbps');
  assert.equal(formatSpeed(120.4), '120.4 Mbps');
});

test('calculateMemoryHealth classifies memory levels correctly', () => {
  const excellent = calculateMemoryHealth(45);
  assert.equal(excellent.status, 'EXCELENTE');
  assert.equal(excellent.score, 55);

  const alert = calculateMemoryHealth(82);
  assert.equal(alert.status, 'ALERTA');

  const critical = calculateMemoryHealth(95);
  assert.equal(critical.status, 'CRÍTICO');
});

test('classifyThermalState handles temperature thresholds', () => {
  const normal = classifyThermalState(32);
  assert.equal(normal.status, 'NORMAL');
  assert.equal(normal.alert, false);

  const warm = classifyThermalState(42);
  assert.equal(warm.status, 'AQUECIDO');
  assert.equal(warm.alert, false);

  const critical = classifyThermalState(58);
  assert.equal(critical.status, 'CRÍTICO');
  assert.equal(critical.alert, true);
});

test('simulateRamOptimization reclaims realistic memory within safe bounds', () => {
  const result = simulateRamOptimization(6000, 8000, 5);
  assert.ok(result.freedMb > 0);
  assert.ok(result.newUsedMb < 6000);
  assert.ok(result.newUsedMb >= 8000 * 0.35); // strictly respects system baseline
});

test('calculateGameModeStability provides index and recommendations', () => {
  const goodStability = calculateGameModeStability(20, 40, 36);
  assert.equal(goodStability.status, 'ÓTIMA');
  assert.ok(goodStability.stabilityPct >= 75);

  const stressed = calculateGameModeStability(90, 95, 52);
  assert.equal(stressed.status, 'INSTÁVEL');
  assert.ok(stressed.stabilityPct < 50);
});

test('summarizeJunkItems aggregates sizes and selection counts accurately', () => {
  const mockJunk: JunkItem[] = [
    {
      id: '1',
      name: 'Cache Temp',
      category: 'cache',
      sizeBytes: 1000,
      path: '/sdcard/Android/data/cache',
      selected: true,
      isSafeToDelete: true,
      description: 'Arquivos temporários',
    },
    {
      id: '2',
      name: 'Old APK',
      category: 'apk',
      sizeBytes: 5000,
      path: '/sdcard/Download/app.apk',
      selected: false,
      isSafeToDelete: true,
      description: 'Pacote instalado',
    },
  ];

  const summaryAll = summarizeJunkItems(mockJunk);
  assert.equal(summaryAll.totalCount, 2);
  assert.equal(summaryAll.selectedCount, 1);
  assert.equal(summaryAll.totalSelectedBytes, 1000);
  assert.equal(summaryAll.totalBytes, 6000);

  const summaryCache = summarizeJunkItems(mockJunk, 'cache');
  assert.equal(summaryCache.totalCount, 1);
  assert.equal(summaryCache.selectedCount, 1);
});
