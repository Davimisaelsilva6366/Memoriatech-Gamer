import React, { useState } from 'react';
import { StorageState, ThemeConfig } from '../types';
import {
  formatBytes,
  JunkItem,
  summarizeJunkItems,
  calculateStorageCategories,
} from '../utils/metrics';
import { CircularGauge } from './CircularGauge';
import {
  Trash2,
  HardDrive,
  FolderSync,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  CheckSquare,
  Square,
  ShieldAlert,
  ArrowRightLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface CleanerViewProps {
  storage: StorageState;
  junkItems: JunkItem[];
  theme: ThemeConfig;
  onUpdateStorage: (newStorage: StorageState) => void;
  onUpdateJunkItems: (items: JunkItem[]) => void;
}

export const CleanerView: React.FC<CleanerViewProps> = ({
  storage,
  junkItems,
  theme,
  onUpdateStorage,
  onUpdateJunkItems,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isCleaning, setIsCleaning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cleanSuccessMessage, setCleanSuccessMessage] = useState<string | null>(null);
  const [sdTransferSuccess, setSdTransferSuccess] = useState(false);

  const summary = summarizeJunkItems(junkItems, selectedCategory);

  // Storage category distribution
  const categories = calculateStorageCategories(storage.totalBytes, [
    { name: 'Jogos & Aplicativos', bytes: Math.round(storage.usedBytes * 0.55), color: '#00f0ff' },
    { name: 'Mídia & Vídeos', bytes: Math.round(storage.usedBytes * 0.25), color: '#a855f7' },
    { name: 'Arquivos Temporários', bytes: summary.totalBytes, color: '#ff2a85' },
    { name: 'Sistema Android 14', bytes: Math.round(storage.usedBytes * 0.15), color: '#94a3b8' },
  ]);

  // Toggle single item selection
  const handleToggleItem = (id: string) => {
    soundFx.playClick();
    onUpdateJunkItems(
      junkItems.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    soundFx.playClick();
    const allSelected = summary.selectedCount === summary.totalCount;
    onUpdateJunkItems(
      junkItems.map((item) => {
        if (selectedCategory === 'all' || item.category === selectedCategory) {
          return { ...item, selected: !allSelected };
        }
        return item;
      })
    );
  };

  // Trigger scanning radar animation
  const handleStartScan = async () => {
    if (isScanning || isCleaning) return;
    setIsScanning(true);
    setScanProgress(0);
    soundFx.playRadarPing();

    for (let i = 1; i <= 10; i++) {
      await new Promise((r) => setTimeout(r, 120));
      setScanProgress(i * 10);
    }

    setIsScanning(false);
    soundFx.playClick();
  };

  // Execute cleaning after user confirmation
  const handleConfirmClean = async () => {
    setShowConfirmModal(false);
    setIsCleaning(true);
    soundFx.playGamerBoost();

    await new Promise((r) => setTimeout(r, 1400));

    const reclaimedBytes = summary.totalSelectedBytes;
    const remainingItems = junkItems.filter((item) => !item.selected);
    onUpdateJunkItems(remainingItems);

    const newUsed = Math.max(storage.totalBytes * 0.3, storage.usedBytes - reclaimedBytes);
    onUpdateStorage({
      ...storage,
      usedBytes: newUsed,
      availableBytes: storage.totalBytes - newUsed,
      usedPercentage: Math.round((newUsed / storage.totalBytes) * 100),
    });

    setIsCleaning(false);
    soundFx.playCleanComplete();
    setCleanSuccessMessage(`Limpeza concluída! ${formatBytes(reclaimedBytes)} liberados no armazenamento.`);
    setTimeout(() => setCleanSuccessMessage(null), 5000);
  };

  // Simulate SD Card Transfer via Android SAF
  const handleTransferToSdCard = () => {
    soundFx.playClick();
    setSdTransferSuccess(true);
    setTimeout(() => setSdTransferSuccess(false), 4000);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Top Storage Status & MicroSD Card Overview */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <HardDrive size={18} />
            </div>
            <div>
              <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                ARMAZENAMENTO DO DISPOSITIVO
              </h3>
              <p className="text-[11px] text-slate-400">Memória Flash UFS 4.0 de Alta Velocidade</p>
            </div>
          </div>
          <span className="font-mono text-xs text-purple-400 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30">
            {formatBytes(storage.availableBytes, 0)} LIVRES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="flex justify-center">
            <CircularGauge
              value={storage.usedPercentage}
              size={120}
              strokeWidth={9}
              color="#a855f7"
              glowColor="rgba(168, 85, 247, 0.5)"
              title="OCUPADO"
              subtitle={`${formatBytes(storage.usedBytes, 1)} / ${formatBytes(storage.totalBytes, 0)}`}
            />
          </div>

          <div className="sm:col-span-2 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Espaço Interno Total:</span>
              <strong className="text-white font-mono">{formatBytes(storage.totalBytes, 0)}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Espaço Utilizado:</span>
              <strong className="text-purple-400 font-mono">
                {formatBytes(storage.usedBytes, 1)} ({storage.usedPercentage}%)
              </strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Espaço Disponível:</span>
              <strong className="text-emerald-400 font-mono">{formatBytes(storage.availableBytes, 1)}</strong>
            </div>

            {/* Category breakdown bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex mt-2">
              {categories.map((c, i) => (
                <div
                  key={i}
                  style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                  title={`${c.category}: ${c.percentage}%`}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 pt-1">
              {categories.map((c, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MicroSD Card Integration & Transfer Action */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-['Rajdhani']">
                <span>CARTÃO MICROSD EXTERNO DETECTADO</span>
                <span className="text-[10px] text-emerald-400 font-mono">(128 GB XC I)</span>
              </span>
              <p className="text-[10px] text-slate-400">
                Livre no SD: {formatBytes(storage.microSdTotalBytes - storage.microSdUsedBytes, 0)} disponíveis
              </p>
            </div>
          </div>

          <button
            onClick={handleTransferToSdCard}
            aria-label="Transferir arquivos para o Cartão MicroSD"
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            <ArrowRightLeft size={13} className="text-cyan-400" />
            <span>Transferir p/ SD</span>
          </button>
        </div>

        {sdTransferSuccess && (
          <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>Seletor de arquivos Android SAF aberto: dados prontos para transferência para o MicroSD.</span>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {cleanSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
          <Sparkles size={16} className="text-emerald-400 shrink-0" />
          <span>{cleanSuccessMessage}</span>
        </div>
      )}

      {/* Smart Cleaner Main Panel */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                CENTRAL DE LIMPEZA INTELIGENTE
              </h3>
              <p className="text-[11px] text-slate-400">
                Varredura de APKs residuais, miniaturas e lixo seguro
              </p>
            </div>
          </div>

          {/* Scan Button */}
          <button
            onClick={handleStartScan}
            disabled={isScanning || isCleaning}
            aria-label="Iniciar varredura de arquivos"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-['Orbitron'] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.3)] active:scale-95 transition-all"
          >
            <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? `VARRENDO (${scanProgress}%)...` : 'ESCANEAR LIXO'}</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { id: 'all', label: 'Todos os Itens' },
            { id: 'apk', label: 'Pacotes APK' },
            { id: 'thumbnails', label: 'Miniaturas' },
            { id: 'cache', label: 'Temporários' },
            { id: 'logs', label: 'Logs e Despejos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id);
                soundFx.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selection Header */}
        <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs mb-3">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2 text-slate-300 hover:text-white font-medium"
          >
            {summary.selectedCount === summary.totalCount && summary.totalCount > 0 ? (
              <CheckSquare size={16} className="text-cyan-400" />
            ) : (
              <Square size={16} className="text-slate-500" />
            )}
            <span>
              Selecionar Todos ({summary.selectedCount}/{summary.totalCount})
            </span>
          </button>

          <div className="text-right">
            <span className="text-slate-400">Total Selecionado: </span>
            <strong className="text-cyan-400 font-mono text-sm">
              {formatBytes(summary.totalSelectedBytes)}
            </strong>
          </div>
        </div>

        {/* Junk Items List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {summary.filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-xs font-['Rajdhani'] font-bold">Nenhum lixo detectado nesta categoria!</p>
              <p className="text-[10px] text-slate-500">Seu armazenamento está limpo e otimizado.</p>
            </div>
          ) : (
            summary.filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  item.selected
                    ? 'bg-slate-900 border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.1)]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.selected ? (
                      <CheckSquare size={18} className="text-cyan-400" />
                    ) : (
                      <Square size={18} className="text-slate-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{item.name}</span>
                      {item.isSafeToDelete && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          SEGURO
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>
                    <span className="text-[9px] font-mono text-slate-500 truncate block mt-0.5 max-w-xs sm:max-w-md">
                      {item.path}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <strong className="text-xs font-mono text-cyan-400">
                    {formatBytes(item.sizeBytes)}
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Clean Action Button */}
        {summary.selectedCount > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowConfirmModal(true);
              }}
              disabled={isCleaning}
              aria-label="Limpar arquivos selecionados"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white font-['Orbitron'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
            >
              <Trash2 size={16} />
              <span>LIMPAR SELECIONADOS ({formatBytes(summary.totalSelectedBytes)})</span>
            </button>
          </div>
        )}
      </div>

      {/* Android 13+ Transparency Notice */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
        <p>
          <strong>Importante sobre Segurança:</strong> O Memóriatech Gamer não apaga dados privados de outros aplicativos ou cache protegido sem autorização explícita do usuário, respeitando rigorosamente as diretrizes de privacidade do Android 13+ e do Google Play.
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <div className="flex items-center gap-3 mb-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-['Orbitron'] font-bold text-sm text-white">CONFIRMAR LIMPEZA</h4>
                <p className="text-xs text-slate-400">Ação irreversível de exclusão de arquivos</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Você está prestes a excluir <strong className="text-white">{summary.selectedCount} itens</strong> selecionados, totalizando{' '}
              <strong className="text-cyan-400">{formatBytes(summary.totalSelectedBytes)}</strong> de arquivos temporários, pacotes APK antigos e logs.
            </p>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 mb-4">
              ✓ Nenhuma foto pessoal, documento importante ou dados de login de contas serão apagados.
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmClean}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-['Orbitron'] font-bold text-xs uppercase shadow-lg shadow-red-600/30"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
