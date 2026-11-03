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
    { name: 'Sistema Android', bytes: Math.round(storage.totalBytes * 0.16), color: '#38bdf8' },
    { name: 'Jogos & Aplicativos', bytes: Math.round(storage.usedBytes * 0.58), color: '#a855f7' },
    { name: 'Mídia & Fotos', bytes: Math.round(storage.usedBytes * 0.22), color: '#ec4899' },
    { name: 'Arquivos em Cache', bytes: summary.totalBytes, color: '#f59e0b' },
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

  // Start animated scan of cache, APKs and temporary files
  const handleStartScan = () => {
    soundFx.playRadarPing();
    setIsScanning(true);
    setScanProgress(0);
    setCleanSuccessMessage(null);

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        setIsScanning(false);
        soundFx.playCleanComplete();
        setCleanSuccessMessage(
          `Varredura concluída! ${summary.totalCount} arquivos identificados totalizando ${formatBytes(summary.totalBytes)} prontos para limpeza.`
        );
      } else {
        setScanProgress(current);
      }
    }, 180);
  };

  // Execute cleaning of selected junk items
  const handleConfirmClean = async () => {
    setShowConfirmModal(false);
    setIsCleaning(true);
    soundFx.playGamerBoost();

    const freedBytes = summary.totalSelectedBytes;
    const remainingItems = junkItems.filter((item) => {
      if (selectedCategory === 'all' || item.category === selectedCategory) {
        return !item.selected;
      }
      return true;
    });

    setTimeout(() => {
      setIsCleaning(false);
      onUpdateJunkItems(remainingItems);

      const newUsed = Math.max(0, storage.usedBytes - freedBytes);
      const newAvail = storage.availableBytes + freedBytes;
      onUpdateStorage({
        ...storage,
        usedBytes: newUsed,
        availableBytes: newAvail,
        usedPercentage: Math.round((newUsed / storage.totalBytes) * 100),
      });

      soundFx.playCleanComplete();
      setCleanSuccessMessage(
        `Limpeza executada com sucesso! ${formatBytes(freedBytes)} de espaço em disco foram liberados.`
      );
    }, 600);
  };

  const handleTransferToSdCard = () => {
    soundFx.playClick();
    setSdTransferSuccess(true);
    setTimeout(() => setSdTransferSuccess(false), 5000);
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
              <p className="text-[11px] text-slate-400">Memória Flash UFS 4.0 / Partição Interna</p>
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
                <span>CARTÃO MICROSD EXPANSÍVEL</span>
                <span className="text-[10px] text-emerald-400 font-mono">(128 GB Detectado)</span>
              </span>
              <p className="text-[10px] text-slate-400">
                Transfira arquivos de mídia grandes e downloads para liberar espaço interno
              </p>
            </div>
          </div>

          <button
            onClick={handleTransferToSdCard}
            aria-label="Transferir arquivos para o Cartão MicroSD"
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <ArrowRightLeft size={13} className="text-cyan-400" />
            <span>Transferir p/ SD</span>
          </button>
        </div>

        {sdTransferSuccess && (
          <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={14} />
            <span>Diretório externo mapeado com sucesso para transferência rápida de dados.</span>
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
                Varredura rápida de cache, pacotes APK antigos, miniaturas e logs residuais
              </p>
            </div>
          </div>

          {/* Scan Button */}
          <button
            onClick={handleStartScan}
            disabled={isScanning || isCleaning}
            aria-label="Iniciar varredura de arquivos"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-['Orbitron'] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? `VARRENDO (${scanProgress}%)...` : 'VARREDURA INTELIGENTE'}</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { id: 'all', label: 'Todos os Itens' },
            { id: 'cache', label: 'Temporários' },
            { id: 'apk', label: 'Pacotes APK' },
            { id: 'thumbnails', label: 'Miniaturas' },
            { id: 'logs', label: 'Logs e Despejos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id);
                soundFx.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className="flex items-center gap-2 text-slate-300 hover:text-white font-medium cursor-pointer"
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
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400 opacity-80" />
              <p className="text-xs font-['Rajdhani'] font-bold text-white">Nenhum lixo residual encontrado!</p>
              <p className="text-[10px] text-slate-400">Seu dispositivo está limpo e otimizado para jogos.</p>
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
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white font-['Orbitron'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <Trash2 size={16} />
              <span>{isCleaning ? 'LIMPANDO...' : `LIMPAR SELECIONADOS (${formatBytes(summary.totalSelectedBytes)})`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Android Privacy Notice */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
        <p>
          <strong>Segurança & Proteção de Dados:</strong> O Memóriatech Gamer nunca apaga fotos pessoais, senhas ou dados essenciais do usuário. Apenas arquivos temporários dispensáveis e pacotes de instalação redundantes são alvos da limpeza.
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
                <p className="text-xs text-slate-400">Liberação imediata de armazenamento</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Você está prestes a excluir <strong className="text-white">{summary.selectedCount} itens</strong> selecionados, liberando{' '}
              <strong className="text-cyan-400">{formatBytes(summary.totalSelectedBytes)}</strong> de arquivos temporários e logs desnecessários.
            </p>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 mb-4">
              ✓ Nenhuma foto pessoal, documento importante ou dados de login de contas serão apagados.
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmClean}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-['Orbitron'] font-bold text-xs uppercase shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Confirmar Limpeza
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
